import { Repository, RepositoryItem } from "./repository-base";

enum CRUDAction {
  CREATE,
  READ,
  UPDATE,
  DELETE,
}

class CRUD<T extends RepositoryItem> {
  target: Repository<T>
  constructor(target: Repository<T>) {
    this.target = target
  }
}

class CRUDBuilder<T extends RepositoryItem> {
  constructor() {}

  queries: {
    action: CRUDAction
    payload: T
  }[] = []

  create(payload: T) {
    this.queries.push({
      action: CRUDAction.CREATE,
      payload,
    })
    return this
  }
  
}