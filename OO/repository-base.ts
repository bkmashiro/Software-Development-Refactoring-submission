import { Trie } from "./dataStructure/Tire"
import * as fs from 'fs/promises'

interface ISerializable<T> {
  serialize: () => string
  deserialize: (str: string) => T
}

type RepositoryItem = {
  id: number
  name: string
  [key: string]: any
} & ISerializable<RepositoryItem>

class Repository<T extends RepositoryItem> implements ISerializable<Repository<T>> {
  map: Map<number, T> = new Map()
  tire: Trie<T> = new Trie()
  _id: number = 0

  constructor() { }

  insert(item: T) {
    this.map.set(item.id, item)
    this.tire.insert(item.name, item)
  }

  search(id: number | string) {
    if (typeof id === 'number') {
      return this.map.get(id)
    } else {
      return this.tire.search(id)
    }
  }

  delete(id: number | string) {
    if (typeof id === 'number') {
      const item = this.map.get(id)
      if (item) {
        this.map.delete(id)
        this.tire.delete(item.name)
      }
    } else {
      const item = this.tire.search(id)
      if (item) {
        this.map.delete(item.id)
        this.tire.delete(item.name)
      }
    }
  }

  clear() {
    this.map.clear()
    this.tire = new Trie()
  }

  serialize() {
    const arr = Array.from(this.map.values())
    return JSON.stringify(arr)
  }

  deserialize(str: string) {
    this.clear()
    const arr = JSON.parse(str)
    arr.forEach((item: T) => {
      this.insert(item)
    })
    return this
  }

  get size() {
    return this.map.size
  }
}

class Dumper {
  private targets: Repository<any>[] = []
  private path: string

  constructor(path: string) {
    this.path = path
  }

  add(target: Repository<any>) {
    this.targets.push(target)
  }

  async dump() {
    const data = this.targets.map(target => target.serialize())
    await fs.writeFile(this.path, JSON.stringify(data))
  }

  async load() {
    const data = JSON.parse(await fs.readFile(this.path, 'utf-8'))
    data.forEach((str: string, index: number) => {
      this.targets[index].deserialize(str)
    })
  }
}