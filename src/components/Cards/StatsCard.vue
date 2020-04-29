<template>
  <card>
    <div>
      <div class="row">
        <div class="col-4" v-if="$slots.header">
          <slot name="header"></slot>
        </div>
        <div class="col-8" v-if="$slots.content">
          <slot name="content"></slot>
        </div>
      </div>
      <div v-if="$slots.footer">
        <hr/>
        <slot name="footer"></slot>
      </div>
    </div>

  </card>
</template>
<script>
import Card from "./Card.vue";

export default {
  name: "stats-card",
  components: {
    Card
  }
};
</script>
<style>
</style>
