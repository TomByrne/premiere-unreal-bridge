<template>
  <div class="panel">
    <h1>Dev</h1>
    <a :href="getDevUrl()" v-if="!isAtDevUrl()">{{ getDevUrl() }}</a>
    <a @click="loadBackend()">Load Backend</a>
    <JsonViewer :value="model" :openable="true"/>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import PluginTools from "../logic/PluginTools";
import model from "@/model";
import JsonViewer from "./JsonViewer.vue";

@Options({
  components: {
    JsonViewer,
  },
})
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
  get model(): unknown {
    return model;
  }
}
</script>

<style scoped lang="scss"></style>
