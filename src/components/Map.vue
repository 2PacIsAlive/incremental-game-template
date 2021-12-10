<script setup lang="ts">
import { onUnmounted } from 'vue'
import { useStore } from '../store'

const store = useStore()

const width = 59
const height = 31

const player = '@'

window.addEventListener('keydown', doCommand)

onUnmounted(() => {
	window.removeEventListener('keydown', doCommand)
})

const directions: any = {
  'w': 'U',
  '&': 'U',
  'a': 'L',
  '%': 'L',
  's': 'D',
  '(': 'D',
  'd': 'R',
  '\'': 'R'
}

function isLegalMove (char: string): boolean {
  return !(['│','┌','┐','└','┘','─'].includes(char))
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

function movePlayer (current: number, next: number): void {
  store.map = store.map.substring(0, next) + player + store.map.substring(next + 1)
  store.map = store.map.substring(0, current) + ' ' + store.map.substring(current + 1)  
}

function doCommand(e: any) {
  const cmd = directions[String.fromCharCode(e.keyCode).toLowerCase()]
  if (cmd) {
    const current = store.map.indexOf(player)
    let next: number = current
    if (cmd === 'U')
      next = current - width - 1
    else if (cmd === 'D')
      next = current + width + 1
    else if (cmd === 'L')
      next = current - 1
    else if (cmd === 'R')
      next = current + 1
    const nextChar = store.map[next]
    if (isLegalMove(nextChar)) {
      if (isStar(nextChar)) store.stars += 1
      if (isPortal(nextChar)) next = nextPortal(nextChar)
      movePlayer(current, next)    
    } else {
      console.warn('illegal', nextChar)
    }
  }
  // do stuff
}
</script>

<template>
  <pre><code>{{store.map}}</code></pre>
  <p>stars: {{store.stars}}</p>
</template>

<style scoped>
code {
  /* background-color: #eee; */
  padding: 0px 0px;
  border-radius: 0px;
  /* color: #304455; */
}
</style>
