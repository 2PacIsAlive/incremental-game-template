<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from '../store'
// @ts-ignore
import * as numberformat from 'swarm-numberformat'
import { Decimal } from 'decimal.js'
import { incrementors } from './incrementors'

const backend = { backend: 'decimal.js', Decimal: Decimal }
import { NButton, NIcon, useLoadingBar, NSpace, NTooltip } from 'naive-ui'
import { CashOutline, CarOutline, CarSportOutline, BarbellSharp } from '@vicons/ionicons5'

const store = useStore(),
  loadingBar = useLoadingBar(),
  loadingWorkout = ref(false),
  formattedStrength = computed(() =>
    `${store.strength}`
  )

// async function increment (): Promise<void> {
//   store.count = await incrementors[incrementType.value](store.count as Decimal)
// }

// function addAutomators (): void {
//   for (let i=0; i<automatorsToAdd.value; i++) {
//     store.automators.push(incrementors[incrementType.value])
//   }
// }

async function workout(): Promise<void> {
  loadingWorkout.value = true
  loadingBar.start()
  await new Promise(resolve => setTimeout(resolve, store.workoutDuration))
  store.strength += store.gainz
  store.workoutDuration = store.workoutDuration - 100
  store.gainz += 1
  loadingWorkout.value = false
  loadingBar.finish()
}

function clearAutomators (): void {
  store.automators = []
}
</script>

<template>
  <n-space align="center" justify="center" vertical size="large">
    <n-tooltip placement="bottom" trigger="hover">
      <template #trigger>
        <h1>gainz: {{ formattedStrength }}</h1>
      </template>
      allows you to take damage from cops
    </n-tooltip>
    <n-button :loading="loadingWorkout" :disabled="loadingWorkout" @click="workout">
      <template #icon>
        <n-icon>
          <barbell-sharp />
        </n-icon>
      </template>
      work out (+{{ store.gainz }})
    </n-button> 
  </n-space>

</template>

<style scoped>

</style>
