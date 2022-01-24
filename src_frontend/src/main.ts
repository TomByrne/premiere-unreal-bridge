import { createApp } from "vue";
import App from "./App.vue";
import { getDevMode } from "./logic/PluginTools";
import plugin from "./model/plugin";

getDevMode()
  .then((res: boolean) => {
    plugin.devMode.value = res;
  })
  .catch((e) => {
    console.warn("Failed to establish dev mode: ", e);
  });

createApp(App).mount("#app");

onLoaded();
