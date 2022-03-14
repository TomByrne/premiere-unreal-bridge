<template>
  <div class="panel">
    
    <SpeakerItemView v-for="item in renderableItems"
      :key="item.id"
      :id="item.id"
      :speaker="item.speaker"
      :track="item.track"
      :selected="item.selected"
      />
      
    <div class="sub" v-if="!selectedTrackItem && !renderableItems.length">
      Select a timeline video item to begin adding Unreal shot info.
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import model from "@/model";
import SpeakerItemView from "./SpeakerItem.vue";
import { TrackItemInfo, SpeakerItem } from "@/model/sequence";


@Options({
  components: {
    SpeakerItemView,
  },
})
export default class SpeakerItemList extends Vue {
  get selectedTrackItem(): TrackItemInfo | undefined {
    return model.sequence.getSelectedItem();
  }
  get renderableItems(): ItemBundle[] {
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
    return ret;
  }
  
}

interface ItemBundle {
  id: string,
  speaker: SpeakerItem,
  track: TrackItemInfo,
  selected: boolean,
}
</script>

<style scoped lang="scss">
</style>
