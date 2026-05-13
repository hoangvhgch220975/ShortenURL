<template>
  <div class="app-container">
    <!-- Show NavBar only if not on login or register page -->
    <NavBar v-if="!isAuthPage" />

    <!-- Main content area, changes based on route -->
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import NavBar from './components/NavBar.vue';

  
  // Get the current route
  const route = useRoute();

  // Check if the current route is login or register
  const isAuthPage = computed(() => route.path === '/login' || route.path === '/register');
</script>

<style scoped>
  /* Container to hold the content and nav */
  .app-container {
    display: relative;
    flex-direction: column;
    align-items: center;
    min-height: 100%;
    color: white;
    padding-top: 80px; /* To prevent NavBar from covering content */
  }

  .content {
    width: 100%;
    /* Add any necessary styling to your content */
  }
</style>
