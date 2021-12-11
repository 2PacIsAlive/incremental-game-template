import { defineStore } from 'pinia'
import { Decimal } from 'decimal.js'
import { Incrementor, incrementors } from '../components/incrementors'

const defaultMap =
`┌─────────────────────────────────────────────────────────┐
│  *                         *                            │
│ ┌──────────────┐  ┌───────────────────────────────────┐ │
│ │              │  │                                 * │ │
│ │  ┌─────────┐*│  │  ┌────────────┐  *   *┌───────────┘ │
│ │  │         └─┘  │  │            └───────┘             │
│ │  │* ┌───┐       │  │ *┌──────┐             ┌───────┐  │
│ │  └──┘ * └───────┘  └──┘      └─────────────┘      *│  │
│ │                                                    │  │
│ │      ┌───────────────────────────────────────────┐ │  │
│ │      │                        L                  │ │  │
│ └───┐  │ ┌─────────────────────┐  ┌───────────┐    │ │  │
│     │  │ │ *                 * │  │           │    │ │  │
│ ┌───┘  │ └─────────────┐  ┌─┐  │  │ ┌─┐       │    │ │  │
│ │*     │               │  │*│  │  │ │*│       │    │ │  │
│ └──────┘       ┌────┐  │  │ │  │  │ │ │ ┌─┐   │    │ │  │
│                │ p  │ *│  │ │  │  │ │ │ │*└───┘    │ │  │
│ ┌──────────────┘    └──┘  │ │  │  │ │ │ │          │ │  │
│ │                         │ │  │  │ │ │ └──────────┘ │  │
│ │  ┌────┐ ┌───────────────┘ │@ │  │ │ │              │  │
│ │  │  * │ │                 └──┘  │ │ └───────────┐  │  │
│ │  │    │ │ *                     │ │             │  │  │
│ │  │    │ └───────────────────────┘ └─────────┐   │  │  │
│ │  │    │                                     │   │  │  │
│*│  │    └────────────────────┐  ┌─────────────┘   │  │  │
│ │  │                       * │  │ *               │  │  │
│ │  └─────────┐  ┌────────────┘  └──────┐  ┌───────┘  │  │
│ │           *│  │*                     │P │*         │  │
│ └────────────┘  └──────────────────────┘  └──────────┘  │
│                            *                            │
└─────────────────────────────────────────────────────────┘`

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
      automators: savedState?.automators 
        ? savedState.automators.map((a: string) =>
            incrementors[a] as Incrementor
          )
        : <Incrementor[]> [],
      lag: 0,
      displaySaved: false,
      map: savedState?.map || defaultMap,
      stars: savedState?.stars || 0,
      aiStars: savedState?.aiStars || 0,
      deaths: savedState?.deaths || 0,
    }
  },
  actions: {
    save () {
      localStorage.setItem('save', JSON.stringify({
        count: this.count,
        lastCount: this.lastCount,
        automators: this.automators
          .map((a: Incrementor) => a.name),
        map: this.map,
        stars: this.stars,
        aiStars: this.stars,
        deaths: this.deaths,
      }))
    },
    reset () {
      localStorage.removeItem('save')
      this.$reset()
    },
  },
})