<template>
  <div class="settings panel" :class="{ closed: !settings_open }">
    <h1>Settings</h1>

    <h2>Plugin Settings</h2>
    <div class="setting labelled">
      <div class="label">
        <input id="plugin_overviewSave" v-model="model.settings.plugin_overviewSave" type="checkbox"/>
        <label for="plugin_overviewSave">Save project after 'Run All':</label>
      </div>
    </div>

    <h2>UE Pipeline Settings</h2>
    <div class="setting labelled">
      <div class="label">Pipeline Job Dest:</div>
      <input class="value" v-model="model.settings.pipeline_jobFolder" />
      <div
        class="pick-dir"
        @click="
          pickFolder('pipeline_jobFolder', 'Select UE Pipeline Job Folder')
        "
      >
        ...
      </div>
    </div>

    <h2>Unreal Scrape Settings</h2>
    <div class="setting labelled">
      <div class="label">UE Project Folder:</div>
      <input class="value" v-model="model.settings.unreal_projectFolder" />
      <div
        class="pick-dir"
        @click="
          pickFolder('unreal_projectFolder', 'Select Unreal Project Folder')
        "
      >
        ...
      </div>
    </div>
    <div class="setting labelled">
      <div class="label">Scene Search Pattern:</div>
      <input class="value" v-model="model.settings.unreal_globScene" />
      <div class="spacer" />
    </div>
    <div class="setting labelled">
      <div class="label">Sequence Search Pattern:</div>
      <input class="value" v-model="model.settings.unreal_globSequence" />
      <div class="spacer" />
    </div>
    <div class="setting labelled">
      <div class="label">Img Sequence Search Pattern:</div>
      <input class="value" v-model="model.settings.unreal_globImgSlots" />
      <div class="spacer" />
    </div>
    <div class="buttons">
      <button class="small" @click="reset">Reset</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import model from "@/model";
import { reset } from "@/model/settings";
import FileSystemTools from "@/logic/FileSystemTools";

export default class SettingsPanel extends Vue {
  get model() {
    return model;
  }
  get settings_open(): boolean {
    return model.settings.panel_shown;
  }

  pickFolder(prop: string, prompt: string) {
    FileSystemTools.browseForFolder(prompt).then(
      (value: string | undefined) => {
        if (value) {
          Reflect.set(model.settings, prop, value);
        }
      }
    );
  }

  reset(){
    reset();
  }
}
</script>

<style scoped lang="scss">
.settings {
  position: absolute;
  bottom: 0;
  left:0;
  transition: all 0.35s ease;
  overflow: hidden;
  padding-bottom: 95px;
  height: fit-content;
  width: 100%;
  background-color: var(--bg);

  &.closed {
    opacity: 0;
    transform: translateY(100px);
    height: 0;
    padding-bottom: 0;
    padding-top: 0;
  }


  h2 {
    padding-top: 10px;
  }

  .setting {
    background: none;
  }

  .pick-dir,
  .spacer {
    padding: 0 4px;
    font-size: 1.2em;
    width: 15px;
  }

  .buttons {
    padding-right: 24px;
  }
}
</style>
