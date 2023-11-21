import { User } from './entities/user'
import { InitRepos } from './facade/Misc'
import { PurchaseIndex } from './tui/basic-user.ui'
import { login } from './tui/login-register.ui'
import { managementIndex } from './tui/management.ui'
import { AddUser } from './tui/operations/UserOps'
import { displayWelcome } from './tui/welcome.ui'
import { FailMessage, SuccessMessage } from './utils'
import { CRUD } from './curd'
import { Book } from './entities/book'
import { Transaction } from './entities/transaction'
import { Dumper, Repository } from './repository-base'
import {
  choise_admin as choice_admin,
  choise_logged_in as choice_logged_in,
  choise_logged_out as choice_logged_out,
  choiseBase,
} from './choice-constants'
import { actions } from './utils/actions'
import { debug, setDebug } from './utils/debug'

export const dumper = new Dumper('./data/data.json')
export const userRepo = new Repository(User)
export const bookRepo = new Repository(Book)
export const transactionRepo = new Repository(Transaction)
export const userDto = new CRUD(userRepo)
export const bookDto = new CRUD(bookRepo)
export const transactionDto = new CRUD(transactionRepo)

let lr: {
  user?: User,
  [key: string]: any
} = {}

const getLr = () => lr

function isAdmin() {
  debug('is admin ', lr)
  return lr.user?.role === 'admin'
}

function getChoises() {
  let choises: {
    name: string
    message: string
  }[] = []
  if (isAdmin()) {
    choises = choises.concat(choice_admin)
  }
  if (lr.user) {
    choises = choises.concat(choice_logged_in)
  } else {
    choises = choises.concat(choice_logged_out)
  }

  return choises.concat(choiseBase)
}

const handlerMap = {
  Purchase: async () => {
    if (!lr.user) {
      FailMessage('You need to login first')
    }
    await PurchaseIndex(lr.user!)
  },
  Management: async () => {
    if (isAdmin()) {
      await managementIndex()
    } else {
      FailMessage('You are not authorized to access this page')
    }
  },
  Login: async () => {
    lr.user = (await login())
  },
  Register: async () => {
    await AddUser()
  },
  Exit: () => {
    SuccessMessage('Bye!')
    process.exit(0)
  },
  Help: () => {
    FailMessage('WIP! Not implemented yet')
  },
  Logout: () => {
    lr.user = undefined
  },
}

async function main() {
  // setDebug(true)

  await InitRepos()

  displayWelcome()

  const promptOptions = () => ({
    type: 'select',
    name: 'action',
    message: 'What do you want to do?',
    choices: getChoises(),
  })

  await actions(handlerMap, promptOptions)()

  debug(`lr2`, lr)
}

main().catch((e) => {
  console.error(e)
})
