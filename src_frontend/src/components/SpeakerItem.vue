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

    <div class="labelled slots-row" v-if="hasSlots" :class="!slotRenderable ? 'unconfiged' : null">
      <span class="label-sup" v-if="!slotRenderable">Needs Config:</span>
      <div class="label" v-if="!slotRenderable">
        Select slot to render speaker
      </div>
      <div class="label" v-else>Render speaker to Unreal</div>
      <span class="buttons">
        <button class="small" v-if="slotRenderable" @click="renderSlot()">
          {{ slotRendered ? "Re-export Speaker" : "Export Speaker" }}
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
import { TrackItemInfo, SpeakerItem } from "@/model/sequence";
import SequenceTools from "@/logic/SequenceTools";
import PipelineJobUpdater from "@/logic/PipelineJobUpdater";
import ExporterTools from "@/logic/ExporterTools";
import { UnrealProjectDetail } from "@/UnrealProject";
import { call } from "../logic/rest";
import fs from "fs";

@Options({
  props: {
    id: String,
    speaker: SpeakerItem,
    track: TrackItemInfo,
    selected: Boolean,
  },
})
export default class SpeakerItemView extends Vue {
  id: string = "";
  selected: boolean = false;
  speaker: SpeakerItem;
  track: TrackItemInfo;

  get ueProjectDetail(): UnrealProjectDetail | undefined {
    const dir = this.speaker?.project;
    return dir ? model.unreal.findProjectDetails(dir) : undefined;
  }

  get hasSlots(): boolean {
    return this.ueProjectDetail?.imgSlots?.length > 0;
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

  get importable(): boolean {
    let item = this.speaker;
    let meta = model.sequence.sequenceMeta;
    if (!meta || !meta.render_track) return false;
    const hasFiles = item.render_path
      ? fs.existsSync(item.render_path) &&
        fs.readdirSync(item.render_path).length > 0
      : false;
    return !!(item && !item.render_proj_item && hasFiles);
  }

  get needsSlotRender(): boolean {
      if(!this.hasSlots) return false;
      return !this.slotRendered;
  }

  get slotRendered(){
      return this.slotRenderable;
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

  renderSlot(id: string) {
    ExporterTools.exportSpeakerItem(id);
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
}
</style>
