
<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useCourseStore } from '../stores/courseStore'
import StatusMessage from '../components/StatusMessage.vue'

const courseStore = useCourseStore()

const searchQuery = ref('')

const form = reactive({
    courseId: '',
    courseName: ''
})

// Filter courses using the search input
const filteredCourses = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()

    return courseStore.courses.filter(course =>
        course.courseId.toLowerCase().includes(query) ||
        course.courseName.toLowerCase().includes(query)
    )
})

// Add a course
async function handleAddCourse() {
    const added = await courseStore.addCourse({
        courseId: form.courseId.trim(),
        courseName: form.courseName.trim()
    })

    if (added) {
        form.courseId = ''
        form.courseName = ''
        searchQuery.value = ''
    }
}

// Delete a course
async function handleDeleteCourse(course) {
    const confirmed = window.confirm(
        `Are you sure you want to delete ${course.courseId}? All associated enrollments will also be removed.`
    )

    if (confirmed) {
        await courseStore.deleteCourse(course.courseId)
    }
}

// Load courses when the page opens
onMounted(() => {
    courseStore.fetchCourses()
})
</script>

<template>
    <section>

        <div class="page-heading">
            <h1>Course Management</h1>
            <p>Add, view, and manage available courses.</p>
        </div>

        <StatusMessage
            :error="courseStore.error"
            :success="courseStore.success"
            :loading="courseStore.loading"
        />

        <!-- Course summary -->
        <div class="summary-card">
            <span>Total Courses</span>
            <h2>{{ courseStore.courses.length }}</h2>
        </div>

        <!-- Add course form -->
        <div class="panel">

            <h2>Add a Course</h2>

            <form @submit.prevent="handleAddCourse">

                <div class="form-grid">

                    <div class="form-group">
                        <label for="course-id">
                            Course ID
                        </label>

                        <input
                            id="course-id"
                            v-model="form.courseId"
                            type="text"
                            placeholder="Enter course ID"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label for="course-name">
                            Course Name
                        </label>

                        <input
                            id="course-name"
                            v-model="form.courseName"
                            type="text"
                            placeholder="Enter course name"
                            required
                        />
                    </div>

                </div>

                <button
                    class="btn btn-primary"
                    type="submit"
                    :disabled="courseStore.loading"
                >
                    Add Course
                </button>

            </form>

        </div>

        <!-- Course records -->
        <div class="panel">

            <div class="panel-heading">

                <h2>Course Records</h2>

                <span class="record-count">
                    {{ filteredCourses.length }} records
                </span>

            </div>

            <div class="form-group">

                <label for="course-search">
                    Search Courses
                </label>

                <input
                    id="course-search"
                    v-model="searchQuery"
                    type="search"
                    placeholder="Search by course ID or course name"
                />

            </div>

            <p
                v-if="courseStore.loading"
                class="empty-state"
            >
                Loading course records...
            </p>

            <p
                v-else-if="courseStore.error && !courseStore.courses.length"
                class="empty-state"
            >
                Unable to display course records.
            </p>

            <p
                v-else-if="filteredCourses.length === 0"
                class="empty-state"
            >
                No course records found.
            </p>

            <div v-else class="table-wrapper">

                <table>

                    <thead>
                        <tr>
                            <th scope="col">Course ID</th>
                            <th scope="col">Course Name</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>

                    <tbody>

                        <tr
                            v-for="course in filteredCourses"
                            :key="course._id"
                        >
                            <td>{{ course.courseId }}</td>
                            <td>{{ course.courseName }}</td>

                            <td>
                                <button
                                    class="btn btn-danger"
                                    type="button"
                                    :disabled="courseStore.loading"
                                    @click="handleDeleteCourse(course)"
                                >
                                    Delete
                                </button>
                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </div>

    </section>
</template>

