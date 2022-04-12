<template>
  <div
    class="speaker-row header"
    :class="{
      'needs-action': needsSlotRender,
      minimised: minimised,
      hidden: hidden,
    }"
  >
    <div
      class="progress"
      v-if="slotRender"
      :style="{ width: slotRenderPercent + '%' }"
      :class="slotRender?.state"
    />
    <span class="label-sup">Speaker:</span>
    <div class="label" v-if="!slotRenderable">
      Select slot to render speaker
    </div>
    <div class="label" v-else-if="slotRendering">
      Rendering speaker to Unreal...
    </div>
    <div class="label" v-else-if="slotFilling">Filling in start frames...</div>
    <div class="label" v-else>Render speaker to Unreal</div>

    <div class="info" v-if="slotRendering">
      {{ slotRender.renderDone }} / {{ slotRender.duration }} ({{
        Math.round(slotRenderPercent)
      }}%)
    </div>
    <div class="info" v-else-if="slotFilling">
      {{ slotRender.fillerDone }} / {{ slotRender.start }} ({{
        Math.round(slotFillerPercent)
      }}%)
    </div>
    <div class="info" v-else-if="slotRender">{{ slotRender.state }}</div>

    <span class="buttons">
      <button
        class="small"
        v-if="slotRenderable && !slotRendering"
        @click="renderSlot()"
      >
        {{ needsSlotRender ? "Export Speaker" : "Re-export Speaker" }}
      </button>
    </span>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import model from "@/model";
import { SlotRender, SlotRenderState, SpeakerItem } from "@/model/sequence";
import { UnrealProjectDetail } from "@/UnrealProject";
import ImageSlotTools from "@/logic/ImageSlotTools";

@Options({
  props: {
    speaker: null,
    minimised: Boolean,
    hidden: Boolean,
  },
})
export default class SpeakerItem_Slots extends Vue {
  speaker: SpeakerItem | undefined;
  isMounted = false;
  needsSlotRender = false;

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
    ImageSlotTools.needsSlotRender(this.speaker.id).then((value: boolean) => {
      this.needsSlotRender = value;
      this.checkNeedsSlotRenderLater();
    });
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
    if (this.speaker)ImageSlotTools.exportSpeakerItem(this.speaker.id);
  }
}
</script>

<style scoped lang="scss">
</style>
