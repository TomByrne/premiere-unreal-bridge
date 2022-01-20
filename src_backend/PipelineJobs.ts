
namespace PipelineJobs {
    export interface JobsStatus {
        activeJobs: number
    }

    export interface Job {
        cmd: string,
        project: string,
        scene: string,
        sequence: string,
        render_settings: string,
        output?: string,
        output_format?: string,
        attempts?: number,
        width?: number,
        height?: number,
        scale?: number,
        start_frame?: number,
        end_frame?: number,
    }

    //TODO: Make configurable
    export function getJobFolder(): string {
        return "X:\\UnrealEngine\\aws-unreal-renderpipeline\\1_todo";
    }


    export function getJobsStatus(): JobsStatus {
        let jobFolder = new Folder(getJobFolder());
        let files = jobFolder.getFiles("*.json");

        let ret: JobsStatus = {
            activeJobs: files.length
        }

        return ret;
    }


    export function addJobStr(name: string, job: Job | string, overwrite?: boolean): boolean {
        if(typeof(job) != "string"){
            let jobStr = JSON.stringify(job);
            if(!jobStr) return false;
            job = jobStr;
        }
        let file = new File(`${getJobFolder()}\\${name}.json`);
        let counter = 0;
        while(!overwrite && file.exists) {
            file = new File(`${getJobFolder()}\\${name}_${counter}.json`);
            counter++;
        }

        return  file.open("w") &&
                file.write(job) &&
                file.close();
    }
}