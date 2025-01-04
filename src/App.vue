<script lang="ts" setup>
import {RouterView} from 'vue-router'
import Router from "@/components/Router.vue";
</script>

<template>
  <router v-if="!$route.meta.hideFooter"/>
  <RouterView/>
</template>

<style scoped>

</style>
