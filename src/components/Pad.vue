<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from '../store'
// @ts-ignore
import * as numberformat from 'swarm-numberformat'
import { Decimal } from 'decimal.js'
import { incrementors } from './incrementors'

const backend = { backend: 'decimal.js', Decimal: Decimal }
import { NButton, NIcon, useLoadingBar, NSpace, NCard } from 'naive-ui'
import { CashOutline, CarOutline, CarSportOutline, RocketOutline } from '@vicons/ionicons5'

const store = useStore(),
  loadingBar = useLoadingBar(),
  loadingGoToWork = ref(false),
  formattedMoney = computed(() =>
    `$${numberformat.format(store.money, backend)}`
  ),
  formattedPay = computed(() =>
    `$${numberformat.format(store.pay, backend)}`
  )

// async function increment (): Promise<void> {
//   store.count = await incrementors[incrementType.value](store.count as Decimal)
// }

// function addAutomators (): void {
//   for (let i=0; i<automatorsToAdd.value; i++) {
//     store.automators.push(incrementors[incrementType.value])
//   }
// }

async function goToWork(): Promise<void> {
  loadingGoToWork.value = true
  loadingBar.start()
  await new Promise(resolve => setTimeout(resolve, store.workDuration))
  store.money = Decimal.add(store.money, store.pay)
  store.pay = incrementors[store.payIncrementType](store.pay as Decimal)
  store.workDuration = store.workDuration - 500
  loadingGoToWork.value = false
  loadingBar.finish()
}

function buyCar(): void {
  store.money -= store.carCost
  store.posessions.car = store.cars.shift()
  store.carCost *= 100
  store.menuOptions[1].disabled = false
}

function buySpaceship(): void {
  store.money -= store.spaceshipCost
  store.posessions.spaceship = "millenium falcon"
  store.menuOptions[3].disabled = false
}

function clearAutomators (): void {
  store.automators = []
}
</script>

<template>
  <div id="pad">
    <n-space align="center" justify="center" vertical size="large">
      <h1>{{ formattedMoney }}</h1>
      <n-button :loading="loadingGoToWork" :disabled="loadingGoToWork" @click="goToWork">
        <template #icon>
          <n-icon>
            <cash-outline />
          </n-icon>
        </template>
        grind (+{{ formattedPay }})
      </n-button> 
      <n-button v-if="store.cars.length > 0 && store.money >= 100" :disabled="store.carCost > store.money" @click="buyCar">
        <template #icon>
          <n-icon>
            <car-outline v-if="store.carCost <= 500" />
            <car-sport-outline v-else />
          </n-icon>
        </template>
        buy a new car (-${{ store.carCost }})
      </n-button> 
      <n-button v-if="store.money >= 500000" :disabled="store.spaceshipCost > store.money" @click="buySpaceship">
        <template #icon>
          <n-icon>
            <rocket-outline />
          </n-icon>
        </template>
        buy a spaceship (-${{ store.spaceshipCost }})
      </n-button> 
      <template v-if="Object.keys(store.posessions).length > 0">
        <p v-for="[k, v] in Object.entries(store.posessions)" :key="k">
          {{ k }}: {{ v }}
        </p>
      </template>
    </n-space>
  </div>
</template>

<style scoped>

</style>
