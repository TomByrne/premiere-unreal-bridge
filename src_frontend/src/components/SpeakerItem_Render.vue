<template>
  <div
    class="speaker-row header"
    :class="{
      [speaker.render.state]: true,
      warn: !jobRenderable,
      minimised: minimised,
      hidden: hidden,
    }"
  >
    <span class="label-sup">Render:</span>

    <div class="label" v-if="!speaker.render.job">Waiting for job...</div>
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
    <div class="label" v-else>
    </div>

    
    <div class="info" v-if="speaker.render.frames">
      {{ speaker.render.frames }} / {{ speaker.render.total }} ({{
        Math.round(speaker.render.frames / speaker.render.total * 100)
      }}%)
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
    </span>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { SpeakerItem, TrackItemInfo } from "@/model/sequence";
import PipelineJobUpdater from "@/logic/PipelineJobUpdater";

@Options({
  props: {
    speaker: null,
    track: null,
    minimised: Boolean,
    hidden: Boolean,
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

  doJob(): void {
    if (this.speaker) PipelineJobUpdater.beginJob(this.speaker.id);
  }

}
</script>

<style scoped lang="scss">
</style>
