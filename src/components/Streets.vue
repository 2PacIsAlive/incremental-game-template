<script setup lang="ts">
import { computed, onUnmounted, ref, watch, onActivated } from 'vue'
import { useStore } from '../store'
import { storeToRefs } from 'pinia'
import { useSound } from '@vueuse/sound'
import sfx from '../assets/sfx.mp3'
import { NSlider } from 'naive-ui'
import { Decimal } from 'decimal.js'

const store = useStore()
const { money } = storeToRefs(store)
const coloredMap = computed(() => {
  return store.map
    // note: need to do this one first because "span" has a p in it lmao
    .replace(/\p/g, coloredSpace('p', '#09f8f6'))
    .replace(/\P/g, coloredSpace('P', '#09f8f6'))
    .replace(/\@/g, coloredSpace(player, '#36AD6AFF')) // TODO how to interpolate 
    .replace(/\C/g, coloredSpace(ai, 'red'))
    .replace(/\*/g, coloredSpace('*', '#b39700'))
})

const playbackRate = ref(1)
const { play, sound } = useSound(sfx, { 
  sprite: {
    star: [0, 600],
    portal: [1000, 400],
    nextMap: [2000, 4000],
    death: [7000, 6000],
  },
  playbackRate,
})

const width = 59
const height = 31

const exitSpace = 1798
const exit = 'e'

const player = '@'
const playerDefaultLocation = 1172
const playerIllegalMoves: string[] = []

const ai = 'C'
const aiRegex = /C/g
const aiSpeed = ref(50)
const aiSearching = ref(true)
const aiExists = ref(true)
const aiIllegalMoves: string[] = [ 
  exit,
  'p', 'P'
]

const starSpawnInterval = 5000

let lastAiDirection = 'D'
const aiPath = ref([])

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

function coloredSpace(char: string, color: string): string {
  return `<span style="color: ${color}">${char}</span>`
}

function isLegalMove (char: string, extraIllegals: string[]): boolean {
  return !(['│','┌','┐','└','┘','─','\n'].concat(extraIllegals)
    .includes(char))
}

function isValidMove(current: number, next: number): boolean {
  if (next === current+1
    || next === current-1
    || next === current-width-1
    || next === current+width+1) return true
  return false
}

function isPlayer (char: string): boolean {
  return char === player
}

function isStar (char: string): boolean {
  return char === '*'
}

function isPortal (char: string): boolean {
  return char?.toLowerCase() === 'p'
}

function isExit (char: string): boolean {
  return char === exit
}

// NOTE: will always teleport to the right of the exit portal so that it doesn't get overwritten
function nextPortal (char: string): number {
  if (char === 'p') return store.map.indexOf('P') + 1
  else return store.map.indexOf('p') + 1
}

function setSpace (char: string, location: number): void {
  const mapCopy = store.map // this helps..? ai freaks out without it?
  store.map = mapCopy.substring(0, location) + char + mapCopy.substring(location + 1)
}

function moveEntity (entity: string, current: number, next: number, isJump: boolean): void {
  if (!isJump && !isValidMove(current, next)) {
    console.warn(entity, 'attempted invalid move from', current, 'to', next)
  } else {
    setSpace(entity, next)
    setSpace(' ', current) 
  setSpace(' ', current)  
    setSpace(' ', current) 
  }
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
    if (isLegalMove(nextChar, playerIllegalMoves)) {
      if (isStar(nextChar)) {
        store.stars += 1
        store.money = Decimal.add(store.money, 100 * store.stars)
        // @ts-ignore
        play({id: 'star'})
        if (playbackRate.value < 4) playbackRate.value += 0.001
      }
      let isJump = false
      if (isPortal(nextChar)) {
        isJump = true
        next = nextPortal(nextChar)
        // @ts-ignore
        play({id: 'portal'})
      }
      if (isExit(nextChar)) nextMap()
      else moveEntity(player, current, next, isJump)    
    }
  }
}

function nextMap () {
  // @ts-ignore
  play({id: 'nextMap'})
  store.map = 
`┌─────────────────────────────────────────────────────────┐
│ P                                                     L │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                             @                           │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│ p                                                       │
└─────────────────────────────────────────────────────────┘`
}

// TODO this is super flawed, need to find a better way of doing this
function isAiPathAccurate (playerSpace: number) {
  if (aiPath.value.length < 1) return false
  else return true // Math.abs(playerSpace - aiPath.value[0]) <= 100
}

