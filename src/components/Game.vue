<script setup lang="ts">
import { onMounted } from 'vue'
import { Decimal } from 'decimal.js'
import { Incrementor } from './incrementors'
import { useStore } from '../store'
// @ts-ignore
import Map from './Map.vue'
// @ts-ignore
import Count from './Count.vue'

defineProps<{ something: string }>()

const store = useStore(),
  saveInterval = 10000

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

function saveGame(): void {
  store.save()
  store.displaySaved = true
  setTimeout(() => store.displaySaved = false, 2000)
}

function saveGameIntermittently(): void {
  setInterval(saveGame, saveInterval)
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
    <button class="tablinks" @click="openTab('count', $event)" id="defaulttab">count</button>
    <button class="tablinks" @click="openTab('map', $event)">map</button>
  </div>

  <div id="count" class="tabcontent">
    <Count />
  </div>

  <div id="map" class="tabcontent">
   <Map />
  </div>

  <div id="globalcontrols">
    <button type="button" @click="saveGame">save</button>
    <button class="button-with-margin" type="button" @click="store.reset">reset</button>
  </div>
</template>

<style scoped>
#globalcontrols {
  padding-top: 10px;
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
  padding: 12px 16px;
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
  padding: 2px 20px 10px;
  border: 1px solid #ccc;
  border-top: none;
}

.tabcontent {
  animation: fadeEffect 1s;
}

@keyframes fadeEffect {
  from {opacity: 0;}
  to {opacity: 1;}
}
</style>
