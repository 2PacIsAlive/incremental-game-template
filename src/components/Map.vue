<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { useStore } from '../store'

const store = useStore()

const width = 59
const height = 31

const player = '@'
const playerDefaultLocation = 1172
const ai = 'L'
const aiSpeed = ref(50)

const starSpawnInterval = 3000

let lastAiDirection = 'D'

window.addEventListener('keydown', doCommand)

onUnmounted(() => {
	window.removeEventListener('keydown', doCommand)
})

const directionKeys: any = {
  'w': 'U', '&': 'U',
  'a': 'L', '%': 'L',
  's': 'D', '(': 'D',
  'd': 'R', '\'': 'R'
}

const directions: string[] = Object.values(directionKeys)

function isLegalMove (char: string): boolean {
  return !(['│','┌','┐','└','┘','─'].includes(char))
}

function isPlayer (char: string): boolean {
  return char === player
}

function isStar (char: string): boolean {
  return char === '*'
}

function isPortal (char: string): boolean {
  return char.toLowerCase() === 'p'
}

// NOTE: will always teleport to the right of the exit portal so that it doesn't get overwritten
function nextPortal (char: string): number {
  if (char === 'p') return store.map.indexOf('P') + 1
  else return store.map.indexOf('p') + 1
}

function setSpace (char: string, location: number): void {
  store.map = store.map.substring(0, location) + char + store.map.substring(location + 1)
}

function moveEntity (entity: string, current: number, next: number): void {
  setSpace(entity, next)
  setSpace(' ', current)  
}

function findNextMove (entity: string, direction: string) {
  const current: number = store.map.indexOf(entity)
  let next: number = current
  if (direction === 'U')
    next = current - width - 1
  else if (direction === 'D')
    next = current + width + 1
  else if (direction === 'L')
    next = current - 1
  else if (direction === 'R')
    next = current + 1
  const nextChar = store.map[next]
  return { current, next, nextChar }
}

// TODO what is e type
function doCommand(e: any) {
  const direction = directionKeys[String.fromCharCode(e.keyCode).toLowerCase()]
  if (direction) {
    let { current, next, nextChar } = findNextMove(player, direction)
    if (isLegalMove(nextChar)) {
      if (isStar(nextChar)) store.stars += 1
      if (isPortal(nextChar)) next = nextPortal(nextChar)
      moveEntity(player, current, next)    
    }
  }
}

async function moveAi() {
  while (1==1) {
    let direction = lastAiDirection
    if (Math.random() > .8) { // most of the time, try to go the same direction as the last move
      direction = directions[Math.floor(Math.random() * directions.length)]
      lastAiDirection = direction
    }
    let { current, next, nextChar } = findNextMove(ai, direction)
    if (isPlayer(nextChar)) {
      alert('YOU DIED')
      store.deaths += 1
      moveEntity(player, current, playerDefaultLocation)
    }
    if (isLegalMove(nextChar)) {
      if (isStar(nextChar)) store.aiStars += 1
      if (isPortal(nextChar)) next = nextPortal(nextChar)
      moveEntity(ai, current, next)
    }
    await new Promise(resolve => setTimeout(resolve, 100 - aiSpeed.value))
  }
}

function randomSpace(): number {
    const min = Math.ceil(width + 1)
    const max = Math.floor(store.map.length - width - 1)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function spawnNewStar(): void {
  let foundAvailableSpace, space
  while (!foundAvailableSpace) {
    space = randomSpace()
    if (store.map[space] === ' ') {
      setSpace('*', space)
      foundAvailableSpace = true
    }
  }
}

function spawnNewStarsIntermittently (): void {
  setInterval(spawnNewStar, starSpawnInterval)
}

spawnNewStarsIntermittently()
moveAi()
</script>

<template>
  <pre>{{store.map}}</pre>
  <p>deaths: {{store.deaths}}</p>
  <p>stars: {{store.stars}}</p>
  <p>ai stars: {{store.aiStars}}</p>
  <p>
    ai speed:
    <input type="range" min="0" max="100" class="slider" id="aispeed" v-model="aiSpeed">
  </p>
</template>

<style scoped>

</style>
