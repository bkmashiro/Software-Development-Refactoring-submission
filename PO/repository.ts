import { Tire } from './dataStructure/tire';
import { Book } from "./entities/book";
import { User } from "./entities/user";
import { Transaction } from './entities/transaction';
import { promises as fs } from 'fs'
import { md5 } from './utils';

const books: Map<number, Book> = new Map() // this will be serialized
const users: Map<number, User> = new Map() // this will be serialized
const records: Map<number, Transaction> = new Map() // this will be serialized

const bookTire = Tire.createTrieNode<Book>()
const userTire = Tire.createTrieNode<User>()

// USER
export function addUser(user: Omit<User, 'created_at' | 'id' | 'updated_at' | 'password'> & { rawPassword: string }) {
  const id = users.size
  const now = new Date()
  const newUser: User = {
    ...user,
    password: md5(user.rawPassword),
    id,
    created_at: now,
    updated_at: now
  }
  users.set(newUser.id, newUser)
  Tire.insert<User>(userTire, newUser.name, newUser)
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

export function getUserByName(name: string): User | undefined {
  const user = Tire.search<User>(userTire, name)
  if (user) {
    return user
  }
  return undefined
}

export function getUserById(id: number): User | undefined {
  const user = users.get(id)
  if (user) {
    return user
  }
  return undefined
}

// BOOK
export function addBook(book: Omit<Book, 'id'>) {
  const id = books.size
  const newBook: Book = {
    ...book,
    id
  }
  books.set(id, newBook)
  Tire.insert<Book>(bookTire, newBook.title, newBook)
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

export function getBookById(id: number): Book | undefined {
  const book = books.get(id)
  if (book) {
    return book
  }
  return undefined
}

export function getBookByTitle(title: string): Book | undefined {
  const book = Tire.search<Book>(bookTire, title)
  if (book) {
    return book
  }
  return undefined
}

//RECORD
export function addRecord(record: Omit<Transaction, 'id' | 'created_at'>) {
  const id = records.size
  const now = new Date()
  const newRecord: Transaction = {
    ...record,
    id,
    created_at: now
  }
  records.set(id, newRecord)
}

export function getRecordById(id: number): Transaction | undefined {
  const record = records.get(id)
  if (record) {
    return record
  }
  return undefined
}

export function getRecordsByUserId(userId: number): Transaction[] {
  return Array.from(records.values()).filter(record => record.user_id === userId)
}

export function getRecordsByBookId(bookId: number): Transaction[] {
  return Array.from(records.values()).filter(record => record.book_id === bookId)
}

export function removeRecord(id: number) {
  const record = records.get(id)
  if (record) {
    records.delete(id)
    return true
  }
  return false
}



function serialize(): string {
  return JSON.stringify({
    books: Array.from(books.values()),
    users: Array.from(users.values()),
    records: Array.from(records.values())
  })
}

function deserialize(data: string): boolean {
  try {
    const { books: bookData, users: userData, records: recordData } = JSON.parse(data)
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

export async function dump(filename: string) {
  await fs.writeFile(filename, serialize())
}

export async function load(filename: string) {
  deserialize(await fs.readFile(filename, 'utf-8'))
}