import { CRUD } from './curd'
import { Book } from './entities/book'
import { Transaction } from './entities/transaction'
import { User, UserLevel } from './entities/user'
import { Dumper, Repository } from './repository-base'
import { md5 } from './utils'

export const dumper = new Dumper('./data/data.json')
export const userRepo = new Repository(User)
export const bookRepo = new Repository(Book)
export const transactionRepo = new Repository(Transaction)
export const userDto = new CRUD(userRepo)
export const bookDto = new CRUD(bookRepo)
export const transactionDto = new CRUD(transactionRepo)

export async function getAllBookNames() {
  return bookDto
    .find((b) => true)
    .execute()
    .value.map((b: Book) => b.title)
}

export async function getOneBookByTitle(title: string) {
  return bookDto.find((b) => b.title === title).execute().value[0]
}

export const discount = {
  normal: 1,
  gold: 0.9,
  platinum: 0.8,
}

export const level = {
  normal: 0,
  gold: 1000,
  platinum: 10000,
}

export async function makeTransaction(
  user: User,
  book: Book,
  quantity: number
) {
  // check balance
  const balance = user.balance
  const quantityInStock = book.quantity
  if (quantityInStock < quantity) {
    throw new Error('Insufficient quantity')
  }
  const price = book.price
  const discountRate = discount[user.level]
  if (balance < price * quantity * discountRate) {
    throw new Error('Insufficient balance')
  }

  transactionDto
    .create(
      Object.assign(new Transaction(), {
        user_id: user.id,
        book_id: book.id,
        quantity,
      })
    )
    .execute()

  bookDto
    .find((b: Book) => b.id === book.id)
    .takeFirst()
    .modify_((b: Book) => {
      b.quantity -= quantity
    })

  // update user level
  const newLevel = Object.entries(level)
    .filter(([_, value]) => user.tot_expenditure >= value)
    .sort((a, b) => b[1] - a[1])
    .at(0)?.[0] as keyof typeof level

  if (newLevel && newLevel !== user.level) {
    user.level = newLevel as UserLevel
  }

  userDto
    .find((u: User) => u.id === user.id)
    .takeFirst()
    .modify_((u: User) => {
      u.balance -= book.price * quantity * discountRate
      u.tot_expenditure += book.price * quantity * discountRate
      u.level = newLevel as UserLevel
    })


  await dump()
}

export async function dump() {
  return await dumper.dump()
}

export async function getUserByName(name: string) {
  return userDto.find((u) => u.name === name).execute().value[0]
}

export function validateUsrPw(name: string, password: string) {
  return (
    userDto.find((u) => u.name === name && u.password === password).execute()
      .value.length > 0
  )
}

export async function addBook(book: {
  isbn: string
  title: string
  author: string
  publisher: string
  price: number
  quantity: number
}) {
  return bookDto.create(
    Object.assign(new Book(), book)
  ).execute()
}

export function addUser(user: { name: string; rawPassword: string }) {
  if (userDto.find((u) => u.name === user.name).execute().value.length > 0) {
    return false
  }
  const u = new User()
  u.name = user.name
  u.password = md5(user.rawPassword)
  userDto.create(u).execute()
  return true
}

export function addTransaction(transaction: Transaction) {
  transactionDto.create(transaction).execute()
}

export function removeBook(id: number) {
  return bookDto.delete(id).execute()
}

export function removeUser(id: number) {
  return userDto.delete(id).execute()
}

export function getAllUserNames() {
  return userDto
    .find((u) => true)
    .execute()
    .value.map((u: User) => u.name)
}

export function getBookByTitle(title: string) {
  return bookDto.find((b) => b.title === title).execute().value[0]
}

export function getUserById(id: number) {
  return userDto.find((u) => u.id === id).execute().value[0]
}

export function getRecordById(id: number) {
  return transactionDto.find((t) => t.id === id).execute().value[0]
}

export async function InitRepos() {
  await dumper.init()
  await dumper
    .track(userRepo, 'user')
    .track(bookRepo, 'book')
    .track(transactionRepo, 'trans')
    .load()
}
