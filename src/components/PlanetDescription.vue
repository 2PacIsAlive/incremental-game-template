<script setup lang="ts">
import { PlanetOutline } from '@vicons/ionicons5'
import { NThing, NAvatar, NIcon} from 'naive-ui'

defineProps<{ planet: any }>()

function display(info: string) {
  return (info === '—' || info === '—\n' || info === '\n' || info === '') ? '?' : info
}
</script>

<template>
  <n-thing id="planetdescription">
    <template #avatar>
      <!-- <n-avatar> -->
        <n-icon size="75" :color="planet.color">
          <planet-outline />
        </n-icon>
      <!-- </n-avatar> -->
    </template>
    <template #header> {{planet['Object\n']}} </template>
    <!-- <template #header-extra>
      visited
    </template> -->
    <template #description>
      <div style="text-align: left;">
        Star type: {{planet['Star type\n']}}<br />
        Mass (M⊕): {{display(planet['Mass (M⊕)\n'])}}<br />
        Radius (R⊕): {{display(planet['Radius (R⊕)\n'])}}<br />
        Density (g/cm3): {{display(planet['Density (g/cm3)\n'])}}<br />
        Flux (F⊕): {{display(planet['Flux (F⊕)\n'])}}<br />
        Teq (K): {{display(planet['Teq (K)\n'])}}<br />
        Period (days): {{display(planet['Period (days)\n'])}}<br />
      </div>
    </template>
  </n-thing>
</template>

<style scoped>
#planetdescription {
  /* TODO: how to center properly? */
  width: 26%;
  margin: auto;
}
</style>