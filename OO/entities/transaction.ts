import { ISerializable } from '../repository-base'

export enum TransactionType {
  /**
   * the bookstore buy a book from a supplier
   */
  BUY = 'BUY',
  /**
   * sell a book to user
   */
  SELL = 'SELL',
}

export class Transaction implements ISerializable<Transaction> {
  id: number
  user_id: number
  book_id: number
  quantity: number
  price_tot?: number
  type?: TransactionType
  created_at: Date = new Date()

  constructor() {}
  serialize: () => string = () => JSON.stringify(this)
  deserialize: (str: string) => Transaction = (str) =>
    JSON.parse(str) as Transaction
}
