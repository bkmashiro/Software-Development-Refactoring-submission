import chalk from "chalk";
import { getRecordById } from "../../repos";
import { FailMessage } from "../../utils";
const { NumberPrompt } = require("enquirer");


export async function QueryTransaction() {
  const prompt = new NumberPrompt({
    name: 'transaction',
    message: 'Please provide the following transaction information:',
  });

  const ans = await prompt.run();

  const transaction = getRecordById(Number(ans));

  if (!transaction) {
    FailMessage(`Transaction ${ans} not exists`);
    return;
  }

  for (const [key, value] of Object.entries(transaction)) {
    console.log(`${chalk.green(key.padStart(16))}: ${chalk.yellow(value)}`);
  }
}
