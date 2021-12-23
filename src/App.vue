<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
// @ts-ignore
import Game from './components/Game.vue'
import { useStore } from './store'
import { darkTheme, NConfigProvider, NLoadingBarProvider, NGrid, NGi } from 'naive-ui'

const store = useStore()
</script>

<template>
  <n-config-provider :theme="darkTheme">
    <n-loading-bar-provider>
      <div class="app">
        <div id="content-wrap">
          <Game />
        </div>
        <footer id="footer">
          <span id="saveddisplay" v-if="store.displaySaved">saved </span>
          <span>lag: {{ store.lag.toFixed(0) }}ms </span>
          <span id="reset" @click="store.reset()">reset </span>
        </footer>
      </div>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<style>
body, html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

#app {
  font-family: Inconsolata;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  display: flex;
  /* align-items: center; */
  /* justify-content: center; */
  height: 100vh;
}

#content-wrap {
  flex: 1
}

#footer {
  position: absolute;
  bottom: 8px;
  right: 16px;
  font-size: 18px;
}

#saveddisplay {
  color: green;
}

.button-with-margin {
  margin-left:10px;
}

#reset {
  text-align: right;
  color: red;
}
#reset:hover {
  cursor: pointer;
}
</style>
