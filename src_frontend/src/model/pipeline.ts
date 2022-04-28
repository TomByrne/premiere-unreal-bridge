import { reactive } from "vue";

export class PipelineModel {
  doneFolder = `done`;
  failedFolder = `failed`;
  cancelledFolder = `cancelled`;
}

export default reactive(new PipelineModel());