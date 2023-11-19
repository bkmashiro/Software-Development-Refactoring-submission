class TrieNode<T> {
  value: T | undefined
  children: Map<string, TrieNode<T>>

  constructor() {
    this.value = undefined
    this.children = new Map<string, TrieNode<T>>()
  }
}

export class Trie<T> {
  root: TrieNode<T>

  constructor() {
    this.root = new TrieNode<T>()
  }

  insert(name: string, value: T) {
    let node = this.root

    for (const char of name) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode<T>())
      }
      node = node.children.get(char)!
    }

    node.value = value
  }

  search(name: string): T | undefined {
    let node = this.root

    for (const char of name) {
      if (!node.children.has(char)) {
        return undefined
      }
      node = node.children.get(char)!
    }

    return node.value
  }

  delete(name: string) {
    this.deleteHelper(name, this.root, 0)
  }

  private deleteHelper(
    name: string,
    node: TrieNode<T>,
    index: number
  ): boolean {
    if (index === name.length) {
      if (node.value !== undefined) {
        node.value = undefined
        return Object.keys(node.children).length === 0
      }
      return false
    }

    const char = name[index]
    if (!node.children.has(char)) {
      return false
    }

    const shouldDeleteChild = this.deleteHelper(
      name,
      node.children.get(char)!,
      index + 1
    )

    if (shouldDeleteChild) {
      node.children.delete(char)
      return Object.keys(node.children).length === 0 && node.value === undefined
    }

    return false
  }
}
