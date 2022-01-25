export interface UnrealProject {
  name: string;
  dir: string;
  projectFile: string;
}

export interface UnrealProjectDetail extends UnrealProject {
  scenes: string[];
  sequences: string[];
}
