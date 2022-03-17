import path from "path";
import fs from "fs";
import model from "@/model";
import { PipelineJob } from "@/model/sequence";

export function resolveJobPath(name: string, overwrite?: boolean): string {
    let file = path.join(model.pipeline.jobFolder, `${name}.json`);
    let counter = 0;
    while(!overwrite && fs.existsSync(file)) {
        file = path.join(model.pipeline.jobFolder, `${name}_${counter}.json`);
        counter++;
    }
    return file;
}

export function writeJob(file: string, job: PipelineJob | string): Promise<null> {
    console.log("writeJob: ", file, job);
    return new Promise((resolve, reject) => {
        if(typeof(job) != "string"){
            const jobStr = JSON.stringify(job, null, " ");
            if(!jobStr){
                reject("Couldn't serialize job");
                return;
            }
            job = jobStr;
        }
    
        fs.writeFile(file, job, (err: NodeJS.ErrnoException | null) => {
            if(err) reject(err);
            else resolve(null);
        })
    });
}

export function deleteJob(file: string): Promise<null> {
    console.log("deleteJob: ", file);
    return new Promise((resolve, reject) => {
        if(!fs.existsSync(file)){
            resolve(null);
            return;
        }
        fs.rm(file, (err: NodeJS.ErrnoException | null) => {
            if(err) reject(err);
            else resolve(null);
        })
    });
}

export default {
    writeJob,
    deleteJob,
    resolveJobPath,
};
