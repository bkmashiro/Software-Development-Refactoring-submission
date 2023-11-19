const { Form } = require('enquirer')
import chalk from 'chalk'
import { dump } from '../../facade/Misc'
import { addBook, getBookByTitle, removeBook } from '../../facade/BookFacade'
import { getAllBookNames } from '../../facade/BookFacade'
import { SuccessMessage, FailMessage } from '../../utils'
import { printDropped } from '../../utils/print'

export async function AddBook() {
  const prompt = new Form({
    name: 'book',
    message: 'Please provide the following book information:',
    choices: [
      { name: 'isbn', message: 'isbn', initial: '1234567890123' },
      { name: 'title', message: 'title', initial: 'test' },
      { name: 'author', message: 'author', initial: 'test' },
      { name: 'publisher', message: 'publisher', initial: 'test' },
      { name: 'price', message: 'price', initial: '1' },
      { name: 'quantity', message: 'quantity', initial: '1' },
    ],
  })
  const ans = await prompt.run()
  const addBookResult = await addBook({
    isbn: ans.isbn,
    title: ans.title,
    author: ans.author,
    publisher: ans.publisher,
    price: Number(ans.price),
    quantity: Number(ans.quantity),
  })
  if (addBookResult.value) {
    SuccessMessage('Add Book Success')
  } else {
    FailMessage('Add Book Failed')
  }
}

export async function DeleteBook() {
  const prompt = new Form({
    name: 'book',
    message: 'Please provide the following book information:',
    choices: [{ name: 'name', message: 'book title', initial: 'test' }],
  })
  const ans = await prompt.run()
  const book = getBookByTitle(ans.name)
  if (!book) {
    FailMessage(`Book ${ans.name} not exists`)
    return
  }

  const deleteBookResult = removeBook(book.id)
  if (deleteBookResult) {
    SuccessMessage(`Book ${ans.name} deleted`)
    await dump()
  } else {
    FailMessage(`Book ${ans.name} delete failed`)
  }
}

export async function UpdateBook() {
  const prompt = new Form({
    name: 'book',
    message: 'Please provide the following book information:',
    choices: [{ name: 'name', message: 'book title', initial: 'test' }],
  })
  const ans = await prompt.run()
  const book = getBookByTitle(ans.name)
  if (!book) {
    FailMessage(`Book ${ans.name} not exists`)
    return
  }

  const modifyPrompt = new Form({
    name: 'book',
    message: 'Please provide the following book information:',
    choices: [
      { name: 'isbn', message: 'isbn', initial: book.isbn },
      { name: 'title', message: 'title', initial: book.title },
      { name: 'author', message: 'author', initial: book.author },
      { name: 'publisher', message: 'publisher', initial: book.publisher },
      { name: 'price', message: 'price', initial: book.price },
      { name: 'quantity', message: 'quantity', initial: book.quantity },
    ],
  })

  const modifyAns = await modifyPrompt.run()

  book.isbn = modifyAns.isbn
  book.title = modifyAns.title
  book.author = modifyAns.author
  book.publisher = modifyAns.publisher
  book.price = Number(modifyAns.price)
  book.quantity = Number(modifyAns.quantity)

  await dump()

  SuccessMessage(`Book ${book.title} updated`)
}

export async function QueryBook() {
  const prompt = new Form({
    name: 'book',
    message: 'Please provide the following book information:',
    choices: [{ name: 'name', message: 'book title', initial: 'test' }],
  })

  const ans = await prompt.run()

  const book = getBookByTitle(ans.name)

  if (!book) {
    FailMessage(`Book ${ans.name} not exists`)
    return
  }

  printDropped(book)
}

export async function AllBook() {
  const books = await getAllBookNames()
  for (const book of books) {
    console.log(`${chalk.green(book)}`)
  }
}
