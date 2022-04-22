<template>
  <div
    class="speaker-row"
    :class="{
      minimised: minimised,
      hidden: hidden,
    }"
  >
    <div class="header">
      <span class="label-sup"><FolderLink :path="imgPath" title="Unreal render path (relative to Premiere project)"/>Import:</span>

      <div class="label"></div>

      <span class="buttons">
        <button class="small" @click="importItem()" :disabled="!importable">
          Import Render
        </button>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import model from "@/model";
import { SpeakerItem } from "@/model/sequence";
import fs from "fs";
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

  get imgPath() {
    return this.speaker?.import.asset_path;
  }

  get importable(): boolean {
    let item = this.speaker;
    if (!item) return false;
    let meta = model.sequence.sequenceMeta;
    if (!meta || !meta.render_track) return false;
    //TODO: move this logic into a service
    const hasFiles = item.import.asset_path
      ? fs.existsSync(item.import.asset_path) &&
        fs.readdirSync(item.import.asset_path).length > 0
      : false;
    return !!(item && !item.import.render_proj_item && hasFiles);
  }

  importItem(): void {
    if (this.speaker) SequenceTools.importSpeakerRender(this.speaker.id);
  }
}
</script>

<style scoped lang="scss">
</style>
