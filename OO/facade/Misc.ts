import { dumper, userRepo, bookRepo, transactionRepo } from '../main'

export async function dump() {
  return await dumper.dump()
}

export async function InitRepos() {
  await dumper.init()
  await dumper
    .track(userRepo, 'user')
    .track(bookRepo, 'book')
    .track(transactionRepo, 'trans')
    .load()
}
