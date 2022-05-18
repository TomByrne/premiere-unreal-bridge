<template>
  <div class="speaker-list panel">
    
    <SpeakerItemView v-for="item in renderableItems"
      :key="item.id"
      :id="item.id"
      :speaker="item.speaker"
      :track="item.track"
      :selected="item.selected"
      />
      
    <div class="sub" v-if="!meta">
      Loading sequence metadata...
    </div>
      
    <div class="sub" v-else-if="!selectedTrackItem && !renderableItems.length">
      Select a timeline video item to begin adding Unreal shot info.
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import model from "@/model";
import SpeakerItemView from "./SpeakerItem.vue";
import { TrackItemInfo, SpeakerItem, SequenceMeta } from "@/model/sequence";


@Options({
  components: {
    SpeakerItemView,
  },
})
export default class SpeakerItemList extends Vue {
  get meta(): SequenceMeta | undefined {
    return model.sequence.sequenceMeta;
  }
  get selectedTrackItem(): TrackItemInfo | undefined {
    return model.sequence.getSelectedItem();
  }
  get renderableItems(): ItemBundle[] {
    let ret: ItemBundle[] = [];
    let meta = model.sequence.sequenceMeta;
    let selected = this.selectedTrackItem;
    let selectedId = selected ? selected.id : undefined;
    var selectedIndex = 0;
    if (meta) {
      for (let item of meta.speaker_items) {
        let trackItem = model.sequence.findTrackItem(item.id);
        if (!trackItem) continue;
        ret.push({
          id: item.id,
          speaker: item,
          track: trackItem,
          selected: item.id == selectedId
        });

        if(selected) {
          if(selected.id == item.id) selected = undefined;
          else if(trackItem.start < selected.start) {
            selectedIndex++;
          }
        }
      }
    }

    if(selected) {
      ret.splice(selectedIndex, 0, {
        id: selected.id,
        speaker: undefined,
        track: selected,
        selected: true
      });
    }
    return ret;
  }
  
}

interface ItemBundle {
  id: string,
  speaker: SpeakerItem | undefined,
  track: TrackItemInfo,
  selected: boolean,
}
</script>

<style scoped lang="scss">
.speaker-list {
  padding: 0;
  padding-bottom: 40px;
}
</style>
