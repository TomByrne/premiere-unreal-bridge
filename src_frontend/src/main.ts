import { createApp } from "vue";
import App from "./App.vue";
import { getDevMode } from "./logic/PluginTools";
import plugin from "./model/plugin";

import { library } from '@fortawesome/fontawesome-svg-core';
import { faMousePointer } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import IconButton from "./components/IconButton.vue";

library.add(faMousePointer);

getDevMode()
  .then((res: boolean) => {
    console.log("Dev mode: " + res);
    plugin.devMode.value = res;
  })
  .catch((e) => {
    console.warn("Failed to establish dev mode: ", e);
  });

createApp(App)
  .component('Icon', FontAwesomeIcon)
  .component('IconButton', IconButton)
  .mount("#app");

onLoaded();
