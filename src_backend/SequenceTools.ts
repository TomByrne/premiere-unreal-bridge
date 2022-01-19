namespace SequenceTools {

    const creatorKey = "CreatorTool";
    const creatorValue = "imagsyd.aws.unreal";

    export function getCreatedByTooling(seq?: Sequence): boolean {
        XMP.setup();
        if (!seq && app.project.activeSequence) seq = app.project.activeSequence;
        if (!seq || !XMPMeta || !XMPConst) {
            return false;
        }

        let xmp = new XMPMeta(seq.projectItem.getXMPMetadata());
        if (!xmp.doesPropertyExist(XMPConst.NS_XMP, creatorKey)) return false;
        return xmp.getProperty(XMPConst.NS_XMP, creatorKey).toString() == creatorValue;
    }

    export function setCreatedByTooling(value: boolean, seq?: Sequence): boolean {
        XMP.setup();
        if (!seq && app.project.activeSequence) seq = app.project.activeSequence;
        if (!seq || !XMPMeta || !XMPConst) {
            return false;
        }

        let xmp = new XMPMeta(seq.projectItem.getXMPMetadata());
        if (value) xmp.setProperty(XMPConst.NS_XMP, creatorKey, creatorValue);
        else xmp.deleteProperty(XMPConst.NS_XMP, creatorKey);

        return seq.projectItem.setXMPMetadata(xmp.serialize());
    }
}