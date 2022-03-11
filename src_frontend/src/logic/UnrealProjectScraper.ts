import model from "@/model";
import path from "path";
import fs from "fs";
import glob from "glob";
import { UnrealProject, UnrealProjectDetail } from "@/UnrealProject";

export class UnrealProjectScraper {

     listProjects(): UnrealProject[] {
        const jobFolder = model.unreal.projectRoot;
        if(!fs.existsSync(jobFolder)) {
            console.log("Project folder not found:", jobFolder);
            return [];
        }
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
            imgSlots: this.find(contentDir, model.unreal.globImgSlots, true, false),
        }
    }
    
    private findOne(folder: string, search:string): string | undefined {
        const files = glob.sync(folder + search, {nodir:true});
        return files[0];
    }
    private find(folder: string, search:string, relative?:boolean, files = true): string[] {
        const list = glob.sync(folder + search, {nodir:files});
        if(relative) {
            for(let i=0; i<list.length; i++){
                list[i] = path.relative(folder, list[i]);
            }
        }
        return list;
    }
}

export default new UnrealProjectScraper();