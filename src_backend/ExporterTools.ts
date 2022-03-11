

namespace ExporterTools {
    export function exportSpeakerItem(id: string): boolean {
        const speaker = SequenceTools.findSpeakerItem(id);
        if(!speaker) {
            console.error("Speaker item not found:", id);
            return false;
        }

        var projItem = SequenceTools.findProjItemByTrackItem(id);
        if(!projItem) {
            console.error("Project item not found:", id);
            return false;
        }

        if(!speaker.img_slot) {
            console.error("No image slot selected:", id);
            return false;
        }

        const destPath = new Folder(`${speaker.project}/Content/${speaker.img_slot}`);
        if(!destPath.exists) {
            console.error("Destination folder doesn't exist: ", destPath.fsName);
            return false;
        }

        //TODO: validate / delete files in dest folder
        
        const presetPath = new File(new File($.fileName).path + "/epr/png_export_4k.epr");
        if(!presetPath.exists){
            console.error("Preset not found:", presetPath.absoluteURI);
            return false;
        }

        const ret = app.encoder.encodeProjectItem(
            projItem,
            `${destPath.fsName}/frame_0000000.png`,
            presetPath.fsName,
            app.encoder.ENCODE_IN_TO_OUT, // NO WAY TO SET IN OUT ON PROJ ITEM, NEED TO USE epr SETTINGS
            1
        );

        console.log("Export: ", ret, projItem, destPath.fsName, presetPath);

        app.encoder.startBatch();
        return true;
    }
}