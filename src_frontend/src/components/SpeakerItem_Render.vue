<template>
    <div
      class="speaker-row header"
      :class="{
        [speaker.render.state]: true,
        warn: !jobRenderable,
        minimised:minimised
      }"
    >
      <span class="label-sup">Render:</span>

      <div class="label" v-if="!speaker.config.project">Select an Unreal Project</div>
      <div class="label" v-else-if="!speaker.config.scene">Select an Unreal Scene</div>
      <div class="label" v-else-if="!speaker.config.sequence">
        Select an Unreal Sequence
      </div>
      <div class="label" v-else-if="!speaker.render.job">Waiting for job...</div>
      <div class="label" v-else-if="!speaker.render.state">No render queued</div>
      <div class="label" v-else-if="speaker.render.state == 'pending'">
        Waiting for renderer
      </div>
      <div class="label" v-else-if="speaker.render.state == 'doing'">
        Rendering
      </div>
      <div class="label" v-else-if="speaker.render.state == 'done'">
        Render Complete
      </div>
      <div class="label" v-else-if="speaker.render.state == 'failed'">
        Render Failed
      </div>
      <div class="label" v-else-if="speaker.render.state == 'cancelled'">
        Render Cancelled
      </div>

      <span class="buttons">
        <button
          class="small"
          v-if="jobRenderable"
          @click="doJob()"
          :disabled="!speaker.render.job || speaker.render.saved"
        >
          Queue Render
        </button>
        <button class="small" @click="importItem()" v-if="importable">
          Import Render
        </button>
      </span>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import model from "@/model";
import { SpeakerItem, TrackItemInfo } from "@/model/sequence";
import fs from "fs";

@Options({
  props: {
    speaker: null,
    track: null,
    minimised: Boolean,
  },
})
export default class SpeakerItem_Render extends Vue {
  speaker: SpeakerItem | undefined;
  track: TrackItemInfo | undefined;

  get jobRenderable(): boolean {
    if (!this.track || !this.speaker) return false;
    return !!(
      this.speaker.config.project &&
      this.speaker.config.sequence &&
      this.speaker.config.scene
    );
  }

  get importable(): boolean {
    let item = this.speaker;
    if (!item) return false;
    let meta = model.sequence.sequenceMeta;
    if (!meta || !meta.render_track) return false;
    //TODO: move this logic into a service
    const hasFiles = item.render.render_path
      ? fs.existsSync(item.render.render_path) &&
        fs.readdirSync(item.render.render_path).length > 0
      : false;
    return !!(item && !item.import.render_proj_item && hasFiles);
  }
}
</script>

<style scoped lang="scss">
</style>
