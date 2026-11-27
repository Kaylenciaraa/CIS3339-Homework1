
<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
</script>

<template>
    <NavBar />

    <main class="main-container">
        <RouterView />
    </main>

    <footer class="footer">
        <p>Student Management System | CIS 3339</p>
    </footer>
</template>
