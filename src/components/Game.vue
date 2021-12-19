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

function openScreen(tab: string): void {
  store.openScreen = tab
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
  <div class="sidenav">
    <a href="#" @click="openScreen('count')">count</a>
    <a href="#" @click="openScreen('map')">map</a>
  </div>

  <div class="main">
    <Count v-if="store.openScreen === 'count'"/>
    <Map v-else-if="store.openScreen === 'map'"/>
    <div id="globalcontrols">
      <button type="button" @click="saveGame">save</button>
      <button class="button-with-margin" type="button" @click="store.reset">reset</button>
    </div>
  </div>
</template>

<style scoped>
* {box-sizing: border-box}

#globalcontrols {
  padding-top: 10px;
} 
.sidenav {
  height: 100%; /* Full-height: remove this if you want "auto" height */
  width: 160px; /* Set the width of the sidebar */
  position: fixed; /* Fixed Sidebar (stay in place on scroll) */
  z-index: 1; /* Stay on top */
  top: 0; /* Stay at the top */
  left: 0;
  text-align: left;
  background-color: #111; /* Black */
  overflow-x: hidden; /* Disable horizontal scroll */
  padding-top: 20px;
}

.sidenav a {
  padding: 6px 8px 6px 16px;
  text-decoration: none;
  font-size: 25px;
  color: #818181;
  display: block;
}

/* When you mouse over the navigation links, change their color */
.sidenav a:hover {
  color: #f1f1f1;
}

/* Style page content */
.main {
  margin-left: 160px; /* Same as the width of the sidebar */
  padding: 0px 10px;
}

/* On smaller screens, where height is less than 450px, change the style of the sidebar (less padding and a smaller font size) */
@media screen and (max-height: 450px) {
  .sidenav {padding-top: 15px;}
  .sidenav a {font-size: 18px;}
}
</style>
