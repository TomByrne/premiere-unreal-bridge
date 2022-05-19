<template>
  <div class="overview panel">
    <Progress
      id="progress"
      class="button"
      :class="{ disabled: no_render_track }"
      :value="overview.progress"
      :total="overview.total"
      :label="label"
      :state="state"
      :minimised="!overview.total"
      :show-fraction="!no_render_track && (!!overview.progress || isRunning)"
      @click="toggleRun"
    />
  </div>
</template>

<script lang="ts">
import OverviewRunner from "@/logic/OverviewRunner";
import model from "@/model";
import { OverviewModel } from "@/model/overview";
import { Options, Vue } from "vue-class-component";
import Progress from "./Progress.vue";

@Options({
  components: {
    Progress,
  },
})
export default class OverviewPanel extends Vue {
  get overview(): OverviewModel {
    return model.overview;
  }

  get no_render_track(): boolean {
    return !model.sequence.sequenceMeta?.render_track;
  }

  get label(): string {
    if (this.no_render_track) {
      return "Not ready";
    } else if (this.isRunning) {
      return "Running...";
    } else if (this.overview.progress < this.overview.total) {
      return "Run all steps";
    } else {
      return "All Done";
    }
  }

  get state(): string {
    if (this.isRunning) {
      return "doing";
    } else if (this.overview.progress < this.overview.total) {
      return "idle";
    } else {
      return "done";
    }
  }

  get isRunning(): boolean {
    return model.overview.running_all;
  }

  toggleRun(): void {
    if (this.no_render_track) return;
    if (this.isRunning) OverviewRunner.stop();
    else OverviewRunner.run();
  }
}
</script>

<style scoped lang="scss">
.overview {
  position: absolute;
  bottom: 0;
  left: 0;
  height: fit-content;
  width: 100%;
  background-color: var(--bg);
}
</style>
