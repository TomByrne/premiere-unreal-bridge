import { call, call2 } from "./rest";
import model from "../model";
import { SequenceMeta, SpeakerItem } from "@/SequenceMeta";

// export function getMeta(create?: boolean): Promise<SequenceMeta> {
//   return call("SequenceTools.getMeta", [create]);
// }
export function setRenderTrack(id: string): Promise<boolean> {
  return call("SequenceTools.setRenderTrack", [id]);
}
export function addSpeakerItem(item: SpeakerItem): Promise<boolean> {
  return call("SequenceTools.addSpeakerItem", [item]);
}
export function removeSpeakerItem(id: string): Promise<boolean> {
  return call("SequenceTools.removeSpeakerItem", [id]);
}
export function updateSpeakerItem(item: SpeakerItem): Promise<boolean> {
  return call("SequenceTools.updateSpeakerItem", [item]);
}
export function selectTrackItem(id: string): Promise<boolean> {
  return call("SequenceTools.selectTrackItem", [id]);
}

let watching = false;
let timerId: number | undefined;
export function startWatchingMeta(): void {
  if (watching) return;
  watching = true;
  loadMeta();
}
let lastRes: string | undefined;
function loadMeta() {
  call2<SequenceMeta>("SequenceTools.getMeta", [true])
    .then((resp) => {
      if(lastRes != resp.str) {
        lastRes = resp.str;
        model.sequence.sequenceMeta = resp.parsed;
      }
      timerId = setTimeout(() => loadMeta(), 250);
    })
    .catch((e) => {
      console.warn("Failed to load sequence meta: ", e);
      timerId = setTimeout(() => loadMeta(), 1500);
    });
}
export function stopWatchingMeta(): void {
  if (!watching) return;
  watching = false;
  clearInterval(timerId);
}

export default {
  setRenderTrack,
  startWatchingMeta,
  stopWatchingMeta,
  addSpeakerItem,
  removeSpeakerItem,
  updateSpeakerItem,
  selectTrackItem,
};
