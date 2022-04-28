import { reactive, toRaw, watch } from "vue";

const storageKey = "SettingsModel";

// Settings model gets saved locally
export class SettingsModel {
  panel_shown = false;

  // Pipeline
  pipeline_jobFolder = "W:\\UnrealTools\\jobs";

  // Unreal
  unreal_projectFolder = "W:\\2660_AWS_ReINVENT\\4 Motion Design\\3D\\Unreal_Projects";
  unreal_globProject = "/*.uproject"
  unreal_globScene = "/AWS/Maps/*.umap"
  unreal_globSequence = "/AWS/Sequences/*.uasset"
  unreal_globImgSlots = "/AWS/PremiereSequences/*"

}

let model = new SettingsModel();

// Load from LS
const value = localStorage.getItem(storageKey);
if (value) {
  model = Object.assign(model, JSON.parse(value));
}

console.log("Settings: ", model);

const react = reactive(model);

// Save to LS
watch(() => [react], () => {
  localStorage.setItem(storageKey, JSON.stringify(toRaw(react)));
}, {
  deep:true
});

export function reset() {
  Object.assign(react, new SettingsModel())
}

export default react;
