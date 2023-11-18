import chalk from "chalk";


export function printDropped(user: any, dropFields: string[] = ['serialize', 'deserialize']) {
  for (const [key, value] of Object.entries(user)) {
    if (dropFields.includes(key)) {
      continue;
    }
    console.log(`${chalk.green(key.padStart(16))}\: ${chalk.yellow(value)}`);
  }
}
