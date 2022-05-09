<template>
  <span class="open-chevron">
    <span class="icon" :class="{ closed: !open, open: open }" />
  </span>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: {
    open: Boolean,
  },
  components: {
    // Icon
  },
})
export default class OpenChevron extends Vue {
  open = false;
}
</script>

<style scoped lang="scss">
.icon {
  margin-right: 4px;
  display: inline-block;
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-image: url(../assets/icons_chevron.svg);
  mask-image: url(../assets/icons_chevron.svg);
  background-color: currentColor;
  width: 8px;
  height: 12px;
  cursor: pointer;

  &:hover {
    background-color: #fff;
  }

  &.closed {
    transform: rotate(-90deg);
  }
}
</style>
