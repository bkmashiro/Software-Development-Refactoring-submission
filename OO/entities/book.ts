import { ISerializable } from "../repository-base"

export class Book implements ISerializable<Book> {
  id: number
  isbn: string
  title: string
  author: string
  publisher: string
  price: number
  quantity: number
  
  public get name() : string {
    return this.title
  }
  
  constructor(id: number, isbn: string, title: string, author: string, publisher: string, price: number, quantity: number) {
    this.id = id
    this.isbn = isbn
    this.title = title
    this.author = author
    this.publisher = publisher
    this.price = price
    this.quantity = quantity
  }  
  serialize: () => string = () => JSON.stringify(this)
  deserialize: (str: string) => Book = (str) => JSON.parse(str) as Book
}