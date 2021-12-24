import { defineStore } from 'pinia'
import { Decimal } from 'decimal.js'
import { Incrementor, incrementors } from '../components/incrementors'

const defaultMap =
`┌─────────────────────────────────────────────────────────┐
│                          *   *                         *│
│ ┌──────────────┐  ┌───────────────────────────────────┐ │
│ │              │  │                                   │ │
│ │  ┌─────────┐ │* │  ┌────────────┐       ┌───────────┘ │
│ │  │P *  * * └─┘  │  │            └───────┘             │
│ │  │ *┌───┐ *   * │  │* ┌──────┐   *   *  *  ┌───────┐  │
│ │  └──┘   └───────┘  └──┘      └─────────────┘       │* │
│ │                                                    │  │
│ │      ┌───────────────────────────────────────────┐ │  │
│ │      │                        C                  │ │  │
│ └───┐  │ ┌─────────────────────┐  ┌───────────┐    │ │  │
│     │  │ │*                    │  │           │    │ │ *│
│ ┌───┘  │ └─────────────┐  ┌─┐  │  │ ┌─┐       │    │ │  │
│ │      │     *    *  * │  │ │  │  │ │ │       │    │ │  │
│ └──────┘       ┌────┐ *│ *│ │  │  │ │ │ ┌─┐   │    │ │  │
│           *    │    │* │  │ │  │  │ │ │ │ └───┘    │ │  │
│ ┌──────────────┘    └──┘  │ │  │  │ │ │ │          │ │* │
│ │                         │ │  │  │ │ │ └──────────┘ │  │
│ │  ┌────┐ ┌───────────────┘ │@ │  │ │ │              │  │
│ │  │    │ │                 └──┘  │ │ └───────────┐  │  │
│ │  │    │*│                       │ │             │  │  │
│ │  │    │ └───────────────────────┘ └─────────┐   │  │ *│
│ │  │    │            *                        │   │  │  │
│ │  │    └────────────────────┐  ┌─────────────┘   │  │  │
│ │  │     *                   │  │                 │  │  │
│ │  └─────────┐  ┌────────────┘  └──────┐  ┌───────┘  │  │
│ │            │  │p        *          * │  │          │* │
│ └────────────┘  └──────────────────────┘  └──────────┘  │
│        *                                                │
└─────────────────────────────────────────────────────────┘`

const defaultMenu = [
  {
    label: 'the pad',
    key: 'the pad',
    icon: 'HomeOutline',
    disabled: false,
  }, {
    label: 'the streets',
    key: 'the streets',
    icon: 'SkullOutline',
    disabled: true
  }, {
    label: 'the gym',
    key: 'the gym',
    icon: 'BarbellOutline',
    disabled: true
  }
]

const defaultCars = ['1993 Ford Aspire', '2020 Subaru BRZ', 'Lamborghini Aventador']

export const useStore = defineStore('main', {
  // arrow function recommended for full type inference
  state: () => {
    const localStorageSave = localStorage.getItem('savev2')
    const savedState = localStorageSave 
      ? JSON.parse(localStorageSave)
      : undefined
    // all these properties will have their type inferred automatically
    return {
      money: savedState?.money || new Decimal(0),
      lastMoney: savedState?.lastMoney || new Decimal(0),
      pay: savedState?.pay || new Decimal(100),
      payIncrementType: savedState?.payIncrementType || 'sqrt',
      carCost: savedState?.carCost || 500,
      cars: savedState?.cars || defaultCars,
      strength: savedState?.strength || 0,
      gainz: savedState?.gainz || 1,
      workoutDuration: savedState?.workoutDuration || 3000,
      posessions: savedState?.posessions || {},
      workDuration: savedState?.workDuration || 3000,
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
      openScreen: savedState?.openScreen || 'the pad',
      menuOptions: savedState?.menuOptions || defaultMenu,
      showDeathModal: savedState?.showDeathModal || false,
    }
  },
  actions: {
    save () {
      localStorage.setItem('savev2', JSON.stringify({
        money: this.money,
        lastMoney: this.lastMoney,
        pay: this.pay,
        payIncrementType: this.payIncrementType,
        carCost: this.carCost,
        cars: this.cars,
        strength: this.strength,
        gainz: this.gainz,
        workoutDuration: this.workoutDuration,
        posessions: this.posessions,
        automators: this.automators
          .map((a: Incrementor) => a.name),
        map: this.map,
        stars: this.stars,
        aiStars: this.stars,
        deaths: this.deaths,
        openScreen: this.openScreen,
        menuOptions: this.menuOptions,
        showDeathModal: this.showDeathModal,
      }))
    },
    reset () {
      localStorage.removeItem('savev2')
      this.$reset()
    },
  },
})