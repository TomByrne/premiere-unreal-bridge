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
    <div class="header">
      <span class="label-sup">
        <OpenChevron :open="open" @click="open = !open"/>
        <FolderLink :path="renderPath" title="Temporary render folder (in UE project)"/>
        Render:
      </span>

      <div class="label" v-if="!speaker.render.job">Waiting for job...</div>
      <div class="label" v-else-if="!speaker.render.state">
        No render queued
      </div>
      <div class="label" v-else-if="pending">
        Waiting for renderer
      </div>
      <div class="label" v-else-if="rendering">
        Rendering on '{{ speaker.render.processor || "Unknown" }}' node
      </div>
      <div class="label" v-else-if="done">
        Render Complete
      </div>
      <div class="label" v-else-if="failed">
        Render Failed
      </div>
      <div class="label" v-else-if="cancelled">
        Render Cancelled
      </div>
      <div class="label" v-else></div>

      <span class="buttons">
        <button
          class="small"
          v-if="jobRenderable"
          @click="doJob()"
          :disabled="!rendering && (!speaker.render.job || speaker.render.saved)"
        >
          {{ rendering ? "Cancel Render" : "Queue Render" }}
        </button>
      </span>
    </div>

    <Progress
      :state="progressState"
      :minimised="minimised || hidden || !open"
      :total="speaker.render.total"
      :value="speaker.render.frames"
      :label="speaker ? speaker.render.state : null"
      :showFraction="true"
    />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { SpeakerItem, SpeakerRenderState, TrackItemInfo } from "@/model/sequence";
import PipelineJobUpdater from "@/logic/PipelineJobUpdater";
import Progress from "./Progress.vue";
import FolderLink from "./FolderLink.vue";
import OpenChevron from "./OpenChevron.vue";

@Options({
  props: {
    speaker: null,
    track: null,
    minimised: Boolean,
    hidden: Boolean,
  },
  components: {
    Progress,
    FolderLink,
    OpenChevron,
  },
})
export default class SpeakerItem_Render extends Vue {
  speaker: SpeakerItem | undefined;
  track: TrackItemInfo | undefined;
  open = false;

  get rendering():boolean {
    return this.speaker?.render.state == SpeakerRenderState.Rendering;
  }
  get pending():boolean {
    return this.speaker?.render.state == SpeakerRenderState.Pending;
  }
  get done():boolean {
    return this.speaker?.render.state == SpeakerRenderState.Done;
  }
  get failed():boolean {
    return this.speaker?.render.state == SpeakerRenderState.Failed;
  }
  get cancelled():boolean {
    return this.speaker?.render.state == SpeakerRenderState.Cancelled;
  }

  get renderPath():string | undefined {
    return this.speaker?.render.render_path;
  }

  get progressState():string {
      switch(this.speaker?.render.state) {
        case SpeakerRenderState.Rendering: return "active";
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
    if (this.speaker) {
      this.open = !this.rendering;
      if(this.rendering){
        PipelineJobUpdater.killJob(this.speaker.id);
      }else{
        PipelineJobUpdater.beginJob(this.speaker.id);
      }
    }
  }
}
</script>

<style scoped lang="scss">
</style>
