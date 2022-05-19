<template>
  <span class="folder-link" v-if="path" @click="openPath">
    <span class="icon" :title="title"/>
  </span>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import FileSystemTools from "@/logic/FileSystemTools";

@Options({
  props: {
    path: String,
    title: String,
  },
  components:{
    // Icon
  }
})
export default class FolderLink extends Vue {
  path:string | undefined;

  openPath():void {
    if(this.path)
      FileSystemTools.openFolder(this.path);
  }
}
</script>

<style scoped lang="scss">
.icon {
  margin-right: 4px;
  display:inline-block;
  -webkit-mask-size: cover;
  mask-size: cover;
  -webkit-mask-image: url(../assets/icons_folder.svg);
  mask-image: url(../assets/icons_folder.svg);
  background-color: currentColor;
  width: 14px; 
  height: 12px;
  cursor: pointer;

  &:hover {
   background-color: #fff;
  }
}
</style>