async function moveAi() {
  console.log('STARTING AI MOVEMENT ROUTINE')
  while (aiExists) {
    store.aiMovementRoutineStarted = true
    // aiPath.value.forEach((space, i) => {
    //   if (i !== aiPath.value.length-1 && store.map[space] === ' ') setSpace('.', space)
    // })
    if ((store.map.match(aiRegex)||[]).length > 1) {
      console.log('something fucky happened', aiPath.value)
      aiPath.value = []
      setSpace(' ', store.map.indexOf(ai))
    }
    const aiSpace = store.map.indexOf(ai)
    const playerSpace = store.map.indexOf(player)
    if (aiSpace !== -1) {
      let current = aiSpace
      let next = current
      let nextChar
      if (isAiPathAccurate(playerSpace)) { // our path is good enough, let's take it without searching again
        next = aiPath.value.pop()
        nextChar = store.map[next]
      } else { // player has moved, need to find a new path
        aiSearching.value = true
        const foundPath = await dijkstras(aiSpace, playerSpace)
        if (foundPath && aiPath.value.length > 0) {
          aiSearching.value = false
          next = aiPath.value.pop()
          nextChar = store.map[next]
        } else { // couldn't find a path to player
          let direction = lastAiDirection
          if (Math.random() > .8) { // most of the time, try to go the same direction as the last move
            direction = directions[Math.floor(Math.random() * directions.length)]
            lastAiDirection = direction
          }
          ({ current, next, nextChar } = findNextMove(ai, direction))
        }
      }
      if (isPlayer(nextChar)) {
        // @ts-ignore
        play({id: 'death'})
        store.showDeathModal = true
        // alert('YOU DIED')
        store.deaths += 1
        store.menuOptions[2].disabled = false
        moveEntity(player, current, playerDefaultLocation, true)
      }
      if (isValidMove(current, next)) {
        if (isLegalMove(nextChar, aiIllegalMoves)) {
          if (isStar(nextChar)) store.aiStars += 1
          moveEntity(ai, current, next, false)
        }
      } else {
        console.log('ai path got hosed, nuking from orbit')
        aiPath.value = []
      }
      await new Promise(resolve => setTimeout(resolve, 100 - aiSpeed.value))
    } else {
      aiExists.value = false
    }
  }
}

function randomSpace(): number {
    const min = Math.ceil(width + 1)
    const max = Math.floor(store.map.length - width - 1)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function spawnNewStar(): void {
  let foundAvailableSpace, space
  let attempts = 0
  while (!foundAvailableSpace && attempts < 1000) {
    space = randomSpace()
    if (store.map[space] === ' ') {
      setSpace('*', space)
      foundAvailableSpace = true
    }
    attempts += 1
  }
}

function spawnNewStarsIntermittently (): void {
  setInterval(spawnNewStar, starSpawnInterval)
}

function getLegalNeighbors (space: number, nodes: any[]): any[] {
  return [
    space + 1,
    space - 1,
    space - width - 1,
    space + width + 1
  ].filter(s => isLegalMove(store.map[s], []))
    .map(s => nodes.find(n => n.i === s))
}

// function hasUnexploredNodes (nodes: any[]) {
//   return nodes.find((node: any) => node.explored)
// }

function savePath (endingNode: any): void {
  let currentNode = endingNode
  const path: any[] = []
  while (currentNode.parent !== null) {
    if (currentNode.char !== ai) {
      path.push(currentNode.i)
      currentNode = currentNode.parent
      // if (currentNode.char !== ai)
      //   setSpace('!', currentNode.i)
    }
  }
  // @ts-ignore TODO wut
  aiPath.value = path
}

async function dijkstras (startingSpace: number, destinationSpace: number): Promise<any> {
  const nodes = store.map.split('')
    .map((space: string, i: number) => {
      return {
        char: space,
        i: i,
        dist: i === startingSpace ? 0 : Number.MAX_VALUE,
        parent: null,
        explored: false,
      }
    })
  while (1==1) {
    const unexploredNodes = nodes.filter((node: any) => !node.explored)
    if (unexploredNodes.length === 0) {
      console.log('dijkstras failed')
      return false
    } else {
      unexploredNodes.sort((a: any, b: any) => a.dist > b.dist ? 1 : -1)
      const currentNode = unexploredNodes[0]
      currentNode.explored = true
      if (currentNode.i === destinationSpace) {
        // console.log('found path!')
        // console.log(currentNode)
        savePath(currentNode)
        return true
      } else {
        const neighbors = getLegalNeighbors(currentNode.i, nodes)
        for (let n=0; n<neighbors.length; n++) {
          const neighborNode = neighbors[n]
          if (neighborNode) { // TODO why is this ever undefined? 
            const newDist = currentNode.dist + 1
            if (newDist < neighborNode.dist) {
              neighborNode.dist = newDist
              neighborNode.parent = currentNode
            }
          }
        }
      }
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }
}

watch(money, (money: number, prevMoney: number) => {
  if (money >= 1000000 && prevMoney < 1000000)
    setSpace(exit, exitSpace)
})

if (!store.aiMovementRoutineStarted) moveAi()
if (!store.starSpawnerStarted) spawnNewStarsIntermittently()
</script>

<template>
  <div id="streets">
    <p v-if="aiExists && aiSearching">the <span style="color: red">cops</span> are looking for you</p>
    <p id="run" v-else-if="aiExists && !aiSearching">you should probably run</p>
    <!-- <pre>{{store.map}}</pre> -->
    <pre v-html="coloredMap"></pre>
    <p>nab <span style="color: #b39700">stars</span> to earn dough (arrow keys or wasd)</p>
    <p>use <span style="color: #09f8f6">portals</span> to access other parts of the map</p>
  </div>
  <!-- <p>deaths: {{store.deaths}}</p>
  <p>stars: {{store.stars}}</p>
  <p>ai stars: {{store.aiStars}}</p>
  <p>
    ai speed:
    <n-slider
      :step="1"
      :format-tooltip="value => `${value}%`"
      v-model:value="aiSpeed"
    />
  </p> -->
</template>

<style scoped>
pre {
  line-height: 1.2; 
}
#streets {
  text-align: center; 
}
#run {
  color: red;
}
</style>
