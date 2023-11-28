import { Book } from '../entities/book'
import { bookDto } from '../main'

export async function getAllBookNames() {
  return bookDto
    .find((b) => true)
    .execute()
    .value.map((b: Book) => b.title)
}

export async function getOneBookByTitle(title: string) {
  return bookDto.find((b) => b.title === title).execute().value[0]
}
export async function addBook(book: {
  isbn: string
  title: string
  author: string
  publisher: string
  price: number
  quantity: number
}) {
  return bookDto.create(Object.assign(new Book(), book)).execute()
}

export function getBookByTitle(title: string) {
  return bookDto.find((b) => b.title === title).execute().value[0]
}

export function removeBook(id: number) {
  return bookDto.delete(id).execute()
}
