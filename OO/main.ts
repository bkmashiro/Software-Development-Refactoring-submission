import { Book } from "./entities/book";
import { Transaction } from "./entities/transaction";
import { User } from "./entities/user";
import { Dumper, Repository } from "./repository-base";

const dumper = new Dumper('./data/data.json')
const userRepo = new Repository<User>()
const bookRepo = new Repository<Book>()
const transactionRepo = new Repository<Transaction>()
dumper.add(userRepo).add(bookRepo).add(transactionRepo)