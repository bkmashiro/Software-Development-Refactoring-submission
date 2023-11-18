let __DEBUG__ = false

export function debug(...args: any[]) {
  if (__DEBUG__) {
    console.log(...args)
  }
}

export const setDebug = (debug: boolean) => {
  __DEBUG__ = debug
}
