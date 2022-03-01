<template>
  <div id="content">
    <DevLink v-if="model.plugin.devMode" />
    <UnrealMappingPanel />
    <ItemsList />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import UnrealMappingPanel from "./components/UnrealMappingPanel.vue";
import DevLink from "./components/DevLink.vue";
import ItemsList from "./components/ItemsList.vue";
import model from "./model";
import SequenceTools from "./logic/SequenceTools";

@Options({
  components: {
    UnrealMappingPanel,
    ItemsList,
    DevLink,
  },
})
export default class App extends Vue {
  get model(): unknown {
    return model;
  }

  mounted(): void {
    SequenceTools.startWatchingMeta();
  }

  unmounted(): void {
    SequenceTools.stopWatchingMeta();
  }
}
</script>

<style lang="scss">
@import "./styles/style.scss";
</style>
