import { prompt } from 'enquirer';
import { addBook, addUser, dump, getBookByTitle, getRecordById, getUserByName, removeBook, removeUser } from '../repository';
import { FailMessage, SuccessMessage, md5 } from '../utils';
import chalk from 'chalk';
const { Form, Confirm, NumberPrompt } = require('enquirer');

export async function managementIndex() {
  const promptOptions = {
    type: 'select',
    name: 'action',
    message: 'What do you want to do?',
    choices: [
      { name: 'User Management', message: 'User Management' },
      { name: 'Book Management', message: 'Book Management' },
      { name: 'Transaction Management', message: 'Transaction Management' },
      { name: 'Back', message: 'Back' },
    ],
  }

  const act = await prompt(promptOptions) as { action: string }
  switch (act.action) {
    case 'User Management':
      await UserManagement()
      break;
    case 'Book Management':
      await BookManagement()
      break;
    case 'Transaction Management':
      await TransactionManagement()
      break;
    case 'Back':
      break;
  }
}

async function UserManagement() {
  const promptOptions = {
    type: 'select',
    name: 'action',
    message: 'What do you want to do?',
    choices: [
      { name: 'Add User', message: 'Add User' },
      { name: 'Delete User', message: 'Delete User' },
      { name: 'Update User', message: 'Update User' },
      { name: 'Query User', message: 'Query User' },
      { name: 'Back', message: 'Back' },
    ],
  }
  let act = { action: '' }
  while (act.action !== 'Back') {
    act = await prompt(promptOptions) as { action: string }
    switch (act.action) {
      case 'Add User':
        await AddUser();
        break;
      case 'Delete User':
        await DeleteUser()
        break;
      case 'Update User':
        await UpdateUser()
        break;
      case 'Query User':
        await QueryUser()
        break;
      case 'Back':
        break;
    }
  }
}

async function AddUser() {
  const prompt = new Form({
    name: 'user',
    message: 'Please provide the following user information:',
    choices: [
      { name: 'username', message: 'username', initial: 'bakamashiro' },
      { name: 'password', message: 'password', initial: '123456' },
    ]
  });
  const ans = await prompt.run()
  if (addUser({
    name: ans.username,
    rawPassword: ans.password,
  })) {
    console.log('Add User Success');
    dump()
  } else {
    console.log('User exists');
  }
}

async function DeleteUser() {
  const prompt = new Form({
    name: 'user',
    message: 'Please provide the following user information:',
    choices: [
      { name: 'username', message: 'username', initial: 'test' },
    ]
  });
  const ans = await prompt.run()

  const user = getUserByName(ans.username)

  if (!user) {
    FailMessage(`User ${ans.username} not exists`)
    return
  }

  const confirmPrompt = new Confirm({
    name: 'question',
    message: `Are you sure to delete user ${ans.username}?`,
  })

  const confirm = await confirmPrompt.run()

  if (confirm) {
    if (removeUser(user.id)) {
      console.log(`User ${ans.username} deleted`);
      dump()
    } else {
      FailMessage(`User ${ans.username} delete failed`)
    }
  }

}

async function UpdateUser() {
  const prompt = new Form({
    name: 'user',
    message: 'Please provide the following user information:',
    choices: [
      { name: 'username', message: 'username', initial: 'test' },
    ]
  });
  const ans = await prompt.run()

  const user = getUserByName(ans.username)

  if (!user) {
    FailMessage(`User ${ans.username} not exists`)
    return
  }

  const modifyPrompt = new Form({
    name: 'user',
    message: 'Please provide the following user information:',
    choices: [
      { name: 'username', message: 'username', initial: user.name },
      { name: 'password', message: 'password', initial: '' },
      { name: 'role', message: 'role(admin, user)', initial: user.role },
    ]
  });

  const modifyAns = await modifyPrompt.run()

  if (modifyAns.password) {
    user.password = md5(modifyAns.password)
  }

  if (modifyAns.role in ['admin', 'user']) {
    user.role = modifyAns.role
  } else {
    FailMessage(`Invalid role ${modifyAns.role}`)
  }

  dump()

  SuccessMessage(`User ${user.name} updated`)
}

