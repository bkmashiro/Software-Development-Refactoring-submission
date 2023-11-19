import chalk from 'chalk'
const { Form, Confirm } = require('enquirer')
import { dump } from '../../facade/Misc'
import { getUserByName } from '../../facade/UserFacade'
import { addUser, removeUser, getAllUserNames } from '../../facade/UserFacade'
import { FailMessage, md5, SuccessMessage } from '../../utils'
import { validRoles } from '../../../PO/entities/user'
import { printDropped } from '../../utils/print'

export async function AddUser() {
  const prompt = new Form({
    name: 'user',
    message: 'Please provide the following user information:',
    choices: [
      { name: 'username', message: 'username', initial: 'bakamashiro' },
      { name: 'password', message: 'password', initial: '123456' },
    ],
  })
  const ans = await prompt.run()
  if (
    addUser({
      name: ans.username,
      rawPassword: ans.password,
    })
  ) {
    console.log('Add User Success')
    await dump()
  } else {
    console.log('User exists')
  }
}
export async function DeleteUser() {
  const prompt = new Form({
    name: 'user',
    message: 'Please provide the following user information:',
    choices: [{ name: 'username', message: 'username', initial: 'test' }],
  })
  const ans = await prompt.run()

  const user = await getUserByName(ans.username)

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
      console.log(`User ${ans.username} deleted`)
      await dump()
    } else {
      FailMessage(`User ${ans.username} delete failed`)
    }
  }
}
export async function UpdateUser() {
  const prompt = new Form({
    name: 'user',
    message: 'Please provide the following user information:',
    choices: [{ name: 'username', message: 'username', initial: 'test' }],
  })
  const ans = await prompt.run()

  const user = await getUserByName(ans.username)

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
    ],
  })

  const modifyAns = await modifyPrompt.run()

  if (modifyAns.password) {
    user.password = md5(modifyAns.password)
  }

  if (validRoles.includes(modifyAns.role)) {
    user.role = modifyAns.role
  } else {
    FailMessage(`Invalid role ${modifyAns.role}`)
  }

  await dump()

  SuccessMessage(`User ${user.name} updated`)
}
export async function QueryUser() {
  const prompt = new Form({
    name: 'user',
    message: 'Please provide the following user information:',
    choices: [{ name: 'username', message: 'username', initial: 'test' }],
  })

  const ans = await prompt.run()

  const user = await getUserByName(ans.username)

  if (!user) {
    FailMessage(`User ${ans.username} not exists`)
    return
  }

  printDropped(user)
}
export async function AllUser() {
  const usernames = getAllUserNames()
  for (const username of usernames) {
    console.log(`${chalk.green(username)}`)
  }
}
