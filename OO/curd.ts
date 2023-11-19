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
export class CRUD<T extends RepositoryItem> {
  target: Repository<T>
  queries: {
    action: CRUDAction
    payload: Partial<T> | ((item: T) => any) | number | string | any
  }[] = []

  constructor(target: Repository<T>) {
    this.target = target
  }

  create(payload: any, ctx?: any) {
    this.queries.push({
      action: CRUDAction.CREATE,
      payload,
    })
    return this
  }

  read(payload: any, ctx?: any) {
    this.queries.push({
      action: CRUDAction.READ,
      payload,
    })
    return this
  }

  update(payload: any, ctx?: any) {
    this.queries.push({
      action: CRUDAction.UPDATE,
      payload,
    })
    return this
  }

  delete(payload: any, ctx?: any) {
    this.queries.push({
      action: CRUDAction.DELETE,
      payload,
    })
    return this
  }

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

  print(key: string = PREV_TOKEN, ctx?: any) {
    this.queries.push({
      action: CRUDAction.PRINT,
      payload: key,
    })
    return this
  }

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
        console.log(item)
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
        console.log(item)
        if (item) {
          return fn(item)
        }
      },
      [CRUDAction.FIND]: this.target.find,
      [CRUDAction.PRINT]: (val: '__ALL__' | string, ctx: any) => {
        console.log(`== PRINT ==`)
        if (val === ALL_TOKEN) {
          console.log(ctx)
        } else {
          console.log(val)
        }
        console.warn(`For objects, values may be updated`)
        console.log(`\n`)
        return ctx[PREV_TOKEN]
      },
    }
  }

  executeNoThrow() {
    try {
      return this.execute()
    } catch (e) {
      console.log(e)
      return false
    }
  }
}
