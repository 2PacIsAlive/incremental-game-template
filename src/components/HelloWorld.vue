<script setup lang="ts">
import { ref, computed } from 'vue'
import { Decimal } from 'decimal.js'
// @ts-ignore
import * as numberformat from 'swarm-numberformat'
// @ts-ignore
import { incrementors, Incrementor } from './incrementors'

const backend = { backend: 'decimal.js', Decimal: Decimal}

defineProps<{ something: string }>()

const count = ref<Decimal.Value>(new Decimal(0)),
  lastCount = ref<Decimal.Value>(new Decimal(0)),
  automatorsToAdd = ref(1),
  incrementType = ref('constant'),
  automators = ref<Incrementor[]>([]),
  lag = ref(0),
  formattedCount = computed(() => 
    numberformat.format(count.value, backend)
  ),
  formattedLag = computed(() =>
    lag.value.toFixed(0).padStart(2, ' ')
  ),
  formattedLastEventLoop = computed(() =>
    Decimal.sub(count.value as Decimal, lastCount.value as Decimal)
      .toFixed(0).padStart(2, ' ')
  )

async function increment (): Promise<void> {
  count.value = await incrementors[incrementType.value](count.value as Decimal)
}

function addAutomators (): void {
  for (let i=0; i<automatorsToAdd.value; i++) {
    automators.value.push(incrementors[incrementType.value])
  }
}

function clearAutomators (): void {
  automators.value = []
}

function measureLag(iteration: number): void {
  const start = performance.now()
  setTimeout(() => {
    lag.value = performance.now() - start
    measureLag(iteration + 1)
  })
}

async function gameLoop() {
  while (1==1) {
    lastCount.value = count.value
    automators.value.forEach(automator =>
      count.value = automator(count.value as Decimal)
    )
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}

measureLag(1)
gameLoop()
</script>

<template>
  <h1>{{ formattedCount }}</h1>
  <p>added during last game loop: {{ formattedLastEventLoop }}</p>
  <p>lag: {{ formattedLag }}ms</p>
  <button type="button" @click="increment">increment</button>
  <p>
    incrementor:
    <select v-model="incrementType">
      <option 
        v-for="(incrementor, index) in Object.keys(incrementors)"
        :key="index">{{ incrementor }}
      </option>
    </select>
  </p>
    <button type="button" @click="addAutomators">add automator(s)</button>
  <p>
    number of automators to add:
    <input type="number" v-model="automatorsToAdd" />
  </p>
  <button type="button" @click="clearAutomators">clear automators</button>
</template>

<style scoped>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
