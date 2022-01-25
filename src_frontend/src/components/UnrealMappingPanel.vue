<template>
  <div class="panel">
    <h1>Unreal Project / Scene / Sequence</h1>
    <div class="sub" v-if="!hasSequence">
      Open a sequence to enable Unreal export.
    </div>
    <!-- <div class="sub" v-else-if="!isSetup">
      Sequence not set up for Unreal export.
      <button>Setup this sequence</button>
      <button>Setup a copy</button>
    </div> -->
    <!-- <div class="sub" v-else-if="!renderTrack">
      Create a render track to enable Unreal.
      <button @click="createRenderTrack">Create a track</button>
    </div> -->
    <div class="sub" v-else-if="!selectedTrackItem">
      Select a timeline video item to begin adding Unreal shot info.
    </div>
    <div class="sub" v-else-if="!selectedSpeakerItem">
      Selected item is not yet speaker enabled.
      <button @click="enableSpeakerMode">Enable now</button>
    </div>
    <div class="sub" v-else>
      Select Unreal shot info for selected timeline item.
      <div class="labelled-list">
        <div class="labelled">
          <div class="label">Project:</div>
          <select
            class="value"
            v-model="selectedSpeakerItem.project"
            @change="updateSpeakerInfo($event.target, 'project')"
          >
            <option
              v-for="(proj, ind) in ueProjects"
              :key="ind"
              :value="proj.dir"
            >
              {{ proj.name }}
            </option>
          </select>
        </div>
        <div class="labelled" v-if="ueProjectDetail">
          <div class="label">Scene:</div>
          <select
            class="value"
            v-model="selectedSpeakerItem.scene"
            @change="updateSpeakerInfo($event.target, 'scene')"
          >
            <option
              v-for="(scene, ind) in ueProjectDetail.scenes"
              :key="ind"
              :value="scene"
            >
              {{ scene }}
            </option>
          </select>
        </div>
        <div class="labelled" v-if="ueProjectDetail">
          <div class="label">Sequence:</div>
          <select
            class="value"
            @change="updateSpeakerInfo($event.target, 'sequence')"
          >
            <option
              v-for="(seq, ind) in ueProjectDetail.sequences"
              :key="ind"
              :value="seq"
            >
              {{ seq }}
            </option>
          </select>
        </div>
      </div>
      <button @click="remove()">Clear info from item</button>
      <button @click="refresh()">Refresh Unreal Data</button>
    </div>
    <div class="code" v-if="model.plugin.devMode">
      {{ model.sequence.sequenceMeta }}
    </div>
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
  public ueProjects: UnrealProject[] = [];
  public ueProjectDir: string | undefined;
  public ueProjectDetail: UnrealProjectDetail | undefined;

  mounted(): void {
    watch(
      () => [this.selectedSpeakerItem],
      () => {
        this.loadProjects();
      },
      { immediate: true }
    );
    watch(
      () => [this.selectedSpeakerItem?.project],
      () => {
        this.loadProjectDetails();
      },
      { immediate: true }
    );
  }

  get hasSequence(): boolean {
    return !!model.sequence.sequenceMeta.value;
  }
  get isSetup(): boolean {
    return !!model.sequence.sequenceMeta.value?.saved;
  }
  get selectedTrackItem(): TrackItemInfo | undefined {
    let id = model.sequence.sequenceMeta.value?.selectedItem;
    if (!id) return undefined;
    return model.sequence.findTrackItem(id);
  }
  get selectedSpeakerItem(): SpeakerItem | undefined {
    let id = model.sequence.sequenceMeta.value?.selectedItem;
    if (!id) return undefined;
    return model.sequence.findSpeakerItem(id);
  }
  get model(): unknown {
    return model;
  }
  enableSpeakerMode(): void {
    let id = model.sequence.sequenceMeta.value?.selectedItem;
    if (!id) return;
    SequenceTools.addSpeakerItem({ itemId: id })
      .then((res: boolean) => {
        console.log("Speaker mode enabled: ", res);
      })
      .catch((e: unknown) => {
        this.error = "Failed to enable speaker mode: " + e;
      });
  }

  loadProjects(): void {
    UnrealProjectTools.listProjects()
      .then((projects: UnrealProject[]) => {
        this.ueProjects = projects;
      })
      .catch((e) => {
        console.log("Failed to load Unreal projects: ", e);
      });
  }

  loadProjectDetails(): void {
    let dir = this.selectedSpeakerItem?.project;
    if (!dir) {
      this.ueProjectDetail = undefined;
      this.ueProjectDir = undefined;
      return;
    }
    if (this.ueProjectDir == dir) return;
    this.ueProjectDir = dir;
    UnrealProjectTools.getProjectDetails(dir)
      .then((d: UnrealProjectDetail | undefined) => {
        this.ueProjectDetail = d;
      })
      .catch((e) => {
        console.log("Failed to load project detail: ", e);
      });
  }

  updateSpeakerInfo(element: HTMLSelectElement, prop: string): void {
    let selection = element.options[element.selectedIndex].value;
    console.log(`Select ${prop}: `, selection);
    let speakerItem = this.selectedSpeakerItem;
    if (!speakerItem) return;
    Reflect.set(speakerItem, prop, selection);
    SequenceTools.updateSpeakerItem(speakerItem);
  }

  refresh(): void {
    this.loadProjects();
    if (this.ueProjectDetail) this.loadProjectDetails();
  }

  remove(): void {
    let id = model.sequence.sequenceMeta.value?.selectedItem;
    if (!id) return;
    SequenceTools.removeSpeakerItem(id);
  }
}
</script>

<style scoped lang="scss"></style>
