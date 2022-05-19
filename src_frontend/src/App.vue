<template>
  <div id="content">
    <DevLink v-if="devMode" />
    <SpeakerItemList />
  </div>
  <SettingsPanel />
  <SettingsButton />
  <OverviewPanel />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import DevLink from "./components/DevLink.vue";
import SettingsButton from "./components/SettingsButton.vue";
import SettingsPanel from "./components/SettingsPanel.vue";
import OverviewPanel from "./components/OverviewPanel.vue";
import SpeakerItemList from "./components/SpeakerItemList.vue";
import model from "./model";
import SequenceTools from "./logic/SequenceTools";
import PipelineJobUpdater from "./logic/PipelineJobUpdater";
import PipelineJobWatcher from "./logic/PipelineJobWatcher";
import ImportWatcher from "./logic/ImportWatcher";
import UnrealProjectTools from "./logic/UnrealProjectTools";
import ProjectTools from "./logic/ProjectTools";
import SlotRenderWatcher from "./logic/SlotRenderWatcher";
import OverviewWatcher from "./logic/OverviewWatcher";

@Options({
  components: {
    SpeakerItemList,
    DevLink,
    SettingsButton,
    SettingsPanel,
    OverviewPanel,
  },
})
export default class App extends Vue {
  get devMode(): boolean {
    return model.plugin.devMode.value;
  }

  mounted(): void {
    ProjectTools.setup();
    SequenceTools.setup();
    PipelineJobUpdater.setup();
    PipelineJobWatcher.setup();
    UnrealProjectTools.setup();
    SlotRenderWatcher.setup();
    ImportWatcher.setup();
    OverviewWatcher.setup();
  }
}
</script>

<style lang="scss">
@import "./styles/style.scss";

.item-list {
  flex-grow: 1;
}

.settings-icon {
  position: absolute;
  right: 10px;
  bottom: 55px;
}
</style>
