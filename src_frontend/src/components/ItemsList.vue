<template>
  <div class="panel">
    <div
      v-for="item in renderableItems"
      :key="item.id"
      class="item"
      :class="{ selected: item.selected }"
      @click="select(item.id)"
    >
      <div class="labelled">
        <div class="label">{{ item.track.name }}</div>
        <div class="info">
          {{ item.track.start.toFixed(2) }}s to {{ item.track.end.toFixed(2) }}s
        </div>
        <button v-if="isRenderable(item)" @click="doJob(item.id)">Render</button>
        <button v-if="!item.speaker" @click="link(item.id)">Enable</button>
        <button v-else @click="unlink(item.id)">X</button>

      </div>
      <div class="job labelled" v-if="item.job" :class="item.job.state">
        <div class="label">JOB INFO: {{ item.job.state }}</div>
        <a @click="openOutput(item)">output dir</a>
      </div>
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
    speaker: SpeakerItem | undefined;
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
    if (selected && !this.selectedSpeakerItem) {
      ret.push({
        id: selected.id,
        speaker: undefined,
        track: selected,
        selected: true,
      });
    }
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
    PipelineJobUpdater.checkItem(id);
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
  > * {
    margin: 0;
    flex-shrink: 0;
  }

  .label {
    flex-shrink: 3;
    overflow: hidden;
    min-width: 50px;
  }

}
</style>
