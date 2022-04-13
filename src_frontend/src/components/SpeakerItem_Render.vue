<template>
  <div
    class="speaker-row"
    :class="{
      [speaker.render.state]: true,
      warn: !jobRenderable,
      minimised: minimised,
      hidden: hidden,
    }"
  >
    <div class="header" @click="open = !open">
      <span class="label-sup">Render:</span>

      <div class="label" v-if="!speaker.render.job">Waiting for job...</div>
      <div class="label" v-else-if="!speaker.render.state">
        No render queued
      </div>
      <div class="label" v-else-if="speaker.render.state == 'pending'">
        Waiting for renderer
      </div>
      <div class="label" v-else-if="speaker.render.state == 'doing'">
        Rendering on '{{ speaker.render.processor }}' node
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
      <div class="label" v-else></div>

      <div class="info" v-if="speaker.render.frames">
        {{ speaker.render.frames }} / {{ speaker.render.total }} ({{
          Math.round((speaker.render.frames / speaker.render.total) * 100)
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

    <Progress
      :state="progressState"
      :minimised="minimised || hidden || !open"
      :total="speaker.render.total"
      :value="speaker.render.frames"
      :label="speaker ? speaker.render.state : null"
    />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { SpeakerItem, SpeakerRenderState, TrackItemInfo } from "@/model/sequence";
import PipelineJobUpdater from "@/logic/PipelineJobUpdater";
import Progress from "./Progress.vue";

@Options({
  props: {
    speaker: null,
    track: null,
    minimised: Boolean,
    hidden: Boolean,
  },
  components: {
    Progress,
  },
})
export default class SpeakerItem_Render extends Vue {
  speaker: SpeakerItem | undefined;
  track: TrackItemInfo | undefined;
  open = false;

  get progressState():string {
      switch(this.speaker?.render.state) {
        case SpeakerRenderState.Doing: return "active";
        case SpeakerRenderState.Done: return "complete";
        case SpeakerRenderState.Failed: return "error";
        case SpeakerRenderState.Cancelled: return "cancelled";
        default: return "inactive";
      }
  }

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
