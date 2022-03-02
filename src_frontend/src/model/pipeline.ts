import { reactive } from "vue";

export class PipelineModel {
  jobFolder = "W:\\UnrealTools\\jobs";
  jobs:Record<string, JobInfo> = {};
}

export default reactive(new PipelineModel());

export interface JobInfo {
  path: string;
  job: Job;
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