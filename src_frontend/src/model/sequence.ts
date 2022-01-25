import { SequenceMeta, SpeakerItem, TrackItemInfo } from "@/SequenceMeta";
import { ref, Ref } from "vue";

export const sequenceMeta: Ref<SequenceMeta | undefined> = ref(undefined);

export function findTrackItem(id: string): TrackItemInfo | undefined {
  const meta = sequenceMeta.value;
  if (!meta) return undefined;
  for (const track of meta.videoTracks) {
    for (const item of track.items) {
      if (item.id == id) return item;
    }
  }
}

export function findSpeakerItem(id: string): SpeakerItem | undefined {
  const meta = sequenceMeta.value;
  if (!meta) return undefined;
  for (const item of meta.speaker_items) {
    if (item.itemId == id) return item;
  }
}

export default {
  sequenceMeta,
  findTrackItem,
  findSpeakerItem,
};
