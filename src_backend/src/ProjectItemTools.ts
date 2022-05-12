
namespace ProjectItemTools {
    export const RootBinName = "ue_bridge";
    export const RenderBinName = "renders";
    export const TempBinName = ".temp";

    export const FPS = 30; // also hard-coded into epr file

    export function find(id: string): ProjectItem | undefined {
       return findWithin(app.project.rootItem, id);
    }
    export function findWithin(within:ProjectItem, id: string, verbose?: boolean): ProjectItem | undefined {
        for(const item of within.children) {
            if(verbose) console.log("search: ", item.nodeId, item.nodeId == id);
            if(item.nodeId == id) return item;
            else if(item.type == ProjectItemType.BIN){
                const found = findWithin(item, id);
                if(found) return found;
            }
        }
    }

    export function getRootBin(): ProjectItem {
        for(const item of app.project.rootItem.children) {
            if(item.name == RootBinName) return item;
        }
        return app.project.rootItem.createBin(RootBinName);
    }

    export function getTempBin(): ProjectItem {
        const root = getRootBin();
        for(const item of root.children) {
            if(item.name == TempBinName) return item;
        }
        return root.createBin(TempBinName);
    }

    export function getRenderBin(): ProjectItem {
        const root = getRootBin();
        for(const item of root.children) {
            if(item.name == RenderBinName) return item;
        }
        return root.createBin(RenderBinName);
    }

    export function findSpeakerItem(id: string, verbose?: boolean) : ProjectItem | undefined {
        return findWithin(getTempBin(), id, verbose);
    }

    export function getSelected() {
        let viewIDs = app.getProjectViewIDs();
        if (viewIDs) {
            for (let a = 0; a < app.projects.numProjects; a++) {
                let currentProject = app.getProjectFromViewID(viewIDs[a]);
                if (currentProject) {
                    if (currentProject.documentID === app.project.documentID) { // We're in the right project!
                        return app.getProjectViewSelection(viewIDs[a]);
                    }
                }
            }
        }
    }

    export function doForSelected<T>(f: (p: ProjectItem) => T): T | undefined {
        let items = getSelected();
        if (!items || !items.length) {
            console.warn("No selected items found");
            return;
        }

        let ret: T | undefined;
        for (let i = 0; i < items.length; i++) {
            ret = f(items[i]);
        }
        return ret;
    }

    export function getFramerate(item?: ProjectItem): number | undefined {
        if (!item) {
            return doForSelected((item) => getFramerate(item))
        }

        let interp = item.getFootageInterpretation();
        return interp ? interp.frameRate : undefined;
    }

    export function setFramerate(to:number, item?: ProjectItem): number | undefined {
        if (!item) {
            return doForSelected((item) => getFramerate(item))
        }

        let interp = item.getFootageInterpretation();
        if(interp == 0) return;
        interp.frameRate = to;
        item.setFootageInterpretation(interp);
    }
    
    export function importImageSequence(path: string | File, fps:number = FPS): ProjectItem | undefined {
        const renderBin = getRenderBin();
        const oldIds = [];
        for(const child of renderBin.children) oldIds.push(child.nodeId);

        if(path instanceof File) path = path.absoluteURI;

        app.project.importFiles([path], false, renderBin, true);

        var ret: ProjectItem | undefined;
        for(const child of renderBin.children) {
            if(oldIds.indexOf(child.nodeId) == -1) {
                ret = child;
                break;
            }
        }
        if(!ret) return;

        setFramerate(fps, ret);

        let actualFps = getFramerate(ret);
        if (actualFps != fps) {
            console.warn("Frame rate set to " + actualFps + ".\n\nSet default rate rate in:\nPreferences > Media > Indeterminate Media Timebase.");
        }

        return ret;
    }

    export function reimport(item?: ProjectItem): boolean {
        if (!item) {
            return !!doForSelected((item) => reimport(item))
        }

        if (item.type == ProjectItemType.BIN) {
            console.warn("Can't re-import folder");
            return false;
        }

        let frameRate = getFramerate(item) || FPS;

        // Reloads the image sequence from disk, but messes up the FPS
        item.changeMediaPath(item.getMediaPath());

        setFramerate(frameRate, item);

        let actualFps = getFramerate(item);
        if (actualFps != frameRate) {
            console.warn("Frame rate set to " + actualFps + ".\n\nSet default rate rate in:\nPreferences > Media > Indeterminate Media Timebase.");
        }

        return true;
    }
}