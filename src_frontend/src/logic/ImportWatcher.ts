import model from "@/model";
import { SequenceMeta, SpeakerImportState, SpeakerItem, SpeakerRenderState } from "@/model/sequence";
import SequenceTools from "./SequenceTools";
import Fs from "@/utils/Fs";

export function setup(): void {
    checkJobsSoon();
}

function updateJob(item: SpeakerItem, updates: Record<string, unknown>) {
    let changes = false;
    for (const i in updates) {
        const val = updates[i];
        if (Reflect.get(item.import, i) != val) {
            Reflect.set(item.import, i, val);
            changes = true;
        }
    }

    if (changes) {
        SequenceTools.updateSpeakerItemSoon(item);
    }
}

function checkJobsSoon(secs = 2){
    setTimeout(() => checkJobs(), secs * 1000);
}

function checkJobs() {
    const meta = model.sequence.sequenceMeta;
    if (!meta){
        checkJobsSoon();
        return;
    }
    
    // Run sequentially
    const starterPromise = Promise.resolve(null);
    meta.speaker_items.reduce(
        (p, item) => p.then(() => checkJob(meta, item).then()),
        starterPromise
    )
    .finally(() => {
        checkJobsSoon();
    });
}

async function checkJob(meta:SequenceMeta, item:SpeakerItem): Promise<void> {
    if(!meta.render_track) {
        updateJob(item, { state: SpeakerImportState.NotReady });
        return;
    }
    try {
        const files = await Fs.readdir(item.import.asset_path, '.jpg');

        if (files && (item.render.total && files.length == item.render.total) || (files.length && item.render.state == SpeakerRenderState.Done)) {
            updateJob(item, { state: item.import.render_track_item ? SpeakerImportState.Done : SpeakerImportState.Ready });
        } else {
            updateJob(item, { state: SpeakerImportState.NotReady });
        }

    } catch(e) {
        updateJob(item, { state: SpeakerImportState.NotReady });
    }
}

export default {
    setup,
};
