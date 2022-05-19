<template>
  <div class="icon-button">
    <Icon class="icon" :icon="icon" />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: {
    icon: String,
  },
})
export default class IconButton extends Vue {
  icon = "";
}
</script>

<style scoped lang="scss">
.icon-button {
  position: relative;
  margin: 1px 5px;
  background: rgba($color: white, $alpha: 0.2);
  border-radius: 10000px;
  width: 20px;
  height: 20px;

  .icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &:hover {
    background: rgba($color: white, $alpha: 0.5);
    transform: scale(1.1);
  }
}
</style>
