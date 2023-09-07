import { UserRole } from "./entities/user";
import { addBook, addUser, dump, getBookByTitle, getUserByName, load, makeTransaction } from "./repository";

main();

async function main() {
  await load();

  addUser({
    name: 'test',
    rawPassword: 'test',
  });

  addUser({
    name: 'admin',
    rawPassword: 'admin',
  });

  addUser({
    name: 'whb',
    rawPassword: 'whb',
  });

  addBook({
    title: '1984',
    isbn: '1234567890123',
    author: 'George Orwell',
    publisher: 'Penguin',
    price: 1000,
    quantity: 20,
  })

  addBook({
    title: 'China\'s best actor',
    isbn: '1145141919810',
    author: 'JiangHuXi',
    publisher: 'Penguin',
    price: 114514,
    quantity: 10,
  })

  getUserByName('admin')!.role = UserRole.ADMIN;
  getUserByName('test')!.balance = 200000;

  makeTransaction(
    getUserByName('test')!,
    getBookByTitle('1984')!,
    11
  )
  
  await dump();
}
