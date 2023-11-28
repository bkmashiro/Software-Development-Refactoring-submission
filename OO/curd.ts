import { Repository, RepositoryItem } from './repository-base'
import { debug } from './utils/debug'

enum CRUDAction {
  CREATE,
  READ,
  UPDATE,
  DELETE,
  MODIFY_INPLACE,
  MODIFY_RETURN,
  FIND,
  PRINT,
}

const PREV_TOKEN = '__PREV__'
const ALL_TOKEN = '__ALL__'
/**
 * Generic CRUD class that can be used to chain CRUD operations.
 *
 * @example
 * ```ts
 * const userDto = new CRUD(userRepo)
 * // create a new user
 * userDto.create({
 *  name: 'John Doe',
 *  role: 'admin',
 * })
 * ```
 *
 * can only applied to a repository that stores items of type T.
 *
 * once `execute` is called, all the operations will be executed in order.
 *
 * and the result of the last operation will be returned.
 *
 * Note that, the queries will be cleared after `execute` is called.
 */
export class CRUD<T extends RepositoryItem> {
  target: Repository<T>
  queries: {
    action: CRUDAction
    payload: Partial<T> | ((item: T) => any) | number | string | any
  }[] = []

  constructor(target: Repository<T>) {
    this.target = target
  }

  /**
   * Creates a new entry in the database.
   *
   * @param payload - The data to be stored in the database.
   * @param ctx - Optional context information.
   * @returns The current instance of the CRUD object.
   */
  create(payload: any, ctx?: any) {
    this.queries.push({
      action: CRUDAction.CREATE,
      payload,
    })
    return this
  }

  /**
   * Reads data from a source.
   * @param payload - The data to be read.
   * @param ctx - The context for the read operation.
   * @returns The current instance of the CRUD object.
   */
  read(payload: any, ctx?: any) {
    this.queries.push({
      action: CRUDAction.READ,
      payload,
    })
    return this
  }

  /**
   * Updates the data with the specified payload.
   * @param payload - The data to be updated.
   * @param ctx - Optional context information.
   * @returns The current instance of the CRUD object.
   */
  update(payload: any, ctx?: any) {
    this.queries.push({
      action: CRUDAction.UPDATE,
      payload,
    })
    return this
  }

  /**
   * Deletes a record.
   *
   * @param payload - The data to be deleted.
   * @param ctx - Optional context information.
   * @returns The current instance of the CRUD object.
   */
  delete(payload: any, ctx?: any) {
    this.queries.push({
      action: CRUDAction.DELETE,
      payload,
    })
    return this
  }

  /**
   * Finds items in the collection based on the provided option or filter function.
   *
   * @param option - The option or filter function used to find the items.
   * @param ctx - Optional context object.
   * @returns The current instance of the CRUD object.
   */
  find(option: Partial<T> | ((item: T) => boolean), ctx?: any) {
    const fn =
      typeof option === 'function'
        ? option
        : (item: T) => {
            for (const key in option) {
              if (item[key] !== option[key]) {
                return false
              }
            }
            return true
          }
    this.queries.push({
      action: CRUDAction.FIND,
      payload: fn,
    })
    return this
  }

  /**
   * Modifies the object in place by applying the provided payload.
   *
   * @param payload - The payload to apply for modification. It can be either an object with `use` and `fn` properties, or a function.
   * @param ctx - Optional context for the modification.
   * @returns The modified object.
   */
  modifyInplace(
    payload:
      | {
          use: T | string
          fn: (o: any) => any
        }
      | ((o: any) => any),
    ctx?: any
  ) {
    if (typeof payload === 'function') {
      this.queries.push({
        action: CRUDAction.MODIFY_INPLACE,
        payload: {
          use: PREV_TOKEN,
          fn: payload,
        },
      })
      return this
    }
    this.queries.push({
      action: CRUDAction.MODIFY_INPLACE,
      payload,
    })
    return this
  }

