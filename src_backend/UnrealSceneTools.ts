
namespace UnrealSceneTools {

    export interface UnrealScene {
        dir: string
        projectFile: string
        scenes: string[]
        sequences: string[]
    }

    //TODO: Make this configurable
    export function getScenesFolder(): string {
        return "X:\\AWS_ReInvent_2021\\4_MotionDesign\\3D\\Unreal_Projects";
    }

    export function findProjectFileIn(folder: Folder): File | undefined {
        let files = folder.getFiles("*.uproject");
        let file = files[0];
        if(file instanceof File) return file;
        else return undefined;
    }

    export function findSceneFilesIn(folder: Folder): string[] {
        let ret: string[] = [];
        let content = new Folder(`${folder.fsName}\\Content`);
        recurseSearch(content, content, ".umap", ret);
        return ret;
    }

    export function findSequenceFilesIn(folder: Folder): string[] {
        let ret: string[] = [];
        let content = new Folder(`${folder.fsName}\\Content`);
        recurseSearch(content, content, ".uasset", ret);
        return ret;
    }

    function recurseSearch(root: Folder, folder: Folder, ext: string, addTo:string[]): void {
        let all = folder.getFiles();
        for(let file of all){
            if(file instanceof File) {
                if(file.name.lastIndexOf(ext) == file.name.length - ext.length){
                    let asset = "/" + file.getRelativeURI(root.absoluteURI).substr(0, file.name.length - ext.length);
                    addTo.push(asset);
               }
            }else{
                recurseSearch(root, file, ext, addTo)
            }
        }
    }

    export function listScenes(): UnrealScene[] {
        let jobFolder = new Folder(getScenesFolder());
        let files = jobFolder.getFiles();
        let ret:UnrealScene[] = [];
        for (let file of files) {
            if (file instanceof File) continue;

            let projectFile = findProjectFileIn(file);
            if (!projectFile) continue;

            ret.push({
                dir: file.fsName,
                projectFile: projectFile.fsName,
                scenes: findSceneFilesIn(file),
                sequences: findSequenceFilesIn(file),
            })
        }
        return ret;
    }
}