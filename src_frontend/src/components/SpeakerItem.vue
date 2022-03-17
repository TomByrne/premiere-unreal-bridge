<template>
  <div
    class="item labelled"
    :class="{ selected: selected, unselected: !selected }"
    @click="select()"
  >
    <div class="labelled info-row">
      <div class="label">{{ track.name }}</div>
      <div class="info">
        {{ track.start.toFixed(2) }}s to {{ track.end.toFixed(2) }}s
      </div>
      <!-- <button v-if="jobRenderable" @click="doJob()">Render</button>
        <button v-if="!speaker" @click="link()">Enable</button> -->
      <!-- <button v-else @click="unlink()">X</button> -->
    </div>

    <div
      class="labelled slots-row"
      v-if="hasSlots"
      :class="
        !slotRenderable ? 'unconfiged' : needsSlotRender ? 'needs-action' : null
      "
    >
      <div class="progress" v-if="slotRender" :style="{width: slotRenderPercent + '%'}"/>
      <span class="label-sup" v-if="!slotRenderable">Needs Config:</span>
      <div class="label" v-if="!slotRenderable">
        Select slot to render speaker
      </div>
      <div class="label" v-else-if="slotRender">Rendering speaker to Unreal...</div>
      <div class="label" v-else>Render speaker to Unreal</div>
      
      <div class="info" v-if="slotRender">{{slotRender.done}} / {{slotRender.duration}} ({{Math.round(slotRenderPercent)}}%)</div>

      <span class="buttons">
        <button class="small" v-if="slotRenderable && !slotRender" @click="renderSlot()">
          {{ needsSlotRender ? "Export Speaker" : "Re-export Speaker" }}
        </button>
      </span>
    </div>
    <div
      class="labelled job-row"
      :class="
        (speaker.job && speaker.job.state) ||
        (!jobRenderable ? 'unconfiged' : 'idle')
      "
      v-if="!needsSlotRender"
    >
      <span class="label-sup" v-if="!jobRenderable">Needs Config:</span>

      <div class="label" v-if="!speaker.project">Select an Unreal Project</div>
      <div class="label" v-else-if="!speaker.scene">Select an Unreal Scene</div>
      <div class="label" v-else-if="!speaker.sequence">
        Select an Unreal Sequence
      </div>
      <div class="label" v-else-if="!speaker.job">Waiting for job...</div>
      <div class="label" v-else-if="!speaker.job.state">No render queued</div>
      <div class="label" v-else-if="speaker.job.state == 'pending'">
        Waiting for renderer
      </div>
      <div class="label" v-else-if="speaker.job.state == 'doing'">
        Rendering
      </div>
      <div class="label" v-else-if="speaker.job.state == 'done'">
        Render Complete
      </div>
      <div class="label" v-else-if="speaker.job.state == 'failed'">
        Render Failed
      </div>
      <div class="label" v-else-if="speaker.job.state == 'cancelled'">
        Render Cancelled
      </div>

      <span class="buttons">
        <button
          class="small"
          v-if="jobRenderable"
          @click="doJob()"
          :disabled="!speaker.job || speaker.job.saved"
        >
          Queue Render
        </button>
        <button class="small" @click="importItem()" v-if="importable">
          Import Render
        </button>
      </span>
    </div>
    <!-- <a @click="openOutput()">output dir</a> -->
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import model from "@/model";
import { TrackItemInfo, SpeakerItem, SlotRender } from "@/model/sequence";
import SequenceTools from "@/logic/SequenceTools";
import PipelineJobUpdater from "@/logic/PipelineJobUpdater";
import ImageSlotTools from "@/logic/ImageSlotTools";
import { UnrealProjectDetail } from "@/UnrealProject";
import { call } from "../logic/rest";
import fs from "fs";

@Options({
  props: {
    id: String,
    speaker: null,
    track: null,
    selected: Boolean,
  },
})
export default class SpeakerItemView extends Vue {
  isMounted = false;
  id = "";
  selected = false;
  speaker: SpeakerItem | undefined;
  track: TrackItemInfo | undefined;
  needsSlotRender = false;

  get ueProjectDetail(): UnrealProjectDetail | undefined {
    const dir = this.speaker?.project;
    return dir ? model.unreal.findProjectDetails(dir) : undefined;
  }

