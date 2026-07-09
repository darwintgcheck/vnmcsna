import { Buffer } from 'buffer'

declare global {
  interface Window {
    Buffer?: typeof Buffer
    global?: typeof globalThis
    process?: {
      env?: Record<string, string>
      browser?: boolean
      version?: string
      versions?: Record<string, string>
      nextTick?: (callback: (...args: any[]) => void, ...args: any[]) => void
    }
  }
}

const globalScope = globalThis as typeof globalThis & {
  Buffer?: typeof Buffer
  global?: typeof globalThis
  process?: {
    env?: Record<string, string>
    browser?: boolean
    version?: string
    versions?: Record<string, string>
    nextTick?: (callback: (...args: any[]) => void, ...args: any[]) => void
  }
}

if (!globalScope.global) {
  globalScope.global = globalScope
}

if (!globalScope.Buffer) {
  globalScope.Buffer = Buffer
}

if (!globalScope.process) {
  globalScope.process = {
    env: {},
    browser: true,
    version: '',
    versions: {},
    nextTick: (callback, ...args) => {
      queueMicrotask(() => callback(...args))
    },
  }
} else {
  globalScope.process.env = globalScope.process.env || {}
  globalScope.process.browser = true
  globalScope.process.nextTick = globalScope.process.nextTick || ((callback, ...args) => {
    queueMicrotask(() => callback(...args))
  })
}

if (typeof window !== 'undefined') {
  window.global = globalScope
  window.Buffer = globalScope.Buffer
  window.process = globalScope.process
}
