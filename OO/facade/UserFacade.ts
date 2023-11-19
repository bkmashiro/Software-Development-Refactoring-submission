import { User } from '../entities/user'
import { userDto } from '../main'
import { md5 } from '../utils'

export function removeUser(id: number) {
  return userDto.delete(id).execute()
}

export function getAllUserNames() {
  return userDto
    .find((u) => true)
    .execute()
    .value.map((u: User) => u.name)
}
export function addUser(user: { name: string; rawPassword: string }) {
  if (userDto.find((u) => u.name === user.name).execute().value.length > 0) {
    return false
  }
  const u = new User()
  u.name = user.name
  u.password = md5(user.rawPassword)
  userDto.create(u).execute()
  return true
}

export function getUserById(id: number) {
  return userDto.find((u) => u.id === id).execute().value[0]
}
export async function getUserByName(name: string) {
  return userDto.find((u) => u.name === name).execute().value[0]
}

export function validateUsrPw(name: string, password: string) {
  return (
    userDto.find((u) => u.name === name && u.password === password).execute()
      .value.length > 0
  )
}
