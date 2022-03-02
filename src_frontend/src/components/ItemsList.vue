<template>
  <div class="panel">
    <div
      v-for="item in renderableItems"
      :key="item.id"
      class="labelled"
      :class="{ selected: item.selected }"
      @click="select(item.id)"
    >
      <div class="label">{{ item.track.name }}</div>
      <div class="info">
        {{ item.track.start.toFixed(2) }}s to {{ item.track.end.toFixed(2) }}s
      </div>
      <button v-if="!item.speaker" @click="link(item.id)">Enable</button>
      <button v-else @click="unlink(item.id)">Clear</button>
    </div>
    <div class="sub" v-if="!selectedTrackItem && !renderableItems.length">
      Select a timeline video item to begin adding Unreal shot info.
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import model from "@/model";
import { SpeakerItem, TrackItemInfo } from "@/SequenceMeta";
import SequenceTools from "@/logic/SequenceTools";

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
        if (!trackItem) continue;
        ret.push({
          id: item.id,
          speaker: item,
          track: trackItem,
          selected: item.id == selectedId,
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
    SequenceTools.addSpeakerItem({ id });
  }
}
</script>

<style scoped lang="scss"></style>
