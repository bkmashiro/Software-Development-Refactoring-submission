import { about } from '../PO/tui/about.ui'
import { User } from './entities/user'
import { InitRepos } from './facade/Misc'
import { PurchaseIndex } from './tui/basic-user.ui'
import { login } from './tui/login-register.ui'
import { managementIndex } from './tui/management.ui'
import { AddUser } from './tui/operations/UserOps'
import { displayWelcome } from './tui/welcome.ui'
import { FailMessage, SuccessMessage } from './utils'
import { prompt } from 'enquirer'
import { setDebug } from './utils/debug'
import { CRUD } from './curd'
import { Book } from './entities/book'
import { Transaction } from './entities/transaction'
import { Dumper, Repository } from './repository-base'

export const dumper = new Dumper('./data/data.json')
export const userRepo = new Repository(User)
export const bookRepo = new Repository(Book)
export const transactionRepo = new Repository(Transaction)
export const userDto = new CRUD(userRepo)
export const bookDto = new CRUD(bookRepo)
export const transactionDto = new CRUD(transactionRepo)

let loginResult: {
  user?: User
} = {}

function isAdmin() {
  if (!loginResult.user || loginResult.user.role !== 'admin') {
    return false
  }
  return true
}

const choiseBase = [
  { name: 'Help', message: 'Get help' },
  { name: 'About', message: 'About this program' },
  { name: 'Exit', message: 'Exit the program' },
]

const choise_logged_out = [
  { name: 'Login', message: 'Login to your account' },
  { name: 'Register', message: 'Register a new account' },
]

const choise_logged_in = [
  { name: 'Purchase', message: 'Purchase' },
  { name: 'Logout', message: 'Logout' },
]

const choise_admin = [{ name: 'Management', message: 'Management' }]

function getChoises() {
  let choises: any[] = []
  if (isAdmin()) {
    choises = choises.concat(choise_admin)
  }
  if (loginResult.user) {
    choises = choises.concat(choise_logged_in)
  } else {
    choises = choises.concat(choise_logged_out)
  }

  return choises.concat(choiseBase)
}

const handlerMap = {
  Purchase: async () => {
    if (!loginResult.user) {
      FailMessage('You need to login first')
    }
    await PurchaseIndex(loginResult.user!)
  },
  Management: async () => {
    if (isAdmin()) {
      await managementIndex()
    } else {
      FailMessage('You are not authorized to access this page')
    }
  },
  Login: async () => {
    loginResult.user = (await login()) ?? undefined
    console.log(loginResult)
  },
  Register: async () => {
    await AddUser()
  },
  Exit: () => {
    SuccessMessage('Bye!')
  },
  About: about,
  Help: () => {
    FailMessage('Sorry, no help for you')
  },
  Logout: () => {
    loginResult.user = undefined
  },
}

async function main() {
  setDebug(true)
  await InitRepos()
  displayWelcome()

  let ans = { action: '' }
  while (ans.action !== 'Exit') {
    const promptOptions = {
      type: 'select',
      name: 'action',
      message: 'What do you want to do?',
      choices: getChoises(),
    }
    ans = (await prompt(promptOptions)) as { action: string }

    if (handlerMap[ans.action]) {
      await handlerMap[ans.action]()
    }
  }
}

main()
