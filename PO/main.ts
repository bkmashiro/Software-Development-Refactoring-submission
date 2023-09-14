import { load } from "./repository";
import { login } from "./tui/login-register.ui";
import { AddUser, managementIndex } from "./tui/management.ui";
import { displayWelcome } from "./tui/welcome.ui";
import { prompt } from 'enquirer';
import { User } from './entities/user';
import { FailMessage, SuccessMessage, clearScreen } from "./utils";
import { about } from "./tui/about.ui";
import { PurchaseIndex } from "./tui/basic-user.ui";

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
  { name: 'Logout', message: 'Logout' }
]

const choise_admin = [
  { name: 'Management', message: 'Management' },
]

function getChoises() {
  let choises : any[] = []
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

async function main() {
  await load();
  clearScreen()
  displayWelcome();

  let ans = { action: '' }
  while (ans.action !== 'Exit') {
    const promptOptions = {
      type: 'select',
      name: 'action',
      message: 'What do you want to do?',
      choices: getChoises(),
    }
    ans = await prompt(promptOptions) as { action: string }
    switch (ans.action) {
      case 'Purchase':
        if (!loginResult.user) {
          FailMessage('You need to login first')
          break
        }
        await PurchaseIndex(loginResult.user)
        break;
      case 'Management':
        if (isAdmin()) {
          await managementIndex()
        } else {
          FailMessage('You are not authorized to access this page')
        }
        break;
      case 'Login':
        loginResult.user = await login() ?? undefined
        break;
      case 'Register':
        await AddUser()
        break;
      case 'Exit':
        SuccessMessage('Bye!');
        break;
      case 'About':
        about()
        break;
      case 'Help':
        FailMessage('Sorry, no help for you');
        break;
      case 'Logout':
        loginResult.user = undefined
        break;
    }
  }

}


main().catch(e => null)