async function QueryUser() {
  const prompt = new Form({
    name: 'user',
    message: 'Please provide the following user information:',
    choices: [
      { name: 'username', message: 'username', initial: 'test' },
    ]
  });
  const ans = await prompt.run()

  const user = getUserByName(ans.username)

  if (!user) {
    FailMessage(`User ${ans.username} not exists`)
    return
  }

  for (const [key, value] of Object.entries(user)) {
    console.log(`${chalk.green(key.padStart(16))}\: ${chalk.yellow(value)}`)
  }
}

async function BookManagement() {
  const promptOptions = {
    type: 'select',
    name: 'action',
    message: 'What do you want to do?',
    choices: [
      { name: 'Add Book', message: 'Add Book' },
      { name: 'Delete Book', message: 'Delete Book' },
      { name: 'Update Book', message: 'Update Book' },
      { name: 'Query Book', message: 'Query Book' },
      { name: 'Back', message: 'Back' },
    ],
  }
  let act = { action: '' }
  while (act.action !== 'Back') {
    act = await prompt(promptOptions) as { action: string }
    switch (act.action) {
      case 'Add Book':
        await AddBook()
        break;
      case 'Delete Book':
        await DeleteBook()
        break;
      case 'Update Book':
        await UpdateBook()
        break;
      case 'Query Book':
        await QueryBook()
        break;
      case 'Back':
        break;
    }
  }
}

async function AddBook() {
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
    ]
  });
  const ans = await prompt.run()
  const addBookResult = addBook({
    isbn: ans.isbn,
    title: ans.title,
    author: ans.author,
    publisher: ans.publisher,
    price: Number(ans.price),
    quantity: Number(ans.quantity),
  });
  if (addBookResult) {
    SuccessMessage('Add Book Success')
    dump()
  } else {
    FailMessage('Add Book Failed')
  }
}

async function DeleteBook() {
  const prompt = new Form({
    name: 'book',
    message: 'Please provide the following book information:',
    choices: [
      { name: 'name', message: 'book title', initial: 'test' },
    ]
  });
  const ans = await prompt.run()
  const book = getBookByTitle(ans.name)
  if (!book) {
    FailMessage(`Book ${ans.name} not exists`)
    return
  }

  const deleteBookResult = removeBook(book.id)
  if (deleteBookResult) {
    SuccessMessage(`Book ${ans.name} deleted`)
    dump()
  } else {
    FailMessage(`Book ${ans.name} delete failed`)
  }
}

async function UpdateBook() {
  const prompt = new Form({
    name: 'book',
    message: 'Please provide the following book information:',
    choices: [
      { name: 'name', message: 'book title', initial: 'test' },
    ]
  });
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
    ]
  });

  const modifyAns = await modifyPrompt.run()

  book.isbn = modifyAns.isbn
  book.title = modifyAns.title
  book.author = modifyAns.author
  book.publisher = modifyAns.publisher
  book.price = Number(modifyAns.price)
  book.quantity = Number(modifyAns.quantity)

  dump()

  SuccessMessage(`Book ${book.title} updated`)

}

async function QueryBook() {
  const prompt = new Form({
    name: 'book',
    message: 'Please provide the following book information:',
    choices: [
      { name: 'name', message: 'book title', initial: 'test' },
    ]
  });

  const ans = await prompt.run()

  const book = getBookByTitle(ans.name)

  if (!book) {
    FailMessage(`Book ${ans.name} not exists`)
    return
  }

  for (const [key, value] of Object.entries(book)) {
    console.log(`${chalk.green(key.padStart(16))}\: ${chalk.yellow(value)}`)
  }
}

async function TransactionManagement() {
  const promptOptions = {
    type: 'select',
    name: 'action',
    message: 'What do you want to do?',
    choices: [
      { name: 'Query Transaction', message: 'Query Transaction' },
      { name: 'Back', message: 'Back' },
    ],
  }
  
  let act = { action: '' }

  while (act.action !== 'Back') {
    act = await prompt(promptOptions) as { action: string }
    switch (act.action) {
      case 'Query Transaction':
        await QueryTransaction()
        break;
      case 'Back':
        break;
    }
  }
}

async function QueryTransaction() {
  const prompt = new NumberPrompt({
    name: 'transaction',
    message: 'Please provide the following transaction information:',
  });

  const ans = await prompt.run()

  const transaction = getRecordById(Number(ans))

  if (!transaction) {
    FailMessage(`Transaction ${ans} not exists`)
    return
  }

  for (const [key, value] of Object.entries(transaction)) {
    console.log(`${chalk.green(key.padStart(16))}: ${chalk.yellow(value)}`)
  }
}
