
<script setup>
import { reactive, ref, computed, onMounted } from 'vue'

import { useStudentStore } from '../stores/studentStore'
import { useCourseStore } from '../stores/courseStore'
import { useEnrollmentStore } from '../stores/enrollmentStore'

import StatusMessage from '../components/StatusMessage.vue'

const studentStore = useStudentStore()
const courseStore = useCourseStore()
const enrollmentStore = useEnrollmentStore()

const rosterCourseId = ref('')

const form = reactive({
    studentId: '',
    courseId: ''
})

// Check whether any request is processing
const isLoading = computed(() =>
    studentStore.loading ||
    courseStore.loading ||
    enrollmentStore.loading
)

// Combine error messages from the stores
const pageError = computed(() =>
    enrollmentStore.error ||
    studentStore.error ||
    courseStore.error
)

// Enroll a student
async function handleAddEnrollment() {

    const added = await enrollmentStore.addEnrollment({
        studentId: form.studentId,
        courseId: form.courseId
    })

    if (added) {
        const enrolledCourseId = form.courseId
        const successMessage = enrollmentStore.success

        form.studentId = ''
        form.courseId = ''

        await enrollmentStore.fetchEnrollments()

        rosterCourseId.value = enrolledCourseId

        await enrollmentStore.fetchCourseRoster(
            enrolledCourseId
        )

        enrollmentStore.success = successMessage
    }
}

// Display the selected course roster
async function handleViewRoster() {
    enrollmentStore.clearMessages()

    if (!rosterCourseId.value) {
        enrollmentStore.clearRoster()
        return
    }

    await enrollmentStore.fetchCourseRoster(
        rosterCourseId.value
    )
}

// Load data when the page opens
onMounted(async () => {

    enrollmentStore.clearRoster()

    await Promise.all([
        studentStore.fetchStudents(),
        courseStore.fetchCourses(),
        enrollmentStore.fetchEnrollments()
    ])
})
</script>

<template>
    <section>

        <div class="page-heading">
            <h1>Enrollment Management</h1>

            <p>
                Enroll students in courses and view course rosters.
            </p>
        </div>

        <StatusMessage
            :error="pageError"
            :success="enrollmentStore.success"
            :loading="isLoading"
        />

        <!-- Enrollment summary -->

        <div class="summary-grid">

            <div class="summary-card">
                <span>Total Students</span>
                <h2>{{ studentStore.students.length }}</h2>
            </div>

            <div class="summary-card">
                <span>Total Courses</span>
                <h2>{{ courseStore.courses.length }}</h2>
            </div>

            <div class="summary-card">
                <span>Total Enrollments</span>
                <h2>{{ enrollmentStore.enrollments.length }}</h2>
            </div>

        </div>

        <!-- Enrollment form -->

        <div class="panel">

            <h2>Enroll a Student</h2>

            <p
                v-if="!isLoading &&
                (!studentStore.students.length ||
                 !courseStore.courses.length)"
                class="empty-state"
            >
                At least one student and one course must exist
                before creating an enrollment.
            </p>

            <form @submit.prevent="handleAddEnrollment">

                <div class="form-grid">

                    <div class="form-group">

                        <label for="enrollment-student">
                            Select Student
                        </label>

                        <select
                            id="enrollment-student"
                            v-model="form.studentId"
                            :disabled="isLoading"
                            required
                        >
                            <option disabled value="">
                                Choose a student
                            </option>

                            <option
                                v-for="student in studentStore.students"
                                :key="student._id"
                                :value="student.id"
                            >
                                {{ student.name }} ({{ student.id }})
                            </option>

                        </select>

                    </div>

                    <div class="form-group">

                        <label for="enrollment-course">
                            Select Course
                        </label>

                        <select
                            id="enrollment-course"
                            v-model="form.courseId"
                            :disabled="isLoading"
                            required
                        >
                            <option disabled value="">
                                Choose a course
                            </option>

                            <option
                                v-for="course in courseStore.courses"
                                :key="course._id"
                                :value="course.courseId"
                            >
                                {{ course.courseId }} -
                                {{ course.courseName }}
                            </option>

                        </select>

                    </div>

                </div>

                <button
                    class="btn btn-primary"
                    type="submit"
                    :disabled="isLoading ||
                        !studentStore.students.length ||
                        !courseStore.courses.length"
                >
                    Enroll Student
                </button>

            </form>

        </div>

        <!-- Course roster -->

        <div class="panel">

            <h2>Course Roster</h2>

            <div class="form-group">

                <label for="roster-course">
                    Select a Course to View Students
                </label>

                <select
                    id="roster-course"
                    v-model="rosterCourseId"
                    :disabled="isLoading"
                    @change="handleViewRoster"
                >
                    <option value="">
                        Choose a course
                    </option>

                    <option
                        v-for="course in courseStore.courses"
                        :key="course._id"
                        :value="course.courseId"
                    >
                        {{ course.courseId }} -
                        {{ course.courseName }}
                    </option>

                </select>

            </div>

            <p v-if="isLoading" class="empty-state">
                Loading course information...
            </p>

            <p
                v-else-if="!rosterCourseId"
                class="empty-state"
            >
                Select a course to view its enrolled students.
            </p>

            <p
                v-else-if="!enrollmentStore.selectedCourse"
                class="empty-state"
            >
                Unable to load the selected course roster.
            </p>

            <template v-else>

                <div class="panel-heading">

                    <h3>
                        {{ enrollmentStore.selectedCourse.courseId }}
                        -
                        {{ enrollmentStore.selectedCourse.courseName }}
                    </h3>

                    <span class="record-count">
                        {{ enrollmentStore.roster.length }}
                        enrolled
                    </span>

                </div>

                <p
                    v-if="enrollmentStore.roster.length === 0"
                    class="empty-state"
                >
                    No students are enrolled in this course.
                </p>

                <div v-else class="table-wrapper">

                    <table>

                        <thead>
                            <tr>
                                <th scope="col">Name</th>
                                <th scope="col">Student ID</th>
                                <th scope="col">Phone</th>
                                <th scope="col">ZIP Code</th>
                            </tr>
                        </thead>

                        <tbody>

                            <tr
                                v-for="student in enrollmentStore.roster"
                                :key="student._id"
                            >
                                <td>{{ student.name }}</td>
                                <td>{{ student.id }}</td>
                                <td>{{ student.phone }}</td>
                                <td>{{ student.zip }}</td>
                            </tr>

                        </tbody>

                    </table>

                </div>

            </template>

        </div>

    </section>
</template>

