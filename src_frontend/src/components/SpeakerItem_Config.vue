<template>
  <div
    class="speaker-row"
    :class="{
      'needs-action': needsConfig,
      open: open,
      minimised: minimised,
      hidden: hidden,
    }"
  >
    <div
      class="header"
      :class="{ success: !needsConfig }"
    >
      <span class="label-sup">
        <OpenChevron :open="open" @click="open = !open"/>
        Config:
      </span>

      <div class="label" v-if="needsProject">Select an Unreal Project</div>
      <div class="label" v-else-if="needsScene">Select an Unreal Scene</div>
      <div class="label" v-else-if="needsSequence">
        Select an Unreal Sequence
      </div>
      <div class="label" v-else-if="needsSlot">Select an Image Slot</div>
      <div class="label" v-else>Configured</div>

      <span class="buttons">
        <button class="small" v-if="!open">Open</button>
        <button class="small" v-else>Close</button>
      </span>
    </div>

    <Progress :value="stepsDone" :total="stepsTotal" :minimised="true"/>

    <div v-if="open" class="controls labelled-list">
      <div class="labelled">
        <div class="label">Project:</div>
        <select
          class="value"
          v-model="speaker.config.project"
          @change="
            updateSpeakerItem($event.target, 'project', [
              'scene',
              'sequence',
              'img_slot',
            ])
          "
          :disabled="unreal.loadingProjects"
        >
          <option
            v-for="proj in unreal.allProjects"
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
          v-model="speaker.config.scene"
          @change="updateSpeakerItem($event.target, 'scene')"
          :disabled="!speaker.config.project || unreal.loadingProjectDetails"
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
          v-model="speaker.config.sequence"
          @change="updateSpeakerItem($event.target, 'sequence')"
          :disabled="!speaker.config.project || unreal.loadingProjectDetails"
        >
          <option v-for="seq in sequences()" :key="seq" :value="seq">
            {{ seq }}
          </option>
        </select>
      </div>
      <div class="labelled" v-if="hasSlots">
        <div class="label">Slot:</div>
        <select
          class="value"
          v-model="speaker.config.img_slot"
          @change="updateSpeakerItem($event.target, 'img_slot')"
          :disabled="!speaker.config.project || unreal.loadingProjectDetails"
        >
          <option v-for="seq in imgSlots()" :key="seq" :value="seq">
            {{ seq }}
          </option>
        </select>
      </div>
      <div class="buttons">
        <button
          @click="refresh()"
          :disabled="unreal.loadingProjectDetails.value"
        >
          {{
            unreal.loadingProjectDetails.value
              ? "Loading Unreal Data"
              : "Refresh Unreal Data"
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import model from "@/model";
import { SpeakerItem } from "@/model/sequence";
import SequenceTools from "@/logic/SequenceTools";
import { UnrealProjectDetail } from "@/UnrealProject";
import { UnrealModel } from "@/model/unreal";
import UnrealProjectTools from "@/logic/UnrealProjectTools";
import { watch } from "vue";
import Progress from "./Progress.vue";
import OpenChevron from "./OpenChevron.vue";

@Options({
  props: {
    speaker: null,
    minimised: Boolean,
    hidden: Boolean,
  },
  components: {
    Progress,
    OpenChevron,
  },
})
export default class SpeakerItem_Config extends Vue {
  speaker: SpeakerItem | undefined;
  open = false;

  mounted(): void {
    this.open = this.needsProject;

    // Auto-select single item lists
    watch(
      () => [this.ueProjectDetail],
      () => {
        if (!this.speaker || !this.ueProjectDetail) return;

        let changes = false;

        if (
          !this.speaker.config.scene &&
          this.ueProjectDetail.scenes?.length == 1
        ) {
          changes = true;
          this.speaker.config.scene = this.ueProjectDetail.scenes[0];
        }

        if (
          !this.speaker.config.sequence &&
          this.ueProjectDetail.sequences?.length == 1
        ) {
          changes = true;
          this.speaker.config.sequence = this.ueProjectDetail.sequences[0];
        }

        if (
          !this.speaker.config.img_slot &&
          this.ueProjectDetail.imgSlots?.length == 1
        ) {
          changes = true;
          this.speaker.config.img_slot = this.ueProjectDetail.imgSlots[0];
        }

        if (changes) SequenceTools.updateSpeakerItem(this.speaker);
      }
    );
  }

  get stepsDone(): number {
    return (
      (this.needsProject ? 0 : 1) +
      (this.needsScene ? 0 : 1) +
      (this.needsSequence ? 0 : 1) +
      (!this.hasSlots || this.needsSlot ? 0 : 1)
    );
  }

  get stepsTotal(): number {
    return 3 + (this.hasSlots ? 1 : 0);
  }

  get unreal(): UnrealModel {
    return model.unreal;
  }
  get ueProjectDetail(): UnrealProjectDetail | undefined {
    const dir = this.speaker?.config.project;
    return dir ? model.unreal.findProjectDetails(dir) : undefined;
  }

  get hasSlots(): boolean {
    const slots = this.ueProjectDetail?.imgSlots;
    return slots ? slots.length > 0 : false;
  }

  get needsProject(): boolean {
    return !this.speaker?.config.project;
  }
  get needsScene(): boolean {
    return !this.speaker?.config.scene;
  }
  get needsSequence(): boolean {
    return !this.speaker?.config.sequence;
  }
  get needsSlot(): boolean {
    return this.hasSlots && !this.speaker?.config.img_slot;
  }
  get needsConfig(): boolean {
    return (
      this.needsProject ||
      this.needsScene ||
      this.needsSequence ||
      this.needsSlot
    );
  }

  get scenes(): () => (string | undefined)[] {
    return () => {
      if (!this.ueProjectDetail?.scenes) return [];
      const empty: (string | undefined)[] = [undefined];
      return empty.concat(this.ueProjectDetail.scenes);
    };
  }
  get sequences(): () => (string | undefined)[] {
    return () => {
      if (!this.ueProjectDetail?.sequences) return [];
      const empty: (string | undefined)[] = [undefined];
      return empty.concat(this.ueProjectDetail.sequences);
    };
  }
  get imgSlots(): () => (string | undefined)[] {
    return () => {
      if (!this.ueProjectDetail?.imgSlots) return [];
      const empty: (string | undefined)[] = [undefined];
      return empty.concat(this.ueProjectDetail.imgSlots);
    };
  }

  updateSpeakerItem(
    element: HTMLSelectElement,
    prop: string,
    clear?: string[]
  ): void {
    let selection = element.options[element.selectedIndex].value;
    console.log(`Select ${prop}: `, selection);
    let speakerItem = this.speaker;
    if (!speakerItem) return;
    const config = speakerItem.config;
    Reflect.set(config, prop, selection);
    if (clear) {
      for (const clearProp of clear) {
        Reflect.set(config, clearProp, undefined);
      }
    }
    SequenceTools.updateSpeakerItem(speakerItem);
  }

  refresh(): void {
    console.log("refresh");
    UnrealProjectTools.loadProjects();
    if (this.ueProjectDetail)
      UnrealProjectTools.loadProjectDetails(this.ueProjectDetail.dir);
  }
}
</script>

<style scoped lang="scss">
.controls {
  margin: 12px 8px;
  .labelled {
    padding-bottom: 4px;
    .label {
      text-transform: uppercase;
      font-weight: bold;
    }
  }
}
</style>
