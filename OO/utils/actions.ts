import { prompt } from 'enquirer'

export function actions(
  actionDict: { [key: string]: () => Promise<void> | void },
  promptOptions: (() => object) | object
) {
  return async function () {
    let act = { action: '' }
    let p: any = promptOptions
    while (act.action !== 'Back') {
      if (typeof promptOptions === 'function') {
        p = promptOptions()
      }
      act = (await prompt(p)) as { action: string }
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
