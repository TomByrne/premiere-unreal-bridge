import { call } from "./rest";
import SequenceTools from "./SequenceTools";

export function exportSpeakerItem(id: string): Promise<boolean> {
    const ret = call<boolean>("ImageSlotTools.exportSpeakerItem", [id]);
    ret.then((success) => {
        if(success) SequenceTools.loadMeta();
    });
    return ret;
}

export function needsSlotRender(id: string): Promise<boolean> {
    return call("ImageSlotTools.needsSlotRender", [id]);
}

// export function addSlotRender(item:SlotRender, update = false): Promise<boolean> {
//     return call("ImageSlotTools.addSlotRender", [item, update]);
// }

// export function removeSlotRender(id: string): Promise<boolean> {
//     return call("ImageSlotTools.removeSlotRender", [id]);
// }

export default {
    exportSpeakerItem,
    needsSlotRender,
    // addSlotRender,
    // removeSlotRender,
};