  /**
   * Takes a specified number of elements from the beginning of the array and returns them.
   * @param payload The number of elements to take from the array.
   * @param ctx Optional context object.
   * @returns The modified instance of the class.
   */
  take(payload: number, ctx?: any) {
    this.queries.push({
      action: CRUDAction.MODIFY_RETURN,
      payload: {
        use: PREV_TOKEN,
        fn: (o: any) => {
          const ret = o.splice(0, payload)
          return ret
        },
      },
    })
    return this
  }

  /**
   * Takes the first element from the result set (must be a array).
   * @param ctx Optional context object.
   * @returns The modified instance of the CRUD object.
   */
  takeFirst(ctx?: any) {
    this.queries.push({
      action: CRUDAction.MODIFY_RETURN,
      payload: {
        use: PREV_TOKEN,
        fn: (o: any) => {
          const ret = o[0]
          return ret
        },
      },
    })
    return this
  }

  /**
   * Prints the result of the previous operation.
   * This action is only for debugging purposes, will not affect the result.
   * @deprecated
   * @param key
   * @param ctx
   * @returns
   */
  print(key: string = PREV_TOKEN, ctx?: any) {
    this.queries.push({
      action: CRUDAction.PRINT,
      payload: key,
    })
    return this
  }

  /**
   * Executes the CRUD operations defined in the queries array.
   * @returns An object containing the current instance of the class and the value of the last operation.
   */
  execute() {
    const ctx = {
      __PREV__: null as any,
    }

    const map = this.getCRUDMethods(ctx)

    let cnt = 0
    for (const q of this.queries) {
      const fn = map[q.action] as Function
      if (fn) {
        const ret = fn.call(this.target, this.parsePayload(q.payload, ctx), ctx)
        ctx.__PREV__ = ret
        ctx[`$${cnt++}`] = ret
      }
    }
    debug(ctx)

    // clean up
    this.queries = []

    return {
      this: this,
      value: ctx.__PREV__,
    }
  }

  private parsePayload(
    payload: T | Partial<T> | number | string | any,
    ctx: { [key: string]: any }
  ) {
    if (typeof payload === 'string' && payload === PREV_TOKEN) {
      payload = ctx.__PREV__
    }

    if (typeof payload === 'string' && payload.startsWith('$')) {
      payload = ctx[payload]
    }

    return payload as any
  }

  private getCRUDMethods(ctx?: any) {
    return {
      [CRUDAction.CREATE]: this.target.insert,
      [CRUDAction.READ]: this.target.search,
      [CRUDAction.UPDATE]: this.target.insert,
      [CRUDAction.DELETE]: this.target.delete,
      [CRUDAction.MODIFY_INPLACE]: ({
        use,
        fn,
      }: {
        use: T | string
        fn: (o: T) => any
      }) => {
        const item = this.parsePayload(use, ctx) as T
        debug(item)
        if (item) {
          fn(item)
          return item
        }
      },
      [CRUDAction.MODIFY_RETURN]: ({
        use,
        fn,
      }: {
        use: T | string
        fn: (o: T) => any
      }) => {
        const item = this.parsePayload(use, ctx) as T
        debug(item)
        if (item) {
          return fn(item)
        }
      },
      [CRUDAction.FIND]: this.target.find,
      [CRUDAction.PRINT]: (val: '__ALL__' | string, ctx: any) => {
        debug(`== PRINT ==`)
        if (val === ALL_TOKEN) {
          debug(ctx)
        } else {
          debug(val)
        }
        console.warn(`For objects, values may be updated`)
        debug(`\n`)
        return ctx[PREV_TOKEN]
      },
    }
  }

  /**
   * Executes the operation and handles any exceptions without throwing them.
   *
   * @returns {boolean|any} Returns true if the operation is executed successfully, otherwise false.
   */
  executeNoThrow() {
    try {
      return this.execute()
    } catch (e) {
      debug(e)
      return false
    }
  }
}
