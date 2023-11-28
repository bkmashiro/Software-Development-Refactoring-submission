export namespace Tire {
  export interface TrieNode<T> {
    children: { [key: string]: TrieNode<T> }
    value: T | null
  }

  export function createTrieNode<T>(): TrieNode<T> {
    return { children: {}, value: null }
  }

  export function insert<T>(root: TrieNode<T>, word: string, value: T) {
    let node = root
    for (const char of word) {
      if (!node.children[char]) {
        node.children[char] = createTrieNode()
      }
      node = node.children[char]
    }
    node.value = value
  }

  export function search<T>(root: TrieNode<T>, word: string): T | null {
    let node = root
    for (const char of word) {
      if (!node.children[char]) {
        return null
      }
      node = node.children[char]
    }
    return node.value
  }

  export function buildTire<T extends Record<string, any>>(
    root: TrieNode<T>,
    data: T[],
    key: keyof T
  ) {
    for (const item of data) {
      insert<T>(root, item[key], item)
    }
  }

  export function remove<T>(root: TrieNode<T>, word: string) {
    let node = root
    const stack: TrieNode<T>[] = []
    for (const char of word) {
      if (!node.children[char]) {
        return
      }
      stack.push(node)
      node = node.children[char]
    }
    node.value = null
    while (stack.length > 0) {
      const node = stack.pop()
      if (
        node &&
        Object.keys(node.children).length === 0 &&
        node.value === null
      ) {
        const parent = stack[stack.length - 1]
        if (parent) {
          delete parent.children[word[word.length - 1]]
        }
      }
    }
  }

  export function printAll<T>(root: TrieNode<T>, prefix: string = '') {
    if (root.value) {
      console.log(prefix, root.value)
    }
    for (const key of Object.keys(root.children)) {
      printAll(root.children[key], prefix + key)
    }
  }
}
