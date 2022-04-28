<template>
  <img
    class="settings-icon"
    src="@/assets/icons_settings.svg"
    :class="{ open }"
    @click="toggleOpen"
  />
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import model from "@/model";

export default class SettingsButton extends Vue {
  get open(): boolean {
    return model.settings.panel_shown;
  }
  toggleOpen() {
    console.log("toggleOpen: ", model.settings.panel_shown);
    model.settings.panel_shown = !model.settings.panel_shown;
  }
}
</script>

<style scoped lang="scss">
.settings-icon {
  transition: transform 0.25s ease, opacity 0.6s ease;
  width: 20px;
  opacity: 0.5;

  &.open {
    transform: rotate(20deg);
    opacity: 1;
  }
}
</style>
