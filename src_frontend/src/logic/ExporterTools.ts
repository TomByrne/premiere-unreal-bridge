import { call } from "./rest";

export function exportSpeakerItem(id: string): Promise<boolean> {
    return call("ExporterTools.exportSpeakerItem", [id]);
}

export default {
    exportSpeakerItem,
};
