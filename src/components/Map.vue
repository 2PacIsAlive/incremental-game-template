<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { useStore } from '../store'
import { storeToRefs } from 'pinia'
import { useSound } from '@vueuse/sound'
import sfx from '../assets/sfx.mp3'

const store = useStore()
const { count } = storeToRefs(store)

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

const ai = 'L'
const aiSpeed = ref(50)
let  aiExists = true
const aiIllegalMoves: string[] = [ 
  exit,
]

const starSpawnInterval = 3000

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

function isLegalMove (char: string, extraIllegals: string[]): boolean {
  return !(['│','┌','┐','└','┘','─'].concat(extraIllegals)
    .includes(char))
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

function isExit (char: string): boolean {
  return char === exit
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
    if (isLegalMove(nextChar, playerIllegalMoves)) {
      if (isStar(nextChar)) {
        store.stars += 1
        // @ts-ignore
        play({id: 'star'})
        if (playbackRate.value < 4) playbackRate.value += 0.01
      }
      if (isPortal(nextChar)) {
        next = nextPortal(nextChar)
        // @ts-ignore
        play({id: 'portal'})
      }
      if (isExit(nextChar)) nextMap()
      else moveEntity(player, current, next)    
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
  else return Math.abs(playerSpace - aiPath.value[0]) <= 100
}

async function moveAi() {
  while (aiExists) {
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
        const foundPath = await dijkstras(aiSpace, playerSpace)
        if (foundPath && aiPath.value.length > 0) {
          console.log('found you')
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
        alert('YOU DIED')
        store.deaths += 1
        moveEntity(player, current, playerDefaultLocation)
      }
      if (isLegalMove(nextChar, aiIllegalMoves)) {
        if (isStar(nextChar)) store.aiStars += 1
        if (isPortal(nextChar)) next = nextPortal(nextChar)
        moveEntity(ai, current, next)
      }
      await new Promise(resolve => setTimeout(resolve, 100 - aiSpeed.value))
    } else {
      aiExists = false
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

watch(count, (count: number, prevCount: number) => {
  if (count >= 1000000 && prevCount < 1000000) {
    setSpace(exit, exitSpace)
  }
})

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
