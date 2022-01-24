<template>
  <div class="panel">
    <h1>Dev</h1>
    <a :href="getDevUrl()" v-if="!isAtDevUrl()">{{ getDevUrl() }}</a>
    <a @click="loadBackend()">Load Backend</a>
    <input type="text" />
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import PluginTools from "../logic/PluginTools";

export default class DevLink extends Vue {
  isAtDevUrl(): boolean {
    return PluginTools.isAtDevUrl();
  }
  getDevUrl(): string {
    return PluginTools.getDevUrl();
  }
  loadBackend(): void {
    return PluginTools.loadBackend();
  }
}
</script>

<style scoped lang="scss"></style>
