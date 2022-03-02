import { ref, Ref } from "vue";

export const loadingProjectDetails: Ref<boolean> = ref(false);

export const searchProjFolders: Ref<string[]> = ref(["AWS"]);

export default {
  loadingProjectDetails,
  searchProjFolders,
};
