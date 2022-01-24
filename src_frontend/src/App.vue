<template>
  <div>
    <DevLink v-if="model.plugin.devMode" />
    <SequenceTools />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import SequenceTools from "./components/SequenceTools.vue";
import DevLink from "./components/DevLink.vue";
import model from "./model";

@Options({
  components: {
    SequenceTools,
    DevLink,
  },
})
export default class App extends Vue {
  get model(): unknown {
    return model;
  }
}
</script>

<style lang="scss">
@import "./styles/style.scss";
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
