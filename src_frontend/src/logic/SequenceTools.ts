import { call, call2 } from "./rest";
import model from "../model";
import { SequenceMeta, SpeakerItem } from "@/model/sequence";
import path from "path";
import md5 from "md5";

export function addSpeakerItem(id: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const dir = model.project.getProjectDir();
    if(!dir || !model.project.meta || !model.sequence.sequenceMeta){
      reject("Project or sequence not found");
      return;
    }
    const itemHash = md5(model.project.meta.id+"_"+model.sequence.sequenceMeta.id+"_"+id).substring(0, 8);
    const render_path = path.join(dir, `ue_renders/item_${itemHash}`);
    const item:SpeakerItem = {
      id,
      render_path
    }
    const prom = call<boolean>("SequenceTools.addSpeakerItem", [item]);
    prom.catch(reject);
    prom.then(resolve);
  });
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
export function importSpeakerRender(id: string): Promise<boolean> {
  return call("SequenceTools.importSpeakerRender", [id]);
}

let watching = false;
let timerId: NodeJS.Timeout | undefined;
export function setup(): void {
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
        console.log("Sequence Metadata: ", resp.parsed);
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
  if(timerId){
    clearInterval(timerId);
    timerId = undefined;
  } 

}

export default {
  setup,
  stopWatchingMeta,
  addSpeakerItem,
  removeSpeakerItem,
  updateSpeakerItem,
  selectTrackItem,
  importSpeakerRender,
};
