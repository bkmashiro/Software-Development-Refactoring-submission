import * as fs from 'fs';
import * as path from 'path';

// 自定义姓名和日期
const customName = 'Your Name';
const customDate = new Date().toLocaleDateString();

// 指定文件夹路径
const folderPath = '/path/to/your/folder'; // 替换为实际文件夹的路径

function insertHeader(filePath: string, name: string, date: string) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const newFileContent = `// Author: ${name}\n// Date: ${date}\n\n${fileContent}`;

    fs.writeFileSync(filePath, newFileContent, 'utf-8');
  } catch (err) {
    console.error(`Error processing file ${filePath}: ${err}`);
  }
}

// 递归处理文件夹下的所有 .ts 文件
function processFilesInFolder(folderPath: string) {
  fs.readdirSync(folderPath).forEach((file) => {
    const filePath = path.join(folderPath, file);

    if (fs.statSync(filePath).isDirectory()) {
      processFilesInFolder(filePath);
    } else if (file.endsWith('.ts')) {
      insertHeader(filePath, customName, customDate);
      console.log(`Header inserted in ${filePath}`);
    }
  });
}

processFilesInFolder(folderPath);
