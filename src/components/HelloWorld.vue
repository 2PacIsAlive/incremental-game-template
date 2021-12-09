<script setup lang="ts">
import { ref, computed } from 'vue'
import { Decimal } from 'decimal.js'
// @ts-ignore
import * as numberformat from 'swarm-numberformat'
// @ts-ignore
import { incrementors, Incrementor } from './incrementors'
// @ts-ignore
import { useStore } from '../store'

const backend = { backend: 'decimal.js', Decimal: Decimal}

defineProps<{ something: string }>()

const store = useStore(),
  automatorsToAdd = ref(1),
  incrementType = ref('constant'),
  formattedCount = computed(() => 
    numberformat.format(store.count, backend)
  ),
  formattedLag = computed(() =>
    store.lag.toFixed(0).toString().padStart(4, '0')
  ),
  formattedLastEventLoop = computed(() =>
    Decimal.sub(store.count as Decimal, store.lastCount as Decimal).toFixed(0)
  ),
  saveInterval = 30000

async function increment (): Promise<void> {
  store.count = await incrementors[incrementType.value](store.count as Decimal)
}

function addAutomators (): void {
  for (let i=0; i<automatorsToAdd.value; i++) {
    store.automators.push(incrementors[incrementType.value])
  }
}

function clearAutomators (): void {
  store.automators = []
}

function measureLag(): void {
  const start = performance.now()
  setTimeout(() => {
    store.lag = performance.now() - start
    measureLag()
  })
}

function saveGameIntermittently(): void {
  setTimeout(store.save, saveInterval)
} 

async function gameLoop() {
  while (1==1) {
    store.lastCount = store.count
    store.automators.forEach((automator: Incrementor) =>
      store.count = automator(store.count as Decimal)
    )
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}

measureLag()
saveGameIntermittently()
gameLoop()
</script>

<template>
  <h1>{{ formattedCount }}</h1>
  <p>added during last game loop: {{ formattedLastEventLoop }}</p>
  <p>lag: {{ formattedLag }}ms</p>
  <p>
    incrementor:
    <select v-model="incrementType">
      <option 
        v-for="(incrementor, index) in Object.keys(incrementors)"
        :key="index">{{ incrementor }}
      </option>
    </select>
    <button type="button" @click="increment">increment</button>
  </p>
  <p>
    automators to add:
    <input type="number" v-model="automatorsToAdd" />
    <button type="button" @click="addAutomators">add automator{{ automatorsToAdd > 1 ? 's' : '' }}</button>
  </p>
  <button type="button" @click="clearAutomators">clear automators</button>
  <button type="button" @click="store.save">save</button>
  <button type="button" @click="store.reset">reset</button>
</template>

<style scoped>
button {
  margin-left:10px;
}
</style>
