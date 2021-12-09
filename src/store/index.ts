import { defineStore } from 'pinia'
import { Decimal } from 'decimal.js'
import { Incrementor } from '../components/incrementors'

export const useStore = defineStore('main', {
  // arrow function recommended for full type inference
  state: () => {
    const localStorageSave = localStorage.getItem('save')
    const savedState = localStorageSave 
      ? JSON.parse(localStorageSave)
      : undefined
    // all these properties will have their type inferred automatically
    return {
      count: savedState?.count || new Decimal(0),
      lastCount: savedState?.lastCount || new Decimal(0),
      automators: <Incrementor[]> [],
      lag: 0
    }
  },
  actions: {
    save () {
      localStorage.setItem('save', JSON.stringify({
        count: this.count,
        lastCount: this.lastCount,
      }))
    },
    reset () {
      localStorage.removeItem('save')
      this.count = new Decimal(0)
      this.lastCount = new Decimal(0)
    }
  },
})