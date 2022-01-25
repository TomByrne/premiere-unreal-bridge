<template>
  <div class="panel">
    <h1>Render</h1>
    <div v-if="!renderable">
      No renderable items yet, configure Unreal project mapping above.
    </div>
    <div v-else>
      Renderable items:
      <div
        v-for="item in renderableItems"
        :key="item.track.id"
        class="labelled"
      >
        <div class="label">{{ item.track.name }}</div>
        <div class="info">{{ item.track.start }}s to {{ item.track.end }}s</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import model from "@/model";
import { SpeakerItem, TrackItemInfo } from "@/SequenceMeta";

export default class DevLink extends Vue {
  get renderable(): boolean {
    return !!this.renderableItems.length;
  }

  get renderableItems(): { speaker: SpeakerItem; track: TrackItemInfo }[] {
    let ret = [];
    let meta = model.sequence.sequenceMeta.value;
    if (meta) {
      for (let item of meta.speaker_items) {
        if (item.project && item.scene && item.sequence) {
          let trackItem = model.sequence.findTrackItem(item.itemId);
          if (!trackItem) continue;
          ret.push({
            speaker: item,
            track: trackItem,
          });
        }
      }
    }
    return ret;
  }
}
</script>

<style scoped lang="scss"></style>
