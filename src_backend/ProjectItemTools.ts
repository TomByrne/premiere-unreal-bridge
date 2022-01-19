
namespace ProjectItemTools {
    export function getSelected() {
        var viewIDs = app.getProjectViewIDs();
        if (viewIDs) {
            for (var a = 0; a < app.projects.numProjects; a++) {
                var currentProject = app.getProjectFromViewID(viewIDs[a]);
                if (currentProject) {
                    if (currentProject.documentID === app.project.documentID) { // We're in the right project!
                        return app.getProjectViewSelection(viewIDs[a]);
                    }
                }
            }
        }
    }

    export function doForSelected(f: (p: ProjectItem) => void) {
        var items = getSelected();
        if (!items || !items.length) {
            alert("No selected items found");
            return;
        }

        for (var i = 0; i < items.length; i++) {
            f(items[i]);
        }
    }

    export function getFramerate(item: ProjectItem) {
        var interp = item.getFootageInterpretation();
        return interp ? interp.frameRate : null;
    }

    export function reimport(item?: ProjectItem) {
        if (!item) {
            doForSelected((item) => reimport(item))
            return;
        }

        if (item.type == ProjectItemType.BIN) {
            alert("Can't re-import folder");
            return;
        }

        var frameRate = getFramerate(item) || 30;

        // Reloads the image sequence from disk, but messes up the FPS
        item.changeMediaPath(item.getMediaPath());

        // Not available sometimes ??
        if (item.setOverrideFramerate) {
            item.setOverrideFramerate(frameRate)
        }

        // THIS DOESN"T SEEM TO WORK ??
        var interp = item.getFootageInterpretation();
        if (interp && interp.frameRate != frameRate) {
            interp.frameRate = frameRate;
            item.setFootageInterpretation(interp)
        }

        var actualFps = getFramerate(item);
        if (actualFps != 30) {
            alert("Frame rate set to " + actualFps + ".\n\nSet default rate rate in:\nPreferences > Media > Indeterminate Media Timebase.");
        }
    }
}