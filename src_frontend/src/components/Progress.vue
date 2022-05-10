<template>
  <div
    class="progress"
    :class="{ [state]: true, minimised, hidden, complete: value >= total }"
  >
    <div class="track">
      <div class="fill" :style="{ width: (value / total) * 100 + '%' }" />
    </div>
    <div class="text">
      <span class="label">{{ label }}</span>
      <span class="fraction" v-if="showFraction && total && value != null">{{ value }}/{{ total }}</span>
      <span class="percent" v-if="showPercent">
        {{ Math.round((value / total) * 100) + "%" }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: {
    value: Number,
    total: Number,
    label: String,
    state: String,
    showPercent: Boolean,
    minimised: Boolean,
    hidden: Boolean,
  },
})
export default class Progress extends Vue {
  showPercent = true;
  showFraction = true;
  minimised = false;
  hidden = false;
  state = "complete";
}
</script>

<style scoped lang="scss">
.progress {
  height: 24px;
  position: relative;
  text-align: center;
  overflow: hidden;
  background: rgba($color: #000, $alpha: 0.4);

  > * {
    position: absolute;
  }

  .track {
    border-radius: 4px;
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 2px;

    .fill {
      position: absolute;
      height: 100%;
      border-radius: 4px;
      background: rgb(151, 181, 234);
      transition: width 0.1s ease, color 0.2s ease;
    }
  }

  .text {
    background: rgba($color: #333, $alpha: 0.8);
    border-radius: 3px;
    height: unset;
    width: unset;
    transform: translate(-50%, -50%);
    top: 50%;
    left: 50%;
    padding: 0 6px;
    transition: opacity 0.2s ease;

    .label {
      font-weight: bold;
      text-transform: uppercase;
    }
  }

  &.minimised {
    height: 3px;
    .text {
      opacity: 0;
    }
    .track {
      border-radius: 0;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;

      .fill {
        border-radius: 0;
      }
    }
  }

  &.complete,
  &.done {
    .fill {
      background: rgb(11, 55, 129);
    }
  }

  &.warn .fill {
    background: rgb(189, 203, 32);
  }

  &.active-alt .fill {
    background: rgb(21, 137, 73);
  }

  &.error .fill,
  &.failed .fill {
    background: rgb(129, 11, 11);
  }

  &.inactive .fill,
  &.inactive > .track {
    background: rgb(77, 77, 77);
  }
}
</style>
