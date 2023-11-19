import { dump } from './Misc'
import { discount, level } from '../config'
import { Book } from '../entities/book'
import { Transaction } from '../entities/transaction'
import { User, UserLevel } from '../entities/user'
import { transactionDto, bookDto, userDto } from '../main'

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
    .modifyInplace((b: Book) => {
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
    .modifyInplace((u: User) => {
      u.balance -= book.price * quantity * discountRate
      u.tot_expenditure += book.price * quantity * discountRate
      u.level = newLevel as UserLevel
    })

  await dump()
}

export function addTransaction(transaction: Transaction) {
  transactionDto.create(transaction).execute()
}

export function getRecordById(id: number) {
  return transactionDto.find((t) => t.id === id).execute().value[0]
}
