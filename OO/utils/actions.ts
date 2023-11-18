// let act = { action: '' }
//   while (act.action !== 'Back') {
//     act = await prompt(promptOptions) as { action: string }
//     switch (act.action) {
//       case 'User Management':
//         await UserManagement()
//         break;
//       case 'Book Management':
//         await BookManagement()
//         break;
//       case 'Transaction Management':
//         await TransactionManagement()
//         break;
//       case 'Back':
//         break;
//       default:
//         console.log('Unknown action')
//         break;
//     }
//   }
import { prompt } from 'enquirer';

export function actions(actionDict: { [key: string]: () => Promise<void> }, promptOptions) {
  return async function () {
    let act = { action: '' }
    while (act.action !== 'Back') {
      act = await prompt(promptOptions) as { action: string }
      if (actionDict[act.action]) {
        await actionDict[act.action]()
      } else {
        console.log('Unknown action')
      }
    }
  }
}