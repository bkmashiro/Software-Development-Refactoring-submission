import { actions } from '../utils/actions'
import {
  AddUser,
  DeleteUser,
  UpdateUser,
  QueryUser,
  AllUser,
} from './operations/UserOps'
import {
  AddBook,
  DeleteBook,
  UpdateBook,
  QueryBook,
  AllBook,
} from './operations/BookOps'
import { QueryTransaction } from './operations/TransOps'

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

  await actions(
    {
      'User Management': UserManagementIndex,
      'Book Management': BookManagementIndex,
      'Transaction Management': TransactionManagementIndex,
    },
    promptOptions
  )()
}

async function UserManagementIndex() {
  const promptOptions = {
    type: 'select',
    name: 'action',
    message: 'What do you want to do?',
    choices: [
      { name: 'Add User', message: 'Add User' },
      { name: 'Delete User', message: 'Delete User' },
      { name: 'Update User', message: 'Update User' },
      { name: 'Query User', message: 'Query User' },
      { name: 'All User', message: 'All User' },
      { name: 'Back', message: 'Back' },
    ],
  }

  await actions(
    {
      'Add User': AddUser,
      'Delete User': DeleteUser,
      'Update User': UpdateUser,
      'Query User': QueryUser,
      'All User': AllUser,
    },
    promptOptions
  )()
}

async function BookManagementIndex() {
  const promptOptions = {
    type: 'select',
    name: 'action',
    message: 'What do you want to do?',
    choices: [
      { name: 'Add Book', message: 'Add Book' },
      { name: 'Delete Book', message: 'Delete Book' },
      { name: 'Update Book', message: 'Update Book' },
      { name: 'Query Book', message: 'Query Book' },
      { name: 'All Book', message: 'All Book' },
      { name: 'Back', message: 'Back' },
    ],
  }

  await actions(
    {
      'Add Book': AddBook,
      'Delete Book': DeleteBook,
      'Update Book': UpdateBook,
      'Query Book': QueryBook,
      'All Book': AllBook,
    },
    promptOptions
  )()
}

async function TransactionManagementIndex() {
  const promptOptions = {
    type: 'select',
    name: 'action',
    message: 'What do you want to do?',
    choices: [
      { name: 'Query Transaction', message: 'Query Transaction' },
      { name: 'Back', message: 'Back' },
    ],
  }

  await actions(
    {
      'Query Transaction': QueryTransaction,
    },
    promptOptions
  )()
}
