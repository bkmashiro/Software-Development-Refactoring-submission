import { prompt } from 'enquirer'

export function actions(
  actionDict: { [key: string]: () => Promise<void> | void },
  promptOptions
) {
  return async function () {
    let act = { action: '' }
    while (act.action !== 'Back') {
      act = (await prompt(promptOptions)) as { action: string }
      if (actionDict[act.action]) {
        await actionDict[act.action]()
      } else {
        if (act.action !== 'Back') {
          console.error('Unknown action')
        }
      }
    }
  }
}
