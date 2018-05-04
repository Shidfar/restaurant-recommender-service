export default class Injector {
  private map = new Map<string, any>()

  private static _current: any

  static get current(): Injector {
    if (this._current) {
      return this._current
    }

    this._current = new Injector()
    return this._current
  }

  /**
   * Retrieves a function with this key.
   */
  retrieve<T>(name: string) {
    if (!this.map.has(name)) {
      throw new ReferenceError('Unable to locate instance stored with name: ' + name)
    }

    const dependency = this.map.get(name)

    // if this is a singleton, we'll expect that we get the same instance back
    // with every request.
    if (dependency.type === 'singleton') {
      return <T> dependency.fn
    }

    return <T> dependency.fn()
  }

  /**
   * Registers a function against a key.
   */
  register(name: string, fn: Function) {
    if (typeof fn !== 'function') {
      throw new ReferenceError('fn')
    }

    return this._register(name, fn, 'instance')
  }

  /**
   * Registers a function against a key.
   */
  registerAsSingleton(name: string, fn: Function) {
    if (typeof fn !== 'function') {
      throw new ReferenceError('fn')
    }

    return this._register(name, fn(), 'singleton')
  }

  private _register(name: string, fn: Function, type: string = 'instance') {
    if (!name) {
      throw new Error('ArgumentError: name')
    }

    if (this.map.has(name)) {
      return
    }

    return !!this.map.set(name, { fn, type })
  }

  remove(name: string) {
    if (!this.map.has(name)) {
      throw new ReferenceError('Unable to locate instance stored with name: ' + name)
    }

    return this.map.delete(name)
  }
}
