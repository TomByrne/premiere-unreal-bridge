<template>
  <div
    class="speaker-item"
    :class="{
      selected: selected,
      unselected: !selected,
    }"
    @click="select()"
  >
    <div class="labelled info-row">
      <div class="label">{{ track.name }}</div>
      <div class="info">
        {{ track.start.toFixed(2) }}s to {{ track.end.toFixed(2) }}s
      </div>
      <div class="buttons">
        <button class="small" v-if="!speaker" @click="link()">Enable</button>
        <button class="small" v-else @click="removing = true">Remove</button>
      </div>
    </div>
    <div class="removing" v-if="removing">
      <div class="cont">
        <div class="msg">Are you sure you want to remove this item?</div>
        <div class="buttons value">
          <button class="small" @click="unlink()">Remove</button>
          <button class="small" @click="removing = false">Cancel</button> 
        </div>
      </div>
    </div>
    <div class="speaker-rows" v-if="speaker">
      <config 
        :class="{'next-step':nextStepConfig}"
        :speaker="speaker"
        :minimised="!selected"
      />
      <slots
        :class="{'next-step':nextStepSlots}"
        :speaker="speaker"
        :minimised="!selected"
        :hidden="needsConfig || !hasSlots"
        v-if="!needsConfig && hasSlots"
      />
      <render
        :class="{'next-step':nextStepRender}"
        :speaker="speaker"
        :minimised="!selected"
        :track="track"
        :hidden="needsConfig"
        v-if="!needsConfig"
      />
      <import
        :class="{'next-step':nextStepImport}"
        :speaker="speaker"
        :minimised="!selected"
        :hidden="needsConfig"
        v-if="!needsConfig"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import model from "@/model";
import { TrackItemInfo, SpeakerItem } from "@/model/sequence";
import SequenceTools from "@/logic/SequenceTools";
import { UnrealProjectDetail } from "@/UnrealProject";
import SpeakerItem_Config from "./SpeakerItem_Config.vue";
import SpeakerItem_Slots from "./SpeakerItem_Slots.vue";
import SpeakerItem_Render from "./SpeakerItem_Render.vue";
import SpeakerItem_Import from "./SpeakerItem_Import.vue";
import { SpeakerItemOverview, SpeakerItemStep } from "@/model/overview";

@Options({
  props: {
    id: String,
    speaker: null,
    track: null,
    selected: Boolean,
  },
  components: {
    config: SpeakerItem_Config,
    slots: SpeakerItem_Slots,
    render: SpeakerItem_Render,
    import: SpeakerItem_Import,
  },
})
export default class SpeakerItemView extends Vue {
  id = "";
  selected = false;
  speaker: SpeakerItem | undefined;
  track: TrackItemInfo | undefined;
  removing = false;

  get overview(): SpeakerItemOverview | undefined {
    return this.speaker ? model.overview.items[this.speaker.id] : undefined;
  }
  get nextStep(): SpeakerItemStep | undefined {
    return this.overview?.nextStep;
  }
  get nextStepConfig(): boolean {
    return !!this.overview?.needsConfig;
  }
  get nextStepSlots(): boolean {
    return this.nextStep === SpeakerItemStep.SLOTS;
  }
  get nextStepRender(): boolean {
    return this.nextStep === SpeakerItemStep.RENDER;
  }
  get nextStepImport(): boolean {
    return this.nextStep === SpeakerItemStep.IMPORT;
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

  get ueProjectDetail(): UnrealProjectDetail | undefined {
    const dir = this.speaker?.config.project;
    return dir ? model.unreal.findProjectDetails(dir) : undefined;
  }

  get hasSlots(): boolean {
    const slots = this.ueProjectDetail?.imgSlots;
    return slots ? slots.length > 0 : false;
  }

  select(): void {
    SequenceTools.selectTrackItem(this.id);
  }

  unlink(): void {
    SequenceTools.removeSpeakerItem(this.id);
    this.removing = false;
  }

  link(): void {
    SequenceTools.addSpeakerItem(this.id);
  }
}
</script>

<style scoped lang="scss">
.removing {
  position: absolute;
  margin: 0;
  padding: 20px;
  width: 100%;
  height: 100%;
  font-weight: bold;
  z-index: 100;
  text-align: center;
  background: rgba(0, 0, 0, 0.25);

  .cont {
    background: orange;
    border-radius: 6px;
    padding: 20px;

    .msg {
      color: black;
      padding-bottom: 16px;
    }
  }
}
</style>
