<template>
  <div class="panel" v-if="selectedSpeakerItem && selectedTrackItem">
    <h1>{{ selectedTrackItem.name }}</h1>
    <div class="sub" v-if="!hasSequence">
      Open a sequence to enable Unreal export.
    </div>
    <div class="sub">
      Select Unreal shot info for selected timeline item.
      <div class="labelled-list">
        <div class="labelled">
          <div class="label">Project:</div>
          <select
            class="value"
            v-model="selectedSpeakerItem.project"
            @change="updateSpeakerInfo($event.target, 'project')"
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
        <div class="labelled" v-if="selectedSpeakerItem.project">
          <div class="label">Scene:</div>
          <select
            class="value"
            v-model="selectedSpeakerItem.scene"
            @change="updateSpeakerInfo($event.target, 'scene')"
            :disabled="model.unreal.loadingProjectDetails"
          >
            <option v-for="scene in scenes()" :key="scene" :value="scene">
              {{ scene }}
            </option>
          </select>
        </div>
        <div class="labelled" v-if="selectedSpeakerItem.project">
          <div class="label">Sequence:</div>
          <select
            class="value"
            @change="updateSpeakerInfo($event.target, 'sequence')"
            :disabled="model.unreal.loadingProjectDetails"
          >
            <option v-for="seq in sequences()" :key="seq" :value="seq">
              {{ seq }}
            </option>
          </select>
        </div>
      </div>
      <button @click="remove()">Clear info from item</button>
      <button @click="refresh()" :disabled="model.unreal.loadingProjectDetails.value">{{model.unreal.loadingProjectDetails.value ? "Loading Unreal Data" : "Refresh Unreal Data"}}</button>
    </div>
    <!-- <div class="code" v-if="model.plugin.devMode">
      {{ model.sequence.sequenceMeta }}
    </div> -->
    <div class="error" v-if="error">{{ error }}</div>
  </div>
</template>

<script lang="ts">
import SequenceTools from "@/logic/SequenceTools";
import UnrealProjectTools from "@/logic/UnrealProjectTools";
import model from "@/model";
import { SpeakerItem, TrackItemInfo } from "@/SequenceMeta";
import { UnrealProject, UnrealProjectDetail } from "@/UnrealProject";
import { watch } from "@vue/runtime-core";
import { Options, Vue } from "vue-class-component";

@Options({
  props: {},
})
export default class SequencePanel extends Vue {
  public error: string | false = false;
  // public ueProjects: UnrealProject[] = [];
  // public ueProjectDetail: UnrealProjectDetail | undefined;

  public lastItemID: string | undefined;
  // public lastProjectDir: string | undefined;

  // public loadingProjects = false;
  // public loadingDetail = false;

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
    /*watch(
      () => [this.selectedSpeakerItem?.project],
      () => {
        console.log("Project changed");
        const project = this.selectedSpeakerItem?.project;
        if(project) UnrealProjectTools.loadingProjectDetails(project)
      },
      { immediate: true }
    );*/
  }

  get ueProjectDetail(): UnrealProjectDetail | undefined {
    const dir = this.selectedSpeakerItem?.project;
    return dir ? model.unreal.findProjectDetails(dir) : undefined;
  }
  get hasSequence(): boolean {
    return !!model.sequence.sequenceMeta;
  }
  get isSetup(): boolean {
    return !!model.sequence.sequenceMeta?.saved;
  }
  get selectedTrackItem(): TrackItemInfo | undefined {
    let id = model.sequence.sequenceMeta?.selectedItem?.id;
    return id ? model.sequence.findTrackItem(id) : undefined;
  }
  get selectedSpeakerItem(): SpeakerItem | undefined {
    let id = model.sequence.sequenceMeta?.selectedItem?.id;
    return id ? model.sequence.findSpeakerItem(id) : undefined;
  }
  get scenes(): () => string[] {
    return () => this.ueProjectDetail?.scenes || [];
  }
  get sequences(): () => string[] {
    return () => this.ueProjectDetail?.sequences || [];
  }
  get model(): unknown {
    return model;
  }
  enableSpeakerMode(): void {
    let id = model.sequence.sequenceMeta?.selectedItem?.id;
    if (!id) return;
    SequenceTools.addSpeakerItem({ id })
      .then((res: boolean) => {
        console.log("Speaker mode enabled: ", res);
      })
      .catch((e: unknown) => {
        this.error = "Failed to enable speaker mode: " + e;
      });
  }

  // loadProjects(): void {
  //   this.loadingProjects = true;
  //   UnrealProjectTools.listProjects()
  //     .then((projects: UnrealProject[]) => {
  //       this.loadingProjects = false;
  //       this.ueProjects = projects;
  //     })
  //     .catch((e) => {
  //       this.loadingProjects = false;
  //       console.log("Failed to load Unreal projects: ", e);
  //     });
  // }

  /*loadProjectDetails(force?: boolean): void {
    let dir = this.selectedSpeakerItem?.project;
    if (!dir) {
      this.lastProjectDir = undefined;
      return;
    }
    if (!force && this.lastProjectDir == dir) return;
    this.lastProjectDir = dir;
    // this.loadingDetail = true;
    UnrealProjectTools.getProjectDetails(dir)
      .then((d: UnrealProjectDetail | undefined) => {
        // this.loadingDetail = false;
        // this.ueProjectDetail = d;
      })
      .catch(() => {
        // this.loadingDetail = false;
        // this.ueProjectDetail = undefined;
        this.lastProjectDir = undefined;
        console.log("Failed to load project detail: ", e);
      });
  }*/

  updateSpeakerInfo(element: HTMLSelectElement, prop: string): void {
    let selection = element.options[element.selectedIndex].value;
    console.log(`Select ${prop}: `, selection);
    let speakerItem = this.selectedSpeakerItem;
    if (!speakerItem) return;
    Reflect.set(speakerItem, prop, selection);
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
}
</script>

<style scoped lang="scss"></style>
