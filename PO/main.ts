import { load } from "./repository";
import { login } from "./tui/login-register.ui";
import { managementIndex } from "./tui/management.ui";
import { displayWelcome } from "./tui/welcome.ui";
import { prompt } from 'enquirer';
import { User } from './entities/user';
import { FailMessage } from "./utils";

let loginResult : {
  user?: User
} = {}

function isAdmin() {
  if (!loginResult.user || loginResult.user.role !== 'admin') {
    return false
  }
  return true
}

async function main() {
  await load();

  displayWelcome();

  // prompt: login / register / exit / help / about
  const promptOptions = {
    type: 'select',
    name: 'action',
    message: 'What do you want to do?',
    choices: [
      { name: 'Purchase', message: 'Purchase' },
      { name: 'Management', message: 'Management' },
      { name: 'Login', message: 'Login to your account' },
      { name: 'Register', message: 'Register a new account' },
      { name: 'Help', message: 'Get help' },
      { name: 'About', message: 'About this program' },
      { name: 'Exit', message: 'Exit the program' },
    ],
  }

  let ans = { action: '' }
  while(ans.action !== 'Exit') {
    ans = await prompt(promptOptions) as { action: string }
    switch (ans.action) {
      case 'Purchase':
        console.log('Purchase');
        break;
      case 'Management':
        if (isAdmin()){
          await managementIndex()
        } else {
          FailMessage('You are not authorized to access this page')
          console.log('@@');
        }
        break;
      case 'Login':
        loginResult.user = await login() ?? undefined;
        break;
      case 'Register':
        console.log('Register');
        break;
      case 'Exit':
        console.log('Exit');
        break;
      case 'Help':
        console.log('Help');
        break;
      case 'About':
        console.log('About');
        break;
    }
  }
  
}


main()
