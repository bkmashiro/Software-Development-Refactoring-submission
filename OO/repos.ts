import { CRUD } from './curd'
import { Book } from './entities/book'
import { Transaction } from './entities/transaction'
import { User } from './entities/user'
import { Dumper, Repository } from './repository-base'

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

export async function getBookByTitle(title: string) {
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

const user = new User()
user.name = 'John'
user.password = '123456'
// userRepo.insert(user)
// new CRUD(userRepo)
//   // .create(user)
//   .find((u) => u.name!.startsWith('J'))
//   .takeFirst()
//   .print()
//   .modify_((u) => (u.name = 'John Doe'))
//   .print('__ALL__')
//   .execute()
// .save()
;(async () => {
  await dumper.init()
  await dumper
    .track(userRepo, 'user')
    .track(bookRepo, 'book')
    .track(transactionRepo, 'trans')
    .load()
})()
