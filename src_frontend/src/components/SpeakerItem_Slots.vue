<template>
  <div
    class="speaker-row"
    :class="{
      'needs-action': needsSlotRender,
      minimised: minimised,
      hidden: hidden,
    }"
  >
    <div class="header" @click="open = !open">
      <span class="label-sup">Speaker:</span>
      <div class="label" v-if="!slotRenderable">
        Select slot to render speaker
      </div>
      <div class="label" v-else-if="slotRendering">
        Rendering speaker to Unreal...
      </div>
      <div class="label" v-else-if="slotFilling">
        Filling in start frames...
      </div>
      <div class="label" v-else>Render speaker to Unreal</div>

      <span class="buttons">
        <button
          class="small"
          v-if="slotRenderable && !slotRendering && !slotFilling"
          @click="renderSlot()"
        >
          {{ needsSlotRender ? "Export Speaker" : "Re-export Speaker" }}
        </button>
      </span>
    </div>

    <Progress
      :state="progressState"
      :minimised="minimised || hidden || !open"
      :total="slotRender ? slotRender.start + slotRender.duration : 0"
      :value="slotRender ? slotRender.renderDone + slotRender.fillerDone : 0"
      :label="slotRender ? slotRender.state : null"
    />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import model from "@/model";
import { SlotRender, SlotRenderState, SpeakerItem } from "@/model/sequence";
import { UnrealProjectDetail } from "@/UnrealProject";
import ImageSlotTools from "@/logic/ImageSlotTools";
import Progress from "./Progress.vue";

@Options({
  props: {
    speaker: null,
    minimised: Boolean,
    hidden: Boolean,
  },
  components: {
    Progress,
  },
})
export default class SpeakerItem_Slots extends Vue {
  speaker: SpeakerItem | undefined;
  isMounted = false;
  needsSlotRender = false;
  open = false;

  get progressState():string {
    if(!this.slotRender) {
      return "inactive";
    }else{
      switch(this.slotRender.state) {
        case SlotRenderState.Rendering: return "active";
        case SlotRenderState.Filling: return "active-alt";
        case SlotRenderState.Complete: return "complete";
        case SlotRenderState.Failed: return "error";
      }
    }
  }

  get ueProjectDetail(): UnrealProjectDetail | undefined {
    const dir = this.speaker?.config.project;
    return dir ? model.unreal.findProjectDetails(dir) : undefined;
  }
  get hasSlots(): boolean {
    const slots = this.ueProjectDetail?.imgSlots;
    return slots ? slots.length > 0 : false;
  }

  mounted(): void {
    this.isMounted = true;
    this.checkNeedsSlotRender();
  }
  unmounted(): void {
    this.isMounted = false;
  }
  checkNeedsSlotRender(): void {
    if (!this.speaker) return;
    if (!this.hasSlots) {
      this.checkNeedsSlotRenderLater();
      return;
    }
    this.needsSlotRender = ImageSlotTools.needsSlotRender(this.speaker.id);
    this.checkNeedsSlotRenderLater();
  }
  checkNeedsSlotRenderLater(): void {
    if (!this.isMounted) return;
    setTimeout(() => this.checkNeedsSlotRender(), 5000);
  }

  get slotRenderable(): boolean {
    return !!this.speaker?.config.img_slot;
  }
  get slotRender(): SlotRender | undefined {
    return this.speaker?.slots[this.speaker.id];
  }
  get slotRendering(): boolean {
    return this.slotRender?.state == SlotRenderState.Rendering;
  }
  get slotFilling(): boolean {
    return this.slotRender?.state == SlotRenderState.Filling;
  }
  get slotRenderPercent(): number {
    const slotRender = this.slotRender;
    return slotRender ? (slotRender.renderDone / slotRender.duration) * 100 : 0;
  }
  get slotFillerPercent(): number {
    const slotRender = this.slotRender;
    return slotRender ? (slotRender.fillerDone / slotRender.start) * 100 : 0;
  }

  renderSlot(): void {
    if (this.speaker) ImageSlotTools.exportSpeakerItem(this.speaker.id);
  }
}
</script>

<style scoped lang="scss">
</style>
