export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserLevel {
  NORMAL = 'normal',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

export interface User {
  id: number
  name: string
  password: string

  balance: number
  tot_expenditure: number  

  role: UserRole
  level: UserLevel

  created_at: Date
  updated_at?: Date
}