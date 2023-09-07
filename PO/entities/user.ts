export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface User {
  id: number
  name: string
  email: string
  password: string

  balance: number
  tot_expenditure: number  

  role: UserRole

  created_at: Date
  updated_at?: Date
}