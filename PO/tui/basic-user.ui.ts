import { User } from "../entities/user";
import { dump, getAllBookNames, getBookByTitle, makeTransaction } from "../repository";
import { FailMessage, SuccessMessage } from "../utils";
const { AutoComplete } = require('enquirer');

export async function PurchaseIndex(user: User) {
  const books = getAllBookNames()
  const prompt = new AutoComplete({
    name: 'book',
    message: 'Pick the book you want to purchase',
    limit: 10,
    initial: 2,
    choices: books
  });
  
  const ans = await prompt.run()

  console.log(`You picked ${ans}`)

  const book = getBookByTitle(ans)
  if (!book) {
    FailMessage('Book not found')
    return
  }

  if (book?.quantity <= 0) {
    FailMessage('Book out of stock')
    return
  }

  const quantityPrompt = {
    type: 'numeral',
    name: 'quantity',
    message: 'How many do you want to purchase?',
    min: 1,
    max: book.quantity,
    initial: 1
  }

  const quantityAns = await prompt(quantityPrompt) as { quantity: number }

  console.log(`You want to purchase ${quantityAns.quantity} of <${book.title}>`)

  const confirmPrompt = {
    type: 'confirm',
    name: 'confirm',
    message: 'Confirm purchase?',
    initial: true
  }

  const confirmAns = await prompt(confirmPrompt) as { confirm: boolean }

  if (confirmAns.confirm) {
    console.log('Purchase confirmed')
    makeTransaction(user, book, quantityAns.quantity)
    await dump()
    SuccessMessage('Purchase successful')
  }
}