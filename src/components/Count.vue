<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from '../store'
// @ts-ignore
import * as numberformat from 'swarm-numberformat'
import { Decimal } from 'decimal.js'
import { incrementors } from './incrementors'

const backend = { backend: 'decimal.js', Decimal: Decimal }

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
  )

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
    <button class="button-with-margin" type="button" @click="increment">increment</button>
  </p>
  <p>
    automators to add:
    <input type="number" v-model="automatorsToAdd" />
    <button class="button-with-margin" type="button" @click="addAutomators">add automator{{ automatorsToAdd > 1 ? 's' : '' }}</button>
  </p>
  <button type="button" @click="clearAutomators">clear automators</button>
</template>

<style scoped>

</style>
