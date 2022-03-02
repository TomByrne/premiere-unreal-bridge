import { SequenceMeta, SpeakerItem, TrackItemInfo } from "@/SequenceMeta";
import { reactive, ref, Ref } from "vue";

export class SequenceModel {
  sequenceMeta: SequenceMeta | undefined;

  getSelectedItem(): TrackItemInfo | undefined {
    const meta = this.sequenceMeta;
    return meta?.selectedItem || undefined;
  }

  findTrackItem(id: string): TrackItemInfo | undefined {
    const meta = this.sequenceMeta;
    return meta?.items[id] || undefined;
  }
  findSpeakerItem(id: string): SpeakerItem | undefined {
    const meta = this.sequenceMeta;
    if (!meta) return undefined;
    for (const item of meta.speaker_items) {
      if (item.id == id) return item;
    }
  }
}

export default reactive(new SequenceModel());


// export const sequenceMeta: Ref<SequenceMeta | undefined> = ref(undefined);

// export function getSelectedItem(): TrackItemInfo | undefined {
//   const meta = sequenceMeta.value;
//   return meta?.selectedItem || undefined;
// }

// export function findTrackItem(id: string): TrackItemInfo | undefined {
//   const meta = sequenceMeta.value;
//   return meta?.items[id] || undefined;
// }

// export function findSpeakerItem(id: string): SpeakerItem | undefined {
//   const meta = sequenceMeta.value;
//   if (!meta) return undefined;
//   for (const item of meta.speaker_items) {
//     if (item.id == id) return item;
//   }
// }

// export default {
//   sequenceMeta,
//   getSelectedItem,
//   findTrackItem,
//   findSpeakerItem,
// };
