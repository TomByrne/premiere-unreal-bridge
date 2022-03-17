import { reactive } from "vue";

const job_folder = "W:\\UnrealTools\\jobs";

export class PipelineModel {
  jobFolder = job_folder;
  jobFolder_done = `${job_folder}\\done`;
  jobFolder_failed = `${job_folder}\\failed`;
  jobFolder_cancelled = `${job_folder}\\cancelled`;

  // jobs:Record<string, JobInfo> = {};
}

export default reactive(new PipelineModel());

/*export interface JobInfo {
  state: JobInfoState | undefined;
  path: string;
  saved: boolean; // Does 'job' have changes that haven't been written to the queue
  job: Job;
}

export enum JobInfoState {
  pending = "pending",
  doing = "doing",
  done = "done",
  failed = "failed",
  cancelled = "cancelled",
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
}*/