import { CRUD } from './curd'
import { Book } from './entities/book'
import { Transaction } from './entities/transaction'
import { User } from './entities/user'
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

export async function makeTransaction(
  user: User,
  book: Book,
  quantity: number
) {
  transactionDto
    .create(
      new Transaction({
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

  userDto
    .find((u: User) => u.id === user.id)
    .takeFirst()
    .modify_((u: User) => {
      u.balance -= book.price * quantity
    })
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

export function addBook(book: {
  isbn: string
  title: string
  author: string
  publisher: string
  price: number
  quantity: number
}) {
  return bookDto.create(new Book(book)).execute()
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

