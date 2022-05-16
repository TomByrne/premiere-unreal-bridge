import { reactive } from "vue";

export class OverviewModel {
  items:SpeakerItemOverview[] = [];

  nextItem: SpeakerItemOverview | undefined;

  progress = 0;
  total = 0;
  
  running_all = false;
}

export interface SpeakerItemOverview {
  id: string,
  
  needsConfig: boolean,
  needsConfig_project: boolean,
  needsConfig_scene: boolean,
  needsConfig_seqeunce: boolean,
  needsConfig_slots: boolean,

  [SpeakerItemStep.SLOTS]: boolean,
  [SpeakerItemStep.RENDER]: boolean,
  [SpeakerItemStep.IMPORT]: boolean,

  nextStep: SpeakerItemStep | undefined,
}

export enum SpeakerItemStep {
  SLOTS = "slots",
  RENDER = "render",
  IMPORT = "import",
}

export default reactive(new OverviewModel());