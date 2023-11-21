import chalk from 'chalk'

export function md5(data: string): string {
  const rotateLeft = (value: number, shift: number) => {
    return (value << shift) | (value >>> (32 - shift))
  }

  const toHexString = (value: number): string => {
    return ('0' + (value >>> 0).toString(16)).slice(-2)
  }

  let message = Buffer.from(data, 'utf-8')
  const initialLength = message.length * 8

  message = Buffer.concat([message, Buffer.from([0x80])])

  while ((message.length * 8) % 512 !== 448) {
    message = Buffer.concat([message, Buffer.from([0x00])])
  }

  message = Buffer.concat([message, Buffer.alloc(8)])
  message.writeUInt32LE(initialLength, message.length - 4)

  let a = 0x67452301
  let b = 0xefcdab89
  let c = 0x98badcfe
  let d = 0x10325476

  for (let i = 0; i < message.length; i += 64) {
    const chunk = message.slice(i, i + 64)
    const words: number[] = []

    for (let j = 0; j < 64; j += 4) {
      words.push(chunk.readUInt32LE(j))
    }

    let aa = a
    let bb = b
    let cc = c
    let dd = d

    for (let j = 0; j < 64; j++) {
      let f, g

      if (j < 16) {
        f = (b & c) | (~b & d)
        g = j
      } else if (j < 32) {
        f = (d & b) | (~d & c)
        g = (5 * j + 1) % 16
      } else if (j < 48) {
        f = b ^ c ^ d
        g = (3 * j + 5) % 16
      } else {
        f = c ^ (b | ~d)
        g = (7 * j) % 16
      }

      const temp = d
      d = c
      c = b
      b = b + rotateLeft((a + f + 0x5a827999 + words[g]) | 0, 30)
      a = temp
    }

    a = (a + aa) | 0
    b = (b + bb) | 0
    c = (c + cc) | 0
    d = (d + dd) | 0
  }

  return toHexString(a) + toHexString(b) + toHexString(c) + toHexString(d)
}

export function expect<T>(exp: (args: any) => T, tobe: T): boolean {
  throw new Error('Not implemented')
}

export function clearScreen() {
  // for windows
  // console.clear()

  // // for unix-like systems
  // console.log('\x1Bc')
}

export function FailMessage(msg: string) {
  console.log(chalk.red(msg))
}

export function SuccessMessage(msg: string) {
  console.log(chalk.green(msg))
}
