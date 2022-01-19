namespace SequenceTools {

    export function getCreatedByTooling(seq?: Sequence): boolean {
        XMP.setup();
        if(!seq && app.project.activeSequence) seq = app.project.activeSequence;
        if(!seq || !XMPMeta || !XMPConst) {
            return false;
        }
        var xmp = new XMPMeta(seq.projectItem.getXMPMetadata());
        console.log(xmp.getProperty(XMPConst.NS_DM, 'tooling_created'))
        return xmp.getProperty(XMPConst.NS_DM, 'tooling_created') == "1";
    }

    export function setCreatedByTooling(value:boolean, seq?: Sequence): boolean {
        XMP.setup();
        if(!seq && app.project.activeSequence) seq = app.project.activeSequence;
        if(!seq || !XMPMeta || !XMPConst) {
            return false;
        }


        var xmp = new XMPMeta(seq.projectItem.getXMPMetadata());
        return xmp.setProperty(XMPConst.NS_DM, 'tooling_created', value ? "1" : "0");
    }
}