import { Tire } from './dataStructure/tire'
import { Book } from './entities/book'
import { User, UserLevel, UserRole } from './entities/user'
import { Transaction, TransactionType } from './entities/transaction'
import { promises as fs } from 'fs'
import { md5 } from './utils'
import { LogLevel, log } from './log'
import { discount, level } from './config'

const books: Map<number, Book> = new Map() // this will be serialized
const users: Map<number, User> = new Map() // this will be serialized
const records: Map<number, Transaction> = new Map() // this will be serialized

const bookTire = Tire.createTrieNode<Book>()
const userTire = Tire.createTrieNode<User>()

type createUserDto = Omit<
  User,
  | 'created_at'
  | 'id'
  | 'updated_at'
  | 'password'
  | 'level'
  | 'role'
  | 'tot_expenditure'
  | 'balance'
> & { rawPassword: string }

// USER
export function addUser(user: createUserDto) {
  if (getUserByName(user.name)) {
    log(LogLevel.ERROR, `user ${user.name} already exists`)
    return false
  }

  const id = users.size
  const now = new Date()
  const newUser: User & { rawPassword: any } = {
    ...user,
    password: md5(user.rawPassword),
    id,
    tot_expenditure: 0,
    balance: 0,
    level: UserLevel.NORMAL,
    role: UserRole.USER,
    created_at: now,
    updated_at: now,
  }
  delete newUser.rawPassword
  users.set(newUser.id, newUser)
  Tire.insert<User>(userTire, newUser.name, newUser)
  return true
}

export function removeUser(id: number) {
  const user = users.get(id)
  if (user) {
    users.delete(id)
    Tire.remove<User>(userTire, user.name)
    return true
  }
  return false
}

export function getUserByName(name: string): User | null {
  return Tire.search<User>(userTire, name)
}

export function getUserById(id: number): User | null {
  return users.get(id) ?? null
}

export function getAllUserNames(): string[] {
  return Array.from(users.values()).map((user) => user.name)
}

// BOOK
export function addBook(book: Omit<Book, 'id'>) {
  if (getBookByTitle(book.title)) {
    log(LogLevel.ERROR, `book ${book.title} already exists`)
    return false
  }
  const id = books.size
  const newBook: Book = {
    ...book,
    id,
  }
  books.set(id, newBook)
  Tire.insert<Book>(bookTire, newBook.title, newBook)
  return true
}

export function removeBook(id: number) {
  const book = books.get(id)
  if (book) {
    books.delete(id)
    Tire.remove<Book>(bookTire, book.title)
    return true
  }
  return false
}

export function getBookById(id: number): Book | null {
  return books.get(id) ?? null
}

export function getBookByTitle(title: string): Book | null {
  return Tire.search<Book>(bookTire, title)
}

export function getAllBookNames(): string[] {
  return Array.from(books.values()).map((book) => book.title)
}

//RECORD
export function addRecord(record: Omit<Transaction, 'id' | 'created_at'>) {
  const id = records.size
  const now = new Date()
  const newRecord: Transaction = {
    ...record,
    id,
    created_at: now,
  }
  records.set(id, newRecord)
  log(
    LogLevel.INFO,
    `user ${getUserById(newRecord.user_id)?.name} ${
      newRecord.type === TransactionType.SELL ? 'bought' : 'sold'
    } ${newRecord.quantity} <${getBookById(newRecord.book_id)?.title}>`
  )
}

export function getRecordById(id: number): Transaction | null {
  return records.get(id) ?? null
}

export function getRecordsByUserId(userId: number): Transaction[] {
  return Array.from(records.values()).filter(
    (record) => record.user_id === userId
  )
}

export function getRecordsByBookId(bookId: number): Transaction[] {
  return Array.from(records.values()).filter(
    (record) => record.book_id === bookId
  )
}

export function removeRecord(id: number) {
  const record = records.get(id)
  if (record) {
    records.delete(id)
    return true
  }
  return false
}

function updateUser(user: User) {
  const newLevel = Object.entries(level)
    .filter(([_, value]) => user.tot_expenditure >= value)
    .sort((a, b) => b[1] - a[1])
    .at(0)?.[0] as UserLevel
  if (newLevel && newLevel !== user.level) {
    log(LogLevel.INFO, `user ${user.name} level up to ${newLevel}`)
    user.level = newLevel
  }
}

export function validateUsrPw(username: string, password: string) {
  return getUserByName(username)?.password === md5(password)
}

export function makeTransaction(user: User, book: Book, quantity: number) {
  const { level } = user
  const discountRate = discount[level]
  const price_tot = book.price * quantity * discountRate
  const newBalance = user.balance - price_tot
  if (newBalance < 0) {
    log(LogLevel.ERROR, `user ${user.name} has insufficient balance`)
    return false
  }
  user.balance = newBalance
  user.tot_expenditure += price_tot
  log(LogLevel.INFO, `user ${user.name} balance decreased by ${price_tot}`)
  addRecord({
    user_id: user.id,
    book_id: book.id,
    quantity,
    price_tot,
    type: TransactionType.SELL,
  })

  updateUser(user)
}

function serialize(): string {
  return JSON.stringify({
    books: Array.from(books.values()),
    users: Array.from(users.values()),
    records: Array.from(records.values()),
  })
}

function deserialize(data: string): boolean {
  try {
    const {
      books: bookData,
      users: userData,
      records: recordData,
    } = JSON.parse(data)
    for (const book of bookData) {
      books.set(book.id, book)
      Tire.insert<Book>(bookTire, book.title, book)
    }
    for (const user of userData) {
      users.set(user.id, user)
      Tire.insert<User>(userTire, user.name, user)
    }
    for (const record of recordData) {
      records.set(record.id, record)
    }

    return true
  } catch (e) {
    return false
  }
}

export async function dump(filename: string = './data/main.json') {
  try {
    await fs.writeFile(filename, serialize())
    log(
      LogLevel.INFO,
      `successfully dump to ${filename}, ${books.size} books, ${users.size} users, ${records.size} records`
    )
  } catch {
    log(LogLevel.ERROR, 'dump failed')
  }
}

export async function load(filename: string = './data/main.json') {
  try {
    const data = await fs.readFile(filename, 'utf-8')
    if (deserialize(data)) {
      log(
        LogLevel.INFO,
        `successfully load from ${filename}, ${books.size} books, ${users.size} users, ${records.size} records`
      )
    } else {
      log(LogLevel.ERROR, 'load failed')
    }
  } catch {
    log(LogLevel.ERROR, 'load failed')
  }
}
