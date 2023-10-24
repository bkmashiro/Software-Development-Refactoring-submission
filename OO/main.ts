import { Book } from './entities/book'
import { Transaction } from './entities/transaction'
import { User } from './entities/user'
import { Dumper, Repository } from './repository-base'

async function main() {
  const dumper = await new Dumper('./data/data.json').init()
  const userRepo = new Repository(User)
  const bookRepo = new Repository(Book)
  const transactionRepo = new Repository(Transaction)
  const user = new User()
  user.name = 'John'
  user.password = '123456'
  userRepo.insert(user)
  await dumper
    .track(userRepo, 'user')
    .track(bookRepo, 'book')
    .track(transactionRepo, 'trans')
    .load()
  
}

main()
