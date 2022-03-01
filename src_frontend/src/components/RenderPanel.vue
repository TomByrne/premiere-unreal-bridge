<template>
  <div class="panel">
    <h1>Render</h1>
    <div v-if="renderable">
      <div
        v-for="item in renderableItems"
        :key="item.track.id"
        class="labelled"
      >
        <div class="label">{{ item.track.name }}</div>
        <div class="info">
          {{ item.track.start.toFixed(2) }}s to {{ item.track.end.toFixed(2) }}s
        </div>
        <button @click="select(item.track.id)">Locate in Timeline</button>
      </div>
    </div>

    <div class="sub" v-else-if="!hasSelectedTrackItem && !renderable">
      Select a timeline video item to begin adding Unreal shot info.
    </div>
    <div class="sub" v-else-if="!selectedSpeakerItem">
      Selected item is not yet speaker enabled.
      <button @click="enableSpeakerMode">Enable now</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import model from "@/model";
import { SpeakerItem, TrackItemInfo } from "@/SequenceMeta";
import SequenceTools from "@/logic/SequenceTools";

export default class RenderPanel extends Vue {
  get hasSelectedTrackItem(): boolean {
    let id = model.sequence.sequenceMeta.value?.selectedItem;
    if (!id) return false;
    return !!model.sequence.getSelectedItem();
  }
  get selectedSpeakerItem(): SpeakerItem | undefined {
    let id = model.sequence.sequenceMeta.value?.selectedItem;
    if (!id) return undefined;
    return model.sequence.findSpeakerItem(id);
  }

  get renderable(): boolean {
    return !!this.renderableItems.length;
  }

  get renderableItems(): { speaker: SpeakerItem; track: TrackItemInfo }[] {
    let ret = [];
    let meta = model.sequence.sequenceMeta.value;
    if (meta) {
      for (let item of meta.speaker_items) {
        let trackItem = model.sequence.findTrackItem(item.id);
        if (!trackItem) continue;
        ret.push({
          speaker: item,
          track: trackItem,
        });
      }
    }
    return ret;
  }

  select(id: string): void {
    SequenceTools.selectTrackItem(id);
  }

  enableSpeakerMode(): void {
    let id = model.sequence.sequenceMeta.value?.selectedItem;
    if (!id) return;
    SequenceTools.addSpeakerItem({ id })
      .then((res: boolean) => {
        console.log("Speaker mode enabled: ", res);
      })
      .catch((e: unknown) => {
        console.log("Failed to enable speaker mode: ", e);
      });
  }
}
</script>

<style scoped lang="scss"></style>
