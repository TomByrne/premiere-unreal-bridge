namespace SequenceTools {

    const creatorNS = "http://ns.adobe.com/xap/1.0/";
    const creatorKey = "CreatorTool";
    const creatorValue = "imagsyd.aws.unreal";

    export function getCreatedByTooling(seq?: Sequence): boolean {
        if (!seq && app.project.activeSequence) seq = app.project.activeSequence;
        if (!seq) {
            console.log("No Sequence found");
            return false;
        }

        return XMP.getString(seq.projectItem, creatorNS, creatorKey) == creatorValue;
    }

    export function setCreatedByTooling(value: boolean, seq?: Sequence): boolean {
        if (!seq && app.project.activeSequence) seq = app.project.activeSequence;
        if (!seq) {
            console.log("No Sequence found");
            return false;
        }

        return XMP.setValue(seq.projectItem, creatorNS, creatorKey, value ? creatorValue : undefined);
    }
}