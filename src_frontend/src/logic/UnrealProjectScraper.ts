import model from "@/model";
import path from "path";
import fs from "fs";
import glob from "glob";
import { UnrealProject, UnrealProjectDetail } from "@/UnrealProject";

export class UnrealProjectScraper {


    /* findProjectFileIn(folder: string): string | undefined {
        const files = glob.sync(folder + '/*.uproject', {nodir:true});
        return files[0];
    }

    private findSceneFilesIn(folder: string): string[] {
        const ret: string[] = [];
        const content = `${path.normalize(folder)}\\Content`;
        this.recurseSearch(content, content, ".umap", ret, 0, undefined, folders);
        return ret;
    }

    private findSequenceFilesIn(folder: string): string[] {
        const ret: string[] = [];
        const content = `${path.normalize(folder)}\\Content`;
        this.recurseSearch(content, content, ".uasset", ret, 0, (f: string) => f.toLowerCase().indexOf("sequence") != -1, folders);
        return ret;
    }

    private recurseSearch(root: string, folder: string, ext: string, addTo: string[], depth = 0, fileFilter?: (f: string) => boolean, folders?:Array<string>): void {
        if (depth > 10) {
            console.log("Aborting recursive search at: " + folder);
            return;
        }
        const all = fs.readdirSync(folder);
        for (const name of all) {
            const file = path.join(folder, name);
            if (!fs.lstatSync(file).isDirectory()) {
                if (name.lastIndexOf(ext) == name.length - ext.length &&
                    (!fileFilter || fileFilter(file))) {

                    const path2 = path.posix.normalize(path.relative(root, file));
                    const asset = "/" + path2.substring(0, path2.length - ext.length);
                    addTo.push(asset);
                }
            } else if (!folders || folders.indexOf(name) != -1) {
                this.recurseSearch(root, file, ext, addTo, depth + 1, fileFilter, undefined);
            }
        }
    }*/

     listProjects(): UnrealProject[] {
        const jobFolder = model.unreal.projectRoot;
        const files = fs.readdirSync(jobFolder);
        const ret: UnrealProject[] = [];
        for (const name of files) {
            const file = path.join(jobFolder, name);
            if (!fs.lstatSync(file).isDirectory()) continue;

            const projectFile = this.findOne(file, model.unreal.globProject);
            if (!projectFile) continue;

            ret.push({
                name: path.basename(file),
                dir: path.normalize(file),
                projectFile: path.normalize(projectFile),
            })
        }
        return ret;
    }

     getProjectDetails(dir: string): UnrealProjectDetail | undefined {
        if (!fs.existsSync(dir)) return undefined;

        const projectFile = this.findOne(dir, model.unreal.globProject);
        if (!projectFile) return undefined;

        const contentDir = path.join(dir, "Content");

        return {
            name: path.basename(dir),
            dir: path.normalize(dir),
            projectFile: path.normalize(projectFile),
            scenes: this.find(contentDir, model.unreal.globScene, true),
            sequences: this.find(contentDir, model.unreal.globSeqeuence, true),
        }
    }
    
    private findOne(folder: string, search:string): string | undefined {
        const files = glob.sync(folder + search, {nodir:true});
        return files[0];
    }
    private find(folder: string, search:string, relative?:boolean): string[] {
        const files = glob.sync(folder + search, {nodir:true});
        if(relative) {
            for(let i=0; i<files.length; i++){
                files[i] = path.relative(folder, files[i]);
            }
        }
        return files;
    }
}

export default new UnrealProjectScraper();