import { exit } from 'process'
import { Trie } from './dataStructure/Tire'
import * as fs from 'fs/promises'
import { debug } from './utils/debug'

export interface ISerializable<T> {
  serialize: () => string
  deserialize: (str: string) => T
}

export type RepositoryItem = {
  id: number
  name?: string
  [key: string]: any
} & ISerializable<RepositoryItem>

export class Repository<T extends RepositoryItem>
  implements ISerializable<Repository<T>>
{
  meta: Record<string, any> = {
    lastId: 0,
  }
  map: Map<number, T> = new Map()
  tire: Trie<T> = new Trie()
  name?: string
  _type: { new (...args: any[]): T }

  constructor(private type: { new (...args: any[]): T }) {
    this._type = type
    this.name = type.name
  }

  insert(item: T) {
    // set id
    if (!item.id) {
      item.id = this.incId()
    } else {
      console.warn('warning: manually set an id for item is not recommended')
    }
    this.map.set(item.id, item)
    if (item.name) {
      this.tire.insert(item.name, item)
    }
    return item
  }

  has(id: number | string) {
    if (typeof id === 'number') {
      return this.map.has(id)
    } else {
      return this.tire.search(id) !== null
    }
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
        if (item.name) {
          this.tire.delete(item.name)
        }
      }
    } else {
      const item = this.tire.search(id)
      if (item) {
        this.map.delete(item.id)
        if (item.name) {
          this.tire.delete(item.name)
        }
      }
    }
  }

  find(fn: (item: T) => boolean) {
    const result: T[] = []
    this.map.forEach((item) => {
      if (fn(item)) {
        result.push(item)
      }
    })
    return result
  }

  clear() {
    this.map.clear()
    this.tire = new Trie()
  }

  serialize = () => {
    const arr = Array.from(this.map.values())
    return JSON.stringify({
      meta: this.meta,
      data: arr,
    })
  }

  deserialize(str: string) {
    this.clear()
    debug('deserialize', JSON.parse(str))
    const { meta, data } = JSON.parse(str)

    data.map((itemData: T) => {
      const item = new this._type()
      Object.assign(item, itemData)
      this.insert(item)
      return item
    })

    this.meta = meta

    return this
  }

  get size() {
    return this.map.size
  }

  show() {
    debug(
      `Repository ${this.name ?? '<unnamed>'}: \n -size: ${this.size}`
    )
    this.map.forEach((item) => {
      debug(item)
    })
    debug('---')
  }

  get lastId() {
    return this.meta.lastId
  }

  incId() {
    this.meta.lastId++
    return this.meta.lastId
  }
}

export class Dumper {
  private targets: {
    repo: Repository<any>
    name: string
  }[] = []
  private path: string

  constructor(path: string) {
    this.path = path
  }

  track(target: Repository<any>, name: string) {
    target.name = name
    this.targets.push({
      repo: target,
      name: name,
    })
    return this
  }

  async init() {
    try {
      await fs.access(this.path)
    } catch {
      await fs.writeFile(this.path, '{}')
    }
    return this
  }

  async dump() {
    const data = this.targets.map((item, i) => {
      return {
        name: item.name,
        data: item.repo.serialize(),
      }
    })
    await fs.writeFile(this.path, JSON.stringify(data))
    return this
  }

  async load() {
    try {
      const data = JSON.parse(await fs.readFile(this.path, 'utf-8')) as {
        name: string
        data: string
      }[]
      Object.setPrototypeOf(data, Array.prototype)
      this.targets.forEach((item) => {
        const dump = data.find((d: any) => d.name === item.name)
        if (dump) {
          const repo = item.repo.deserialize(dump.data)
          debug(`Loaded repo ${item.name}, records: ${repo.size}`)
        }
      })
    } catch (e: any) {
      console.error('Failed to load data, exit. reason:', e.message)
      exit(1)
    }
  }
}
