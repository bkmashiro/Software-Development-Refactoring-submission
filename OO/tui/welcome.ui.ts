import chalk from 'chalk';

export function centerText(text:string) {
  const terminalWidth = process.stdout.columns; // 获取控制台的宽度
  const centeredText : string[] = [];

  text.split('\n').forEach(line => {
    const padding = Math.max(0, Math.floor((terminalWidth - line.length) / 2)); // 计算左侧需要的空格数量
    const centeredLine = ' '.repeat(padding) + line; // 在每一行文本前面添加空格
    centeredText.push(centeredLine);
  });

  return centeredText.join('\n');
}

export function displayWelcome() {
  const myText = `
   __    _ __              _           
  / /   (_) /_  ___  _____(_)___  ____ 
 / /   / / __ \\/ _ \\/ ___/ / __ \\/ __ \\
/ /___/ / /_/ /  __/ /  / / /_/ / / / /
\\____/_/\\.___/\\___/_/  /_/\\__,_/_/ /_/ 
`;

  console.log(centerText(chalk.bgBlack(chalk.green(myText))));
  console.log(centerText(chalk.bgBlue(chalk.white('Liberian: A open source book store management system'))));
  console.log(centerText(chalk.bgBlue(chalk.white('author: baka_mashiro  contact: a[at]yuzhes.com'))));
  console.log(centerText(chalk.bgCyan(chalk.white('\nThis project is under MIT license.'))));
}