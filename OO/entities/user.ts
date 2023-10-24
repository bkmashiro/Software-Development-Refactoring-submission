import { ISerializable } from '../repository-base'

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserLevel {
  NORMAL = 'normal',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

export class User implements ISerializable<User> {
  id: number = Math.floor(Math.random() * 1000000)
  name?: string
  password?: string

  balance: number = 0
  tot_expenditure: number = 0

  role: UserRole = UserRole.USER
  level: UserLevel = UserLevel.NORMAL

  created_at: Date = new Date()
  updated_at?: Date

  constructor() {}
  serialize: () => string = () => JSON.stringify(this)
  deserialize: (str: string) => User = (str) => JSON.parse(str) as User
}
