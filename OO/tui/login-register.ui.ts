import chalk from 'chalk'
import { getUserByName, validateUsrPw } from '../facade/UserFacade'
import { clearScreen, md5 } from '../utils'
import { centerText } from './welcome.ui'
const { AuthPrompt } = require('enquirer')

export async function login() {
  let _uname = '' // this is dirty, but I don't know how to pass the value out
  function authenticate(value: { username: any; password: any }, state: any) {
    if (validateUsrPw(value.username, md5(value.password))) {
      _uname = value.username
      return true
    }
    return false
  }

  const CustomAuthPrompt = AuthPrompt.create(authenticate)

  const prompt = new CustomAuthPrompt({
    name: 'password',
    message: 'Please enter your password',
    username: 'rajat-sr',
    password: '1234567',
    choices: [
      { name: 'username', message: 'username' },
      {
        name: 'password',
        message: 'password',
        // @ts-ignore
        format(input: string) {
          // @ts-ignore
          let color = this.state.submitted
            ? // @ts-ignore
              this.styles.primary
            : // @ts-ignore
              this.styles.muted
          // @ts-ignore
          return color(this.symbols.asterisk.repeat(input.length))
        },
      },
    ],
  })
  const ans = await prompt.run()
  if (ans) {
    clearScreen()
    console.log(
      centerText(
        chalk.bgGreenBright(
          chalk.whiteBright(
            chalk.bold('\n\n\n===== Authencation success =====\n')
          )
        )
      )
    )
    console.log(
      centerText(
        chalk.bgGreenBright(
          chalk.whiteBright(chalk.bold(`\nWelcome back, ${_uname}\n\n\n`))
        )
      )
    )
    return getUserByName(_uname)
  } else {
    clearScreen()
    console.log(
      centerText(
        chalk.bgRed(
          chalk.yellowBright(
            chalk.bold('\n\n\n===== Authencation failed =====\n\n\n')
          )
        )
      )
    )
    return null
  }
}
