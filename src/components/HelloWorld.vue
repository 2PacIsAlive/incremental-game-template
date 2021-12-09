<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Decimal } from 'decimal.js'
// @ts-ignore
import * as numberformat from 'swarm-numberformat'
// @ts-ignore
import { incrementors, Incrementor } from './incrementors'
// @ts-ignore
import { useStore } from '../store'
import map from './map'

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

function openTab(tab: string, event: any): void {
  const tabcontent = document.getElementsByClassName("tabcontent") as HTMLCollectionOf<HTMLElement>
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none"
  }
  const tablinks = document.getElementsByClassName("tablinks")
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "")
  }
  const tabElement = document.getElementById(tab)
  if (tabElement) tabElement.style.display = "block"
  event.currentTarget.className += " active"
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

onMounted(() => {
  document.getElementById('defaulttab')?.click()
})

measureLag()
saveGameIntermittently()
gameLoop()
</script>

<template>
  <div class="tab">
    <button class="tablinks" @click="openTab('count', $event)" id="defaulttab">Count</button>
    <button class="tablinks" @click="openTab('map', $event)">Map</button>
  </div>

  <div id="count" class="tabcontent">
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
  </div>

  <div id="map" class="tabcontent">
   <pre><code>{{map}}</code></pre>
  </div>

  <div id="globalcontrols">
    <button type="button" @click="store.save">save</button>
    <button type="button" @click="store.reset">reset</button>
  </div>
</template>

<style scoped>
#globalcontrols {
  padding-top: 10px;
} 

button {
  margin-left:10px;
}

.tab {
  overflow: hidden;
  border: 1px solid #ccc;
  background-color: #f1f1f1;
}

.tab button {
  background-color: inherit;
  float: left;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 14px 16px;
  transition: 0.3s;
}

.tab button:hover {
  background-color: #ddd;
}

.tab button.active {
  background-color: #ccc;
}

.tabcontent {
  display: none;
  padding: 2px 50px 50px;
  border: 1px solid #ccc;
  border-top: none;
}

.tabcontent {
  animation: fadeEffect 1s; /* Fading effect takes 1 second */
}

/* Go from zero to full opacity */
@keyframes fadeEffect {
  from {opacity: 0;}
  to {opacity: 1;}
}

code {
  /* background-color: #eee; */
  padding: 0px 0px;
  border-radius: 0px;
  /* color: #304455; */
}
</style>
