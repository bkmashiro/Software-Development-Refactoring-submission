import { Repository, RepositoryItem } from './repository-base'

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

  modify_(payload: {
    use: T | string
    fn: (o: any) => any
  } | ((o: any) => any), ctx?: any) {
    if (typeof payload === 'function') {
      this.queries.push({
        action: CRUDAction.MODIFY_INPLACE,
        payload: {
          use: '__PREV__',
          fn: payload,
        }
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
        use: '__PREV__',
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
        use: '__PREV__',
        fn: (o: any) => {
          const ret = o[0]
          return ret
        },
      },
    })
    return this
  }

  print(key: string = '__PREV__', ctx?: any) {
    this.queries.push({
      action: CRUDAction.PRINT,
      payload: key,
    })
    return this
  }

  save() {
    this.target.save()
    return this
  }

  execute() {
    const map = {
      [CRUDAction.CREATE]: this.target.insert,
      [CRUDAction.READ]: this.target.search,
      [CRUDAction.UPDATE]: this.target.insert,
      [CRUDAction.DELETE]: this.target.delete,
      [CRUDAction.MODIFY_INPLACE]: ({use, fn}: {
        use: T | string
        fn: (o: T) => any
      }) => { 
        const item = parsePayload(use) as T
        console.log(item)
        if (item) {
          fn(item)
          return item
        }
      },
      [CRUDAction.MODIFY_RETURN]: ({use, fn}: {
        use: T | string
        fn: (o: T) => any
      }) => { 
        const item = parsePayload(use) as T
        console.log(item)
        if (item) {
          return fn(item)
        }
      },
      [CRUDAction.FIND]: this.target.find,
      [CRUDAction.PRINT]: (val: '__ALL__' | string, ctx: any) => {
        console.log(`== PRINT ==`)
        if (val === '__ALL__') {
          console.log(ctx)
        } else {
          console.log(val)
        }
        console.warn(`For objects, values may be updated`)
        console.log(`\n`)
        return ctx['__PREV__']
      },
    }

    const ctx = {
      __PREV__: null as any,
    } as {
      [key: string]: any
    }

    const parsePayload = (payload: T | Partial<T> | number | string | any) => {
      if (typeof payload === 'string' && payload === '__PREV__') {
        payload = ctx.__PREV__
      }

      if (typeof payload === 'string' && payload.startsWith('$')) {
        payload = ctx[payload]
      }

      return payload as any
    }

    let cnt = 0
    for (const q of this.queries) {
      const fn = map[q.action] as Function
      if (fn) {
        const ret = fn.call(this.target, parsePayload(q.payload), ctx)
        ctx.__PREV__ = ret
        ctx[`$${cnt++}`] = ret
      }
    }

    return this
  }
}
