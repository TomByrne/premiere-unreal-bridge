
namespace UnrealProjectTools {


    //TODO: Make this configurable
    export function getScenesFolder(): string {
        return "X:\\AWS_ReInvent_2021\\4_MotionDesign\\3D\\Unreal_Projects";
    }

    export function findProjectFileIn(folder: Folder): File | undefined {
        let files = folder.getFiles("*.uproject");
        let file = files[0];
        if (file instanceof File) return file;
        else return undefined;
    }

    function dirFilter(f:Folder): boolean {
        if(f.name == "Brushify" || f.name == "Megascans") return false;
        return true;
    }

    function findSceneFilesIn(folder: Folder): string[] {
        let ret: string[] = [];
        let content = new Folder(`${folder.fsName}\\Content`);
        recurseSearch(content, content, ".umap", ret, 0, undefined, dirFilter);
        return ret;
    }

    function findSequenceFilesIn(folder: Folder): string[] {
        let ret: string[] = [];
        let content = new Folder(`${folder.fsName}\\Content`);
        recurseSearch(content, content, ".uasset", ret, 0, (f: File) => f.path.toLowerCase().indexOf("sequence") != -1, dirFilter);
        return ret;
    }

    function recurseSearch(root: Folder, folder: Folder, ext: string, addTo: string[], depth = 0, fileFilter?: (f: File) => boolean, dirFilter?: (f: Folder) => boolean): void {
        if (depth > 10) {
            console.log("Aborting recursive search at: " + folder.fsName);
            return;
        }
        let all = folder.getFiles();
        for (let file of all) {
            if (file instanceof File) {
                if (file.name.lastIndexOf(ext) == file.name.length - ext.length &&
                    (!fileFilter || fileFilter(file))) {

                    let path = file.getRelativeURI(root.absoluteURI);
                    let asset = "/" + path.substring(0, path.length - ext.length);
                    addTo.push(asset);
                }
            } else if(!dirFilter || dirFilter(file)){
                recurseSearch(root, file, ext, addTo, depth + 1, fileFilter, dirFilter);
            }
        }
    }

    export function listProjects(): UnrealProject[] {
        let jobFolder = new Folder(getScenesFolder());
        let files = jobFolder.getFiles();
        let ret: UnrealProject[] = [];
        for (let file of files) {
            if (file instanceof File) continue;

            let projectFile = findProjectFileIn(file);
            if (!projectFile) continue;

            ret.push({
                name: file.name,
                dir: file.fsName,
                projectFile: projectFile.fsName,
            })
        }
        return ret;
    }

    export function getProjectDetails(dir: string): UnrealProjectDetail | undefined {
        let folder = new Folder(dir);
        if (!folder.exists) return undefined;

        let projectFile = findProjectFileIn(folder);
        if (!projectFile) return undefined;

        return {
            name: folder.name,
            dir: folder.fsName,
            projectFile: projectFile.fsName,
            scenes: findSceneFilesIn(folder),
            sequences: findSequenceFilesIn(folder),
        }
    }
}