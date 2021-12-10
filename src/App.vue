<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
// @ts-ignore
import HelloWorld from './components/HelloWorld.vue'

import { useStore } from './store'

const store = useStore()
</script>

<template>
  <div class="app">
    <div id="content-wrap">
      <HelloWorld something="anything" />
    </div>
    <footer id="footer">
      <p id="saveddisplay" v-if="store.displaySaved">game saved</p>
    </footer>
  </div>
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
  text-align: center;
  color: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
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
</style>
