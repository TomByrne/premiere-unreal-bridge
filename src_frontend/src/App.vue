<template>
  <div id="content">
    <DevLink v-if="model.plugin.devMode" />
    <SpeakerItemList />
    <SettingsPanel />
  </div>
  <SettingsButton />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import DevLink from "./components/DevLink.vue";
import SettingsButton from "./components/SettingsButton.vue";
import SettingsPanel from "./components/SettingsPanel.vue";
import SpeakerItemList from "./components/SpeakerItemList.vue";
import model from "./model";
import SequenceTools from "./logic/SequenceTools";
import PipelineJobUpdater from "./logic/PipelineJobUpdater";
import PipelineJobWatcher from "./logic/PipelineJobWatcher";
import UnrealProjectTools from "./logic/UnrealProjectTools";
import ProjectTools from "./logic/ProjectTools";
import SlotRenderWatcher from "./logic/SlotRenderWatcher";

@Options({
  components: {
    SpeakerItemList,
    DevLink,
    SettingsButton,
    SettingsPanel,
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
    SlotRenderWatcher.setup();
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
  right: 15px;
  bottom: 15px;
}
</style>
