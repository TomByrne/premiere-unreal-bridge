
namespace UnrealProjectTools {


    //TODO: Make this configurable
    export function getScenesFolder(): string {
        return "W:\\2660_AWS_ReINVENT\\4 Motion Design\\3D\\Unreal_Projects";
    }

    export function findProjectFileIn(folder: Folder): File | undefined {
        let files = folder.getFiles("*.uproject");
        let file = files[0];
        if (file instanceof File) return file;
        else return undefined;
    }

    function findSceneFilesIn(folder: Folder, folders?:string[]): string[] {
        let ret: string[] = [];
        let content = new Folder(`${folder.fsName}\\Content`);
        recurseSearch(content, content, ".umap", ret, 0, undefined, folders);
        return ret;
    }

    function findSequenceFilesIn(folder: Folder, folders?:string[]): string[] {
        let ret: string[] = [];
        let content = new Folder(`${folder.fsName}\\Content`);
        recurseSearch(content, content, ".uasset", ret, 0, (f: File) => f.path.toLowerCase().indexOf("sequence") != -1, folders);
        return ret;
    }

    function recurseSearch(root: Folder, folder: Folder, ext: string, addTo: string[], depth = 0, fileFilter?: (f: File) => boolean, folders?:Array<string>): void {
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
            } else if (!folders || folders.indexOf(file) != -1) {
                recurseSearch(root, file, ext, addTo, depth + 1, fileFilter, undefined);
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

    export function getProjectDetails(dir: string, folders?:string[]): UnrealProjectDetail | undefined {
        let folder = new Folder(dir);
        if (!folder.exists) return undefined;

        let projectFile = findProjectFileIn(folder);
        if (!projectFile) return undefined;

        return {
            name: folder.name,
            dir: folder.fsName,
            projectFile: projectFile.fsName,
            scenes: findSceneFilesIn(folder, folders),
            sequences: findSequenceFilesIn(folder, folders),
        }
    }
}