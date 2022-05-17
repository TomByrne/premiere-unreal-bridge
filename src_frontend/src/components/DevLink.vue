<template>
  <div class="dev-link panel">
    <h1>Dev</h1>
    <a :href="getDevUrl()" v-if="!isAtDevUrl()">{{ getDevUrl() }}</a>
    <a @click="loadBackend()">Load Backend</a>
    <a @click="clearMeta()">Clear Metadata</a>
    <JsonViewer class="model-viewer" :value="model" :openable="true"/>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import PluginTools from "../logic/PluginTools";
import model from "@/model";
import JsonViewer from "./JsonViewer.vue";
import SequenceTools from "@/logic/SequenceTools";

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
  clearMeta(): void {
    SequenceTools.clearMeta();
  }
  get model(): unknown {
    return model;
  }
}
</script>

<style scoped lang="scss">
.model-viewer {
  background: #333;
  border-radius: 3px;
}
</style>
