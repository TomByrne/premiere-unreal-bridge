<template>
  <div class="panel">
    <h1>{{ selectedTrackItem ? selectedTrackItem.name : "" }}</h1>
    <div class="sub" v-if="!hasSequence">
      Open a sequence to enable Unreal export.
    </div>
    <div class="sub" v-else-if="!selectedTrackItem">
    </div>
    <div class="sub" v-else-if="!selectedSpeakerItem">
      Press 'Enable' to make this timeline item renderable.
      <button @click="enableSpeakerMode()">Enable</button>
    </div>
    <div class="sub" v-else>
      Select Unreal shot info for selected timeline item.
      <div class="labelled-list">
        <div class="labelled">
          <div class="label">Project:</div>
          <select
            class="value"
            v-model="selectedSpeakerItem.config.project"
            @change="updateSpeakerInfo($event.target, 'project', ['scene', 'sequence', 'img_slot'])"
            :disabled="model.unreal.loadingProjects"
          >
            <option
              v-for="proj in model.unreal.allProjects"
              :key="proj.dir"
              :value="proj.dir"
            >
              {{ proj.name }}
            </option>
          </select>
        </div>
        <div class="labelled">
          <div class="label">Scene:</div>
          <select
            class="value"
            v-model="selectedSpeakerItem.config.scene"
            @change="updateSpeakerInfo($event.target, 'scene')"
            :disabled="(!selectedSpeakerItem.config.project) || model.unreal.loadingProjectDetails"
          >
            <option v-for="scene in scenes()" :key="scene" :value="scene">
              {{ scene }}
            </option>
          </select>
        </div>
        <div class="labelled">
          <div class="label">Sequence:</div>
          <select
            class="value"
            v-model="selectedSpeakerItem.config.sequence"
            @change="updateSpeakerInfo($event.target, 'sequence')"
            :disabled="(!selectedSpeakerItem.config.project) || model.unreal.loadingProjectDetails"
          >
            <option v-for="seq in sequences()" :key="seq" :value="seq">
              {{ seq }}
            </option>
          </select>
        </div>
        <div class="labelled">
          <div class="label">Slot:</div>
          <select
            class="value"
            v-model="selectedSpeakerItem.config.img_slot"
            @change="updateSpeakerInfo($event.target, 'img_slot')"
            :disabled="(!selectedSpeakerItem.config.project) || model.unreal.loadingProjectDetails"
          >
            <option v-for="seq in imgSlots()" :key="seq" :value="seq">
              {{ seq }}
            </option>
          </select>
        </div>
      </div>
      <button @click="remove()">Remove</button>
      <button @click="refresh()" :disabled="model.unreal.loadingProjectDetails.value">{{model.unreal.loadingProjectDetails.value ? "Loading Unreal Data" : "Refresh Unreal Data"}}</button>
      <!-- <button @click="importItem()" v-if="canImport">Import image seq</button> -->
    </div>
    <div class="error" v-if="error">{{ error }}</div>
    <div v-if="needsRenderTrack()" class="render-track-warning warning">Create an empty video track to enable rendering.</div>
  </div>
</template>

<script lang="ts">
import SequenceTools from "@/logic/SequenceTools";
import UnrealProjectTools from "@/logic/UnrealProjectTools";
import model from "@/model";
import { SpeakerItem, TrackItemInfo } from "@/model/sequence";
import { UnrealProjectDetail } from "@/UnrealProject";
import { watch } from "@vue/runtime-core";
import { Options, Vue } from "vue-class-component";

@Options({
  props: {},
})
export default class SequencePanel extends Vue {
  public error: string | false = false;
  public lastItemID: string | undefined;

  mounted(): void {
    watch(
      () => [this.selectedSpeakerItem],
      () => {
        let id = this.selectedSpeakerItem?.id;
        if (this.lastItemID == id) return;
        this.lastItemID = id;
        UnrealProjectTools.loadProjects();
      },
      { immediate: true }
    );
  }

  get ueProjectDetail(): UnrealProjectDetail | undefined {
    const dir = this.selectedSpeakerItem?.config.project;
    return dir ? model.unreal.findProjectDetails(dir) : undefined;
  }
  get hasSequence(): boolean {
    return !!model.sequence.sequenceMeta;
  }
  get isSetup(): boolean {
    return !!model.sequence.sequenceMeta?.saved;
  }
  get selectedTrackItem(): TrackItemInfo | undefined {
    return model.sequence.sequenceMeta?.selectedItem;
  }
  get selectedSpeakerItem(): SpeakerItem | undefined {
    let id = model.sequence.sequenceMeta?.selectedItem?.id;
    return id ? model.sequence.findSpeakerItem(id) : undefined;
  }
  get scenes(): () => (string | undefined)[] {
    return () => {
      if(!this.ueProjectDetail?.scenes) return [];
      const empty:(string | undefined)[] = [undefined];
      return empty.concat(this.ueProjectDetail.scenes);
    }
  }
  get sequences(): () => (string | undefined)[] {
    return () => {
      if(!this.ueProjectDetail?.sequences) return [];
      const empty:(string | undefined)[] = [undefined];
      return empty.concat(this.ueProjectDetail.sequences);
    }
  }
  get imgSlots(): () => (string | undefined)[] {
    return () => {
      if(!this.ueProjectDetail?.imgSlots) return [];
      const empty:(string | undefined)[] = [undefined];
      return empty.concat(this.ueProjectDetail.imgSlots);
    }
  }
  get model(): unknown {
    return model;
  }
  /*get canImport(): boolean  {
    const speaker = this.selectedSpeakerItem;
    return !!(speaker && !speaker.import.render_proj_item && speaker.render.path);
  }*/
  enableSpeakerMode(): void {
    let id = model.sequence.sequenceMeta?.selectedItem?.id;
    if (!id) return;
    SequenceTools.addSpeakerItem(id)
      .then((res: boolean) => {
        console.log("Speaker mode enabled: ", res);
      })
      .catch((e: unknown) => {
        this.error = "Failed to enable speaker mode: " + e;
      });
  }

  needsRenderTrack(): boolean { 
    return !!(model.sequence.sequenceMeta && !model.sequence.sequenceMeta.render_track);
  }

  updateSpeakerInfo(element: HTMLSelectElement, prop: string, clear?:string[]): void {
    let selection = element.options[element.selectedIndex].value;
    console.log(`Select ${prop}: `, selection);
    let speakerItem = this.selectedSpeakerItem;
    if (!speakerItem) return;
    const config = speakerItem.config;
    Reflect.set(config, prop, selection);
    if(clear) {
      for(const clearProp of clear) {
        Reflect.set(config, clearProp, undefined);
      }
    }
    SequenceTools.updateSpeakerItem(speakerItem);
  }

  refresh(): void {
    console.log("refresh");
    UnrealProjectTools.loadProjects();
    if (this.ueProjectDetail) UnrealProjectTools.loadProjectDetails(this.ueProjectDetail.dir);
  }

  remove(): void {
    let id = model.sequence.sequenceMeta?.selectedItem?.id;
    if (id) SequenceTools.removeSpeakerItem(id);
  }

  // importItem(): void {
  //   let id = model.sequence.sequenceMeta?.selectedItem?.id;
  //   if (id) SequenceTools.importSpeakerRender(id);
  // }
}
</script>

<style scoped lang="scss">
.label {
 padding-left: 3px;
 text-transform: uppercase;
 font-weight: bold;
}
</style>
