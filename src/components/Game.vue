<script setup lang="ts">
import { Component, h, onMounted, ref } from 'vue'
import { Decimal } from 'decimal.js'
import { Incrementor } from './incrementors'
import { useStore } from '../store'
// @ts-ignore
import Streets from './Streets.vue'
// @ts-ignore
import Pad from './Pad.vue'
// @ts-ignore
import Gym from './Gym.vue'
// @ts-ignore
import Space from './Space.vue'
import { NIcon, NSpace, NSwitch, NLayout, NLayoutSider, NMenu, useMessage } from 'naive-ui'
import { HomeOutline, CaretDownOutline, SkullOutline, SubwayOutline, StorefrontOutline, BarbellOutline, StarOutline } from '@vicons/ionicons5'

const store = useStore(),
  collapsed = ref(false),
  message = useMessage(),
  saveInterval = 20000

function renderMenuLabel (option: any) {
  return option.disabled
    ? false
    : h('h3', { onClick: function () { openScreen(option.label) } }, option.label)
}

function renderMenuIcon (option: any) {
  let icon = HomeOutline
  if (option.key === 'the streets') icon = SkullOutline
  else if (option.key === 'the gym') icon = BarbellOutline
  else if (option.key === 'the stars') icon = StarOutline
  return option.disabled
    ? false
    : h(NIcon, { onClick: function () { openScreen(option.label) } }, { default: () => 
      // @ts-ignore
      h(icon, { onClick: function () { openScreen(option.label) } }) 
    }) 
}

function expandIcon () {
  return h(NIcon, null, { default: () => h(CaretDownOutline) })
}

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
  message.info('game saved')
  // notification.info({
  //   title: 'game saved',
  //   // content: `game saved`,
  //   meta: new Date().toLocaleTimeString(),
  //   duration: 2500,
  //   closable: true,
  // })
  // store.displaySaved = true
  // setTimeout(() => store.displaySaved = false, 2000)
}

function saveGameIntermittently(): void {
  setInterval(saveGame, saveInterval)
} 

async function gameLoop() {
  while (1==1) {
    store.lastMoney = store.money
    store.automators.forEach((automator: Incrementor) =>
      store.money = automator(store.money as Decimal)
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
  <n-space vertical>
    <n-layout has-sider position="absolute">
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="190"
        :collapsed="collapsed"
        show-trigger
        @collapse="collapsed = true"
        @expand="collapsed = false"
      >
        <n-menu
          :collapsed="collapsed"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="store.menuOptions"
          :render-label="renderMenuLabel"
          :render-icon="renderMenuIcon"
          :expand-icon="expandIcon"
        />
      </n-layout-sider>
      <n-layout>
        <Pad class="game-screen" v-if="store.openScreen === 'the pad'" />
        <Streets class="game-screen" v-else-if="store.openScreen === 'the streets'" />
        <Gym class="game-screen" v-else-if="store.openScreen === 'the gym'" />
        <Space class="game-screen" v-else-if="store.openScreen === 'the stars'" />
      </n-layout>
    </n-layout>
  </n-space>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.game-screen {
  margin-top: 3%
}
</style>
