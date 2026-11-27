
<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
    <header class="navbar">
        <div class="nav-container">

            <div class="brand">
                <h2>Student Management System</h2>
                <span>CIS 3339</span>
            </div>

            <nav aria-label="Main navigation">
                <RouterLink to="/students">
                    Students
                </RouterLink>

                <RouterLink to="/courses">
                    Courses
                </RouterLink>

                <RouterLink to="/enrollments">
                    Enrollments
                </RouterLink>
            </nav>

        </div>
    </header>
</template>
