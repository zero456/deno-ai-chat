<script setup lang="ts">
import Header from "~/components/Header.vue";

</script>

<template>
  <div class="flex flex-col h-full">
    <Header/>
    <slot/>
  </div>
</template>