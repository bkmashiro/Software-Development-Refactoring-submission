import { ISerializable } from "../repository-base"

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
  id: number
  name: string
  password: string

  balance: number
  tot_expenditure: number  

  role: UserRole
  level: UserLevel

  created_at: Date
  updated_at?: Date

  constructor(id: number, name: string, password: string, balance: number, tot_expenditure: number, role: UserRole, level: UserLevel, created_at: Date, updated_at?: Date) {
    this.id = id
    this.name = name
    this.password = password
    this.balance = balance
    this.tot_expenditure = tot_expenditure
    this.role = role
    this.level = level
    this.created_at = created_at
    this.updated_at = updated_at
  }
  serialize: () => string = () => JSON.stringify(this)
  deserialize: (str: string) => User = (str) => JSON.parse(str) as User
}