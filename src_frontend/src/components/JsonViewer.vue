<template>
  <div
    class="json-viewer"
    :class="[
      'type-' + type,
      reallyOpen ? 'open' : 'closed',
      simple ? 'simple' : null
    ]"
  >
    <span class="name" v-if="hasName && !isNameIndex">"{{ name }}"</span>
    <span class="name" v-if="hasName && isNameIndex">[{{ name }}]</span>

    <span class="eq" v-if="hasName">: </span>

    <span v-if="type == 'string'" class="value">"{{ value }}"</span>
    <span v-else-if="simple" class="value">{{ value + "" }}</span>
    <span v-else-if="type == 'array'" class="value"
      ><span class="brackets">[</span
      ><span
        v-if="!simple && isOpenable && hasChildren"
        class="open-close"
        @click="toggleOpen"
      >
        {{ open ? "-" : "+" }}</span
      >
      <div class="children" v-if="reallyOpen">
        <JsonViewer
          :name="index"
          :value="child"
          v-for="(child, index) in value"
          :key="index"
          :openable="true"
        />
      </div>
      <span class="brackets">]</span></span
    >
    <span v-else-if="type == 'object'" class="value"
      ><span class="brackets">{</span
      ><span
        v-if="!simple && isOpenable && hasChildren"
        class="open-close"
        @click="toggleOpen"
      >
        {{ open ? "-" : "+" }}</span
      >
      <div class="children" v-if="reallyOpen">
        <JsonViewer
          :name="index"
          :value="child"
          v-for="(child, index) in value"
          :key="index"
          :openable="true"
        />
      </div>
      <span class="brackets">}</span></span
    >
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  name: "JsonViewer",
  props: {
    name: null,
    value: null,
    openable: Boolean
  }
})
export default class JsonViewer extends Vue {
  name?: string;
  value: unknown;

  open = false;
  openable = false;

  get isNameIndex(): boolean {
    return typeof this.name == "number";
  }

  get hasName(): boolean {
    return this.name != undefined;
  }

  get isOpenable(): boolean {
    return this.openable;
  }

  get hasChildren(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj: any = this.value;
    for (const ind in obj) return true;
    return false;
  }

  get reallyOpen(): boolean {
    return this.open || !this.isOpenable;
  }

  get type(): string {
    if (this.value === null || this.value === undefined) return "keyword";

    const type = typeof this.value;
    switch (type) {
      case "string":
      case "number":
      case "boolean":
        return type;
      case "object":
        if (this.value instanceof Array) return "array";
        else return "object";
      default:
        return "unknown";
    }
  }

  get simple(): boolean {
    if (!this.value) return true;

    const type = typeof this.value;
    switch (type) {
      case "string":
      case "number":
      case "boolean":
        return true;
      default:
        return false;
    }
  }

  toggleOpen(): void {
    this.open = !this.open;
  }
}
</script>

<style scoped lang="scss">
.json-viewer {
  padding: 2px;

  .open-close {
    background: #181818;
    padding: 0 4px 3px 4px;
    border-radius: 6px;
    margin: 3px;
    font-size: 1.2em;
    font-weight: bold;
    cursor: pointer;
  }

  .name {
    font-weight: bold;
    color: purple;
  }

  &.simple > .value {
    font-weight: bold;
    color: green;
  }

  .type-boolean .value {
    color: blue;
  }

  .type-keyword .value {
    color: blue;
  }

  .type-number .value {
    color: darkcyan;
  }

  &.open > .value {
    display: block;
  }
  .children {
    padding-left: 10px;
    > .json-viewer {
      padding-left: 10px;
    }
  }
}
</style>
