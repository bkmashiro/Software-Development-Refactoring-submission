import chalk from 'chalk';

export function centerText(text: string) {
  const terminalWidth = process.stdout.columns;
  const centeredText: string[] = [];

  text.split('\n').forEach(line => {
    const padding = Math.max(0, Math.floor((terminalWidth - line.length) / 2));
    const centeredLine = ' '.repeat(padding) + line;
    centeredText.push(centeredLine);
  });

  return centeredText.join('\n');
}

export function displayWelcome() {
  const liberian = `
   __    _ __              _           
  / /   (_) /_  ___  _____(_)___  ____ 
 / /   / / __ \\/ _ \\/ ___/ / __ \\/ __ \\
/ /___/ / /_/ /  __/ /  / / /_/ / / / /
\\____/_/\\.___/\\___/_/  /_/\\__,_/_/ /_/ 
`;

  console.log(centerText(chalk.bgBlack(chalk.green(liberian))));
  console.log(centerText(chalk.bgBlue(chalk.white('Liberian: A open source book store management system'))));
  console.log(centerText(chalk.bgBlue(chalk.white('author: baka_mashiro  contact: a[at]yuzhes.com'))));
  console.log(centerText(chalk.bgCyan(chalk.white('\nThis project is licensed under MIT license.'))));
}