
namespace ProjectItemTools {
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

    export function reimport(item?: ProjectItem): boolean {
        if (!item) {
            return !!doForSelected((item) => reimport(item))
        }

        if (item.type == ProjectItemType.BIN) {
            console.warn("Can't re-import folder");
            return false;
        }

        let frameRate = getFramerate(item) || 30;

        // Reloads the image sequence from disk, but messes up the FPS
        item.changeMediaPath(item.getMediaPath());

        // Not available sometimes ??
        if (item.setOverrideFramerate) {
            item.setOverrideFramerate(frameRate)
        }

        // THIS DOESN"T SEEM TO WORK ??
        let interp = item.getFootageInterpretation();
        if (interp && interp.frameRate != frameRate) {
            interp.frameRate = frameRate;
            item.setFootageInterpretation(interp)
        }

        let actualFps = getFramerate(item);
        if (actualFps != 30) {
            console.warn("Frame rate set to " + actualFps + ".\n\nSet default rate rate in:\nPreferences > Media > Indeterminate Media Timebase.");
        }

        return true;
    }
}