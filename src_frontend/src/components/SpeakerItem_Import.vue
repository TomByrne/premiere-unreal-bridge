<template>
  <div
    class="speaker-row"
    :class="{
      minimised: minimised,
      hidden: hidden,
    }"
  >
    <div class="header">
      <span class="label-sup">
        <FolderLink
          :path="imgPath"
          title="Unreal render path (relative to Premiere project)"
        />
        Import:
      </span>

      <div class="label">{{ label }}</div>
      <IconButton icon="mouse-pointer" v-if="selectable" @click="selectProjItem"/>

      <span class="buttons">
        <button class="small" @click="importItem()" :disabled="!importable">
          {{ hasImported ? "Re-import Render" : "Import Render" }}
        </button>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import model from "@/model";
import { SpeakerImportState, SpeakerItem } from "@/model/sequence";
import SequenceTools from "@/logic/SequenceTools";
import FolderLink from "./FolderLink.vue";

@Options({
  props: {
    speaker: null,
    minimised: Boolean,
    hidden: Boolean,
  },
  components: {
    FolderLink,
  },
})
export default class SpeakerItem_Import extends Vue {
  speaker: SpeakerItem | undefined;

  get label(): string {
    switch (this.speaker?.import.state) {
      case SpeakerImportState.Done:
        return "Imported";
      case SpeakerImportState.Ready:
        return "Ready to import";
      case SpeakerImportState.NotReady:
        if (!model.sequence.sequenceMeta?.render_track)
          return "Must add video track first";
        else return "Not ready to import";

      default:
        return "Unknown state";
    }
  }

  get imgPath(): string | undefined {
    return this.speaker?.import.asset_path;
  }

  get importable(): boolean {
    const state = this.speaker?.import.state;
    return !!(state && state != SpeakerImportState.NotReady);
  }

  get selectable(): boolean {
    return !!this.speaker?.import.render_track_item;
  }

  get hasImported(): boolean {
    let item = this.speaker;
    if (!item) return false;
    return !!item.import.render_track_item;
  }

  importItem(): void {
    if (this.speaker) SequenceTools.importSpeakerRender(this.speaker.id, true);
  }

  selectProjItem(): void {
    const item = this.speaker?.import.render_track_item;
    if(item) SequenceTools.selectTrackItem(item);
  }
}
</script>

<style scoped lang="scss">
</style>
