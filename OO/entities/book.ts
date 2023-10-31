import { ISerializable } from '../repository-base'

export class Book implements ISerializable<Book> {
  id: number = Math.floor(Math.random() * 100000000)
  isbn: string
  title: string
  author: string
  publisher: string
  price: number
  quantity: number

  public get name(): string {
    return this.title
  }

  constructor(book : {
    isbn: string
    title: string
    author: string
    publisher: string
    price: number
    quantity: number
  }) {
    this.isbn = book.isbn
    this.title = book.title
    this.author = book.author
    this.publisher = book.publisher
    this.price = book.price
    this.quantity = book.quantity
  }
  serialize: () => string = () => JSON.stringify(this)
  deserialize: (str: string) => Book = (str) => JSON.parse(str) as Book
}
