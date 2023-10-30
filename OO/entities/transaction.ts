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
  id = Math.floor(Math.random() * 100000000)
  user_id: number
  book_id: number
  quantity: number
  price_tot?: number
  type?: TransactionType
  created_at: Date = new Date()

  constructor(
    o: Partial<{
      user_id: number
      book_id: number
      quantity: number
      price_tot: number
      type: TransactionType
    }>
  ) {
    this.user_id = o.user_id!
    this.book_id = o.book_id!
    this.quantity = o.quantity!
  }
  serialize: () => string = () => JSON.stringify(this)
  deserialize: (str: string) => Transaction = (str) =>
    JSON.parse(str) as Transaction
}
