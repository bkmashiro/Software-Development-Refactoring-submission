enum TransactionType {
  /**
   * the bookstore buy a book from a supplier
   */
  BUY = 'BUY',
  /**
   * sell a book to user
   */
  SELL = 'SELL'
}

export interface Transaction {
  id: number
  user_id: number
  book_id: number
  quantity: number
  price_tot: number
  type: TransactionType
  created_at: Date
}