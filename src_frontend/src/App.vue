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
import PipelineJobUpdater from "./logic/PipelineJobUpdater";
import PipelineJobWatcher from "./logic/PipelineJobWatcher";
import UnrealProjectTools from "./logic/UnrealProjectTools";
import ProjectTools from "./logic/ProjectTools";

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
    ProjectTools.setup();
    SequenceTools.setup();
    PipelineJobUpdater.setup();
    PipelineJobWatcher.setup();
    UnrealProjectTools.setup();
  }
}
</script>

<style lang="scss">
@import "./styles/style.scss";
</style>
