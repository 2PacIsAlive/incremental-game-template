<script setup lang="ts">
import { computed, onUnmounted, ref, watch, onActivated, Ref } from 'vue'
import { useStore } from '../store'
import { storeToRefs } from 'pinia'
import { useSound } from '@vueuse/sound'
import sfx from '../assets/sfx.mp3'
import { NButton, NSlider, NSpace, NLayout } from 'naive-ui'
import { Decimal } from 'decimal.js'
import { galaxy } from '../store/maps'
import planets from  './planets.json'
// @ts-ignore
import PlanetDescription from './PlanetDescription.vue'

const store = useStore()
const { money } = storeToRefs(store)

const hoveredPlanet = ref({})

const coloredMap = computed(() => {
  let colored = galaxy
  for (let i=0; i<store.planetsAvailable; i++) {
    const oldLength = colored.length
    colored = colored.substring(0, planets[i]["loc"]) + coloredSpace('*', planets[i].color, `planetDetails(${i})`, `planet-${i}`) + colored.substring(planets[i]["loc"] + 1)
    const lengthDelta = colored.length - oldLength
    for (let ii=0; ii<planets.length; ii++) {
      if (planets[ii].loc > planets[i].loc) {
        planets[ii].loc += lengthDelta
      }
    } 
  }
  return colored
})

const playbackRate = ref(1)
const { play, sound } = useSound(sfx, { 
  sprite: {
    // star: [0, 600],
    // portal: [1000, 400],
    nextMap: [2000, 4000],
    // death: [7000, 6000],
  },
  playbackRate,
})

function coloredSpace(char: string, color: string, onClickFn: string, id: string): string {
  return `<span id="${id}" style="color: ${color}">${char}</span>`
}

function handleClick(e: any) {
  if (e.target.id) {
    const planetId = e.target.id.split('-')[1]
    store.currentPlanet = planetId
  }
}

function handleMouseover(e: any) {
  if (e.target.id) {
    const planetId = e.target.id.split('-')[1]
    hoveredPlanet.value = planets[planetId]
    console.log(planets[planetId])
  } else {
    hoveredPlanet.value = {}
  }
}

function getStyle(planet: any) {
  return `color: ${planet.color}`
}
</script>

<template>
  <div id="space">
    <p>you are on <span :style="getStyle(planets[store.currentPlanet])">{{ planets[store.currentPlanet]['Object\n'] }}</span></p>
    <pre v-html="coloredMap" @click="handleClick" @mouseover="handleMouseover" @mouseleave="handleMouseover"></pre>
    <planet-description :planet="hoveredPlanet" v-if="'loc' in hoveredPlanet">
      {{ hoveredPlanet}}
    </planet-description>
  </div>
</template>

<style scoped>
pre {
  line-height: 1; 
  cursor: pointer;
}
#space {
  text-align: center; 
}
</style>
