import { User } from '../entities/user'
import { dump } from '../facade/Misc'
import { makeTransaction } from '../facade/TransFacade'
import { getAllBookNames, getOneBookByTitle } from '../facade/BookFacade'
import { FailMessage, SuccessMessage } from '../utils'
const { AutoComplete, NumberPrompt, prompt } = require('enquirer')

export async function PurchaseIndex(user: User) {
  const books = await getAllBookNames()
  if (books.length === 0) {
    FailMessage('No books available')
    return
  }

  const promp = new AutoComplete({
    name: 'book',
    message: 'Pick the book you want to purchase',
    limit: books.length,
    initial: 0,
    choices: books,
  })

  const ans = await promp.run()
  const book = await getOneBookByTitle(ans)

  SuccessMessage(`You picked ${ans}, remaining quantity: ${book?.quantity}`)

  if (!book) {
    FailMessage('Book not found')
    return
  }

  if (book?.quantity <= 0) {
    FailMessage('Book out of stock')
    return
  }

  const quantityPrompt = new NumberPrompt({
    name: 'number',
    message: 'Please enter a number',
  })

  const quantityAns = await quantityPrompt.run()

  const confirmPrompt = {
    type: 'confirm',
    name: 'confirm',
    message: 'Confirm purchase?',
    initial: true,
  }

  const confirmAns = (await prompt(confirmPrompt)) as { confirm: boolean }

  if (confirmAns.confirm) {
    console.log('Purchase confirmed')
    try {
      await makeTransaction(user, book, Number(quantityAns))
    } catch (e: any) {
      FailMessage(e.message)
      return
    }
    await dump()
    SuccessMessage('Purchase successful')
  }
}
