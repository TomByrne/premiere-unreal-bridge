<template>
  <div class="panel">
    <h1>Sequence</h1>
    <button @click="test">Clickyu</button>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import ProjectItemTools from "../logic/ProjectItemTools";

@Options({
  props: {},
})
export default class SequenceTools extends Vue {
  test(): void {
    ProjectItemTools.reimport()
      .then((res: boolean) => {
        console.log("yay: ", res);
      })
      .catch((e: Error) => {
        console.log("noo", e);
      });
  }
}
</script>

<style scoped lang="scss"></style>
