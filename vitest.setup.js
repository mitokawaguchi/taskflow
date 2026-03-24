import '@testing-library/jest-dom/vitest'

// テスト用 localStorage（jsdom のものに clear が無い場合があるため）
const store = {}
const mockLocalStorage = {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => { store[k] = String(v) },
  clear: () => { for (const key of Object.keys(store)) delete store[key] },
  removeItem: (k) => delete store[k],
  get length() { return Object.keys(store).length },
  key: (i) => Object.keys(store)[i] ?? null,
}
if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage.clear !== 'function') {
  globalThis.localStorage = mockLocalStorage
}