  get hasSlots(): boolean {
    const slots = this.ueProjectDetail?.imgSlots;
    return slots ? slots.length > 0 : false;
  }

  get jobRenderable(): boolean {
    if (!this.track || !this.speaker) return false;
    return !!(
      this.speaker.project &&
      this.speaker.sequence &&
      this.speaker.scene
    );
  }

  get slotRenderable(): boolean {
    return !!this.speaker?.img_slot;
  }
  get slotRender(): SlotRender | undefined {
    return model.sequence.findSlotRender(this.id);
  }
  get slotRenderPercent(): number {
    const slotRender = this.slotRender;
    return slotRender ? (slotRender.done / slotRender.duration * 100) : 0;
  }

  get importable(): boolean {
    let item = this.speaker;
    if (!item) return false;
    let meta = model.sequence.sequenceMeta;
    if (!meta || !meta.render_track) return false;
    const hasFiles = item.render_path
      ? fs.existsSync(item.render_path) &&
        fs.readdirSync(item.render_path).length > 0
      : false;
    return !!(item && !item.render_proj_item && hasFiles);
  }

  select(): void {
    SequenceTools.selectTrackItem(this.id);
  }

  unlink(): void {
    SequenceTools.removeSpeakerItem(this.id);
  }

  link(): void {
    SequenceTools.addSpeakerItem(this.id);
  }

  doJob(): void {
    PipelineJobUpdater.beginJob(this.id);
  }

  openOutput(): void {
    if (this.speaker?.render_path)
      call("FileSystemTools.openFolder", [this.speaker.render_path]);
  }

  importItem(): void {
    SequenceTools.importSpeakerRender(this.id);
  }

  renderSlot() {
    ImageSlotTools.exportSpeakerItem(this.id);
  }

  mounted() {
    this.isMounted = true;
    this.checkNeedsSlotRender();
  }
  unmounted() {
    this.isMounted = false;
  }
  checkNeedsSlotRender() {
    if (!this.speaker) return false;
    if (!this.hasSlots) {
      this.checkNeedsSlotRenderLater();
      return;
    }
    ImageSlotTools.needsSlotRender(this.speaker.id).then((value: boolean) => {
      this.needsSlotRender = value;
      this.checkNeedsSlotRenderLater();
    });
  }
  checkNeedsSlotRenderLater() {
    if (!this.isMounted) return;
    setTimeout(() => this.checkNeedsSlotRender(), 5000);
  }
}
</script>

<style scoped lang="scss">
.item {
  margin: 2px;
  padding: 3px 6px 7px;
  flex-direction: column;
  box-sizing: border-box;
  > * {
    margin: 3px 0;
    flex-shrink: 0;
    box-sizing: border-box;
  }

  > .labelled {
    background: unset;
  }

  &.unselected {
    .slots-row,
    .job-row {
      height: 10px;

      > * {
        opacity: 0;
      }
    }
  }

  .label {
    flex-shrink: 3;
    overflow: hidden;
    min-width: 50px;
  }
  > .slots-row,
  > .job-row {
    margin: 0;
    overflow: hidden;
    text-transform: uppercase;
    background: #333;

    height: 30px;
    transition: height 0.2s;

    padding: 4px 5px;

    .label-sup {
      margin-right: 10px;
    }

    .label {
      font-weight: 800;
    }

    > * {
      transition: opacity 0.2s;
    }

    .buttons {
      button {
        margin-left: -1px;
        &:first-child {
          border-bottom-left-radius: 4px;
          border-top-left-radius: 4px;
        }
        &:last-child {
          border-bottom-right-radius: 4px;
          border-top-right-radius: 4px;
        }
      }
    }

    &.needs-action {
      border: 2px #caac00 solid;
    }
    &.idle {
      background: #222;
    }
    &.unconfiged {
      background: #caac00;
      color: #000;
    }
    &.doing {
      background: #006600;
    }
    &.done {
      background: #000055;
    }
    &.failed {
      background: #990000;
    }
    &.cancelled {
      background: #333;
      color: #ddd;
    }

    &:nth-child(2) {
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
    }
    &:last-child {
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
    }
  }
  > .slots-row {
    margin-bottom: 1px;
  }
}
</style>
