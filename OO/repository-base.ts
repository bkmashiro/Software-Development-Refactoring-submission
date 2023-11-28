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

/**
 * Represents a generic repository that stores items of type T.
 * @template T - The type of items stored in the repository.
 */
export class Repository<T extends RepositoryItem>
  implements ISerializable<Repository<T>>
{
  meta: Record<string, any> = {
    lastId: 0,
  }
  map: Map<number, T> = new Map()
  tire: Trie<T> = new Trie()
  name?: string
  entity: { new (...args: any[]): T }

  constructor(private _constructor: { new (...args: any[]): T }) {
    this.entity = _constructor
    this.name = _constructor.name
  }

  /**
   * Inserts an item into the repository.
   * If the item does not have an id, it will automatically generate one.
   * If the item has a name, it will also be inserted into the tire.
   * @param item The item to be inserted.
   * @returns The inserted item.
   */
  insert(item: T) {
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

  /**
   * Checks if the repository has an item with the specified ID.
   * @param id - The ID of the item to check.
   * @returns True if the repository has an item with the specified ID, false otherwise.
   */
  has(id: number | string) {
    if (typeof id === 'number') {
      return this.map.has(id)
    } else {
      return this.tire.search(id) !== null
    }
  }

  /**
   * Searches for an item in the repository based on the provided id.
   * @param id - The id of the item to search for.
   * @returns The item with the matching id, if found.
   */
  search(id: number | string) {
    if (typeof id === 'number') {
      return this.map.get(id)
    } else {
      return this.tire.search(id)
    }
  }

  /**
   * Deletes an item from the repository based on its ID.
   * If the ID is a number, it will be deleted from the map.
   * If the ID is a string, it will be searched in the tire and deleted from the map.
   * If the item has a name, it will also be deleted from the tire.
   * @param {number | string} id - The ID of the item to be deleted.
   */
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

  /**
   * Finds all items in the repository that satisfy the given condition.
   * 
   * @param fn The condition function to be applied to each item.
   * @returns An array of items that satisfy the condition.
   */
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
      const item = new this.entity()
      Object.assign(item, itemData)
      this.insert(item)
      return item
    })

    this.meta = meta

    return this
  }

  /**
   * Gets the size of the repository.
   * @returns The size of the repository.
   */
  get size() {
    return this.map.size
  }

  /**
   * show the repository in the console
   */
  show() {
    debug(`Repository ${this.name ?? '<unnamed>'}: \n -size: ${this.size}`)
    this.map.forEach((item) => {
      debug(item)
    })
    debug('---')
  }

  get lastId() {
    return this.meta.lastId
  }

  /**
   * Increases the lastId value by 1 and returns the updated value.
   * DO NOT CALL THIS METHOD MANUALLY.
   * @returns The updated lastId value.
   */
  private incId() {
    this.meta.lastId++
    return this.meta.lastId
  }
}


/**
 * Represents a Dumper class that tracks repositories, dumps their data to a file, and loads data from a file to initialize repositories.
 */
export class Dumper {
  private targets: {
    repo: Repository<any>
    name: string
  }[] = []
  private path: string

  /**
   * Creates an instance of Dumper.
   * @param path - The file path where the data will be dumped and loaded from.
   */
  constructor(path: string) {
    this.path = path
  }

  /**
   * Tracks a repository by assigning a name to it and adding it to the list of targets.
   * @param target - The repository to track.
   * @param name - The name to assign to the repository.
   * @returns The current instance of the Dumper.
   */
  track(target: Repository<any>, name: string) {
    target.name = name
    this.targets.push({
      repo: target,
      name: name,
    })
    return this
  }

  /**
   * Initializes the Dumper by creating the data file if it doesn't exist.
   * @returns The current instance of the Dumper.
   */
  async init() {
    try {
      await fs.access(this.path)
    } catch {
      await fs.writeFile(this.path, '{}')
    }
    return this
  }

  /**
   * Dumps the data of the tracked repositories to the file.
   * @returns A promise that resolves to the current instance of the Dumper.
   */
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

  /**
   * Loads the data from the specified file path and initializes the repositories.
   * @returns A promise that resolves once the data is loaded and repositories are initialized.
   */
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
