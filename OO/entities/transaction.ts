import { ISerializable } from "../repository-base"

export enum TransactionType {
  /**
   * the bookstore buy a book from a supplier
   */
  BUY = 'BUY',
  /**
   * sell a book to user
   */
  SELL = 'SELL'
}

export class Transaction implements ISerializable<Transaction> {
  id: number
  user_id: number
  book_id: number
  quantity: number
  price_tot: number
  type: TransactionType
  created_at: Date

  constructor(id: number, user_id: number, book_id: number, quantity: number, price_tot: number, type: TransactionType, created_at: Date) {
    this.id = id
    this.user_id = user_id
    this.book_id = book_id
    this.quantity = quantity
    this.price_tot = price_tot
    this.type = type
    this.created_at = created_at
  }
  serialize: () => string = () => JSON.stringify(this)
  deserialize: (str: string) => Transaction = (str) => JSON.parse(str) as Transaction
}