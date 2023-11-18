import { ISerializable } from '../repository-base'

export class Book implements ISerializable<Book> {
  id: number
  isbn: string
  title: string
  author: string
  publisher: string
  price: number
  quantity: number

  public get name(): string {
    return this.title
  }

  constructor() {}
  serialize: () => string = () => JSON.stringify(this)
  deserialize: (str: string) => Book = (str) => JSON.parse(str) as Book
}
