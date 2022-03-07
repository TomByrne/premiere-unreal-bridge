<template>
  <div class="panel">
    <div
      v-for="item in renderableItems"
      :key="item.id"
      class="item labelled"
      :class="{ selected: item.selected, unselected: !item.selected }"
      @click="select(item.id)"
    >
      <div class="labelled">
        <div class="label">{{ item.track.name }}</div>
        <div class="info">
          {{ item.track.start.toFixed(2) }}s to {{ item.track.end.toFixed(2) }}s
        </div>
        <!-- <button v-if="isRenderable(item)" @click="doJob(item.id)">Render</button>
        <button v-if="!item.speaker" @click="link(item.id)">Enable</button> -->
        <!-- <button v-else @click="unlink(item.id)">X</button> -->

      </div>
      <div class="job labelled" :class="(item.job && item.job.state) || (!isRenderable(item) ? 'unconfiged' : null)">
        <span class="label-sup" v-if="!isRenderable(item)">Needs Config:</span>

        <div class="label" v-if="!item.speaker.project">Select an Unreal Project</div>
        <div class="label" v-else-if="!item.speaker.scene">Select an Unreal Scene</div>
        <div class="label" v-else-if="!item.speaker.sequence">Select an Unreal Sequence</div>
        <div class="label" v-else-if="!item.job">Waiting for job...</div>
        <div class="label" v-else-if="!item.job.state">No render queued</div>
        <div class="label" v-else-if="item.job.state == 'pending'">Waiting for renderer</div>
        <div class="label" v-else-if="item.job.state == 'doing'">Rendering</div>
        <div class="label" v-else-if="item.job.state == 'done'">Render Complete</div>
        <div class="label" v-else-if="item.job.state == 'failed'">Render Failed</div>
        <div class="label" v-else-if="item.job.state == 'cancelled'">Render Cancelled</div>

        <span class="buttons">
          <button class="small" v-if="isRenderable(item)" @click="doJob(item.id)" :disabled="item.job.saved">Queue Render</button>
          <button class="small" @click="importItem(item.speaker)" v-if="canImport(item.speaker)">Import Render</button>
        </span>
      </div>
      <!-- <a @click="openOutput(item)">output dir</a> -->
    </div>
    <div class="sub" v-if="!selectedTrackItem && !renderableItems.length">
      Select a timeline video item to begin adding Unreal shot info.
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import model from "@/model";
import { TrackItemInfo, SpeakerItem } from "@/model/sequence";
import SequenceTools from "@/logic/SequenceTools";
import PipelineJobUpdater from "@/logic/PipelineJobUpdater";
import { call } from "../logic/rest";
import fs from "fs";

export default class ItemsList extends Vue {
  get selectedTrackItem(): TrackItemInfo | undefined {
    return model.sequence.getSelectedItem();
  }
  get selectedSpeakerItem(): SpeakerItem | undefined {
    let item = model.sequence.getSelectedItem();
    if (!item) return undefined;
    return model.sequence.findSpeakerItem(item.id);
  }

  get renderableItems(): {
    id: string;
    speaker: SpeakerItem;
    track: TrackItemInfo;
    selected: boolean;
  }[] {
    let ret = [];
    let meta = model.sequence.sequenceMeta;
    let selected = this.selectedTrackItem;
    let selectedId = selected ? selected.id : undefined;
    if (meta) {
      for (let item of meta.speaker_items) {
        let trackItem = model.sequence.findTrackItem(item.id);
        let job = model.pipeline.jobs[item.id];
        if (!trackItem) continue;
        ret.push({
          id: item.id,
          speaker: item,
          track: trackItem,
          selected: item.id == selectedId,
          job
        });
      }
    }
    // if (selected && !this.selectedSpeakerItem) {
    //   ret.push({
    //     id: selected.id,
    //     speaker: undefined,
    //     track: selected,
    //     selected: true,
    //   });
    // }
    return ret;
  }

  

  select(id: string): void {
    SequenceTools.selectTrackItem(id);
  }

  unlink(id: string): void {
    SequenceTools.removeSpeakerItem(id);
  }

  link(id: string): void {
    SequenceTools.addSpeakerItem(id);
  }

  doJob(id: string): void {
    PipelineJobUpdater.beginJob(id);
  }

  isRenderable(item:ItemBundle): boolean
  {
    if(!item.track || !item.speaker) return false;
    return !!(item.speaker.project && item.speaker.sequence && item.speaker.scene);
  }

  openOutput(item:ItemBundle): void {
    if(item.speaker?.render_path)
      call("FileSystemTools.openFolder", [item.speaker.render_path]);
  }

  canImport(item:SpeakerItem): boolean  {
    let meta = model.sequence.sequenceMeta;
    if(!meta || !meta.render_track) return false;
    const hasFiles = item.render_path ? fs.existsSync(item.render_path) && fs.readdirSync(item.render_path).length > 0 : false;
    return !!(item && !item.render_proj_item && hasFiles);
  }
  importItem(item: SpeakerItem): void {
    SequenceTools.importSpeakerRender(item.id);
  }
}

interface ItemBundle {
  id: string,
  speaker: SpeakerItem | undefined,
  track: TrackItemInfo | undefined,
  selected: boolean,
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
    .job {
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
  .job {
    border-radius: 6px;
    margin: 0;
    overflow: hidden;
    text-transform: uppercase;

    height: 30px;
    transition: height 0.2s;
    
    background: #222;
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
          border-radius: 4px 0 0 4px;
        }
        &:last-child {
          border-radius: 0 4px 4px 0;
        }
      }
    }

    &.unconfiged {
      background:#caac00;
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
      color: #DDD;
    }
  }
}
</style>
