<template>
  <div
    class="speaker-item"
    :class="{ selected: selected, unselected: !selected }"
    @click="select()"
  >
    <div class="labelled info-row">
      <div class="label">{{ track.name }}</div>
      <div class="info">
        {{ track.start.toFixed(2) }}s to {{ track.end.toFixed(2) }}s
      </div>
      <div class="buttons">
        <button v-if="!speaker" @click="link()">Enable</button>
        <button v-else @click="removing = true">Remove</button>
      </div>
    </div>
    <div class="removing" v-if="removing">
      <div class="cont">
        <div class="msg">Are you sure you want to remove this item?</div>
        <div class="buttons value">
          <button @click="unlink()">Remove</button>
          <button @click="removing = false">Cancel</button>
        </div>
      </div>
    </div>
    <div class="speaker-rows" v-if="speaker">
      <config :speaker="speaker" :minimised="!selected" />
      <slots :speaker="speaker" :minimised="!selected" v-if="!needsConfig && hasSlots" />
      <render :speaker="speaker" :minimised="!selected" :track="track" v-if="!needsConfig" />
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
  },
})
export default class SpeakerItemView extends Vue {
  id = "";
  selected = false;
  speaker: SpeakerItem | undefined;
  track: TrackItemInfo | undefined;
  removing = false;

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
    background: rgba(0,0,0,0.25);

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
