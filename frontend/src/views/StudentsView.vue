
<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useStudentStore } from '../stores/studentStore'
import StatusMessage from '../components/StatusMessage.vue'

const studentStore = useStudentStore()

const searchQuery = ref('')

const form = reactive({
    name: '',
    id: '',
    phone: '',
    zip: ''
})

// Filter students based on the search input
const filteredStudents = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()

    return studentStore.students.filter(student =>
        student.name.toLowerCase().includes(query) ||
        student.id.toLowerCase().includes(query)
    )
})

// Add a student
async function handleAddStudent() {
    const added = await studentStore.addStudent({
        name: form.name.trim(),
        id: form.id.trim(),
        phone: form.phone.trim(),
        zip: form.zip.trim()
    })

    if (added) {
        form.name = ''
        form.id = ''
        form.phone = ''
        form.zip = ''
        searchQuery.value = ''
    }
}

// Delete a student
async function handleDeleteStudent(student) {
    const confirmed = window.confirm(
        `Are you sure you want to delete ${student.name}? Their enrollments will also be removed.`
    )

    if (confirmed) {
        await studentStore.deleteStudent(student.id)
    }
}

// Load students when the page opens
onMounted(() => {
    studentStore.fetchStudents()
})
</script>

<template>
    <section>

        <div class="page-heading">
            <h1>Student Management</h1>
            <p>Add, search, view, and manage student records.</p>
        </div>

        <StatusMessage
            :error="studentStore.error"
            :success="studentStore.success"
            :loading="studentStore.loading"
        />

        <!-- Student summary -->
        <div class="summary-card">
            <span>Total Students</span>
            <h2>{{ studentStore.students.length }}</h2>
        </div>

        <!-- Add student form -->
        <div class="panel">

            <h2>Add a Student</h2>

            <form @submit.prevent="handleAddStudent">

                <div class="form-grid">

                    <div class="form-group">
                        <label for="student-name">
                            Student Name
                        </label>

                        <input
                            id="student-name"
                            v-model="form.name"
                            type="text"
                            placeholder="Enter student name"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label for="student-id">
                            Student ID
                        </label>

                        <input
                            id="student-id"
                            v-model="form.id"
                            type="text"
                            placeholder="Enter student ID"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label for="student-phone">
                            Phone Number
                        </label>

                        <input
                            id="student-phone"
                            v-model="form.phone"
                            type="tel"
                            placeholder="Enter phone number"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label for="student-zip">
                            ZIP Code
                        </label>

                        <input
                            id="student-zip"
                            v-model="form.zip"
                            type="text"
                            placeholder="Enter ZIP code"
                            required
                        />
                    </div>

                </div>

                <button
                    class="btn btn-primary"
                    type="submit"
                    :disabled="studentStore.loading"
                >
                    Add Student
                </button>

            </form>

        </div>

        <!-- Student records -->
        <div class="panel">

            <div class="panel-heading">
                <h2>Student Records</h2>

                <span class="record-count">
                    {{ filteredStudents.length }} records
                </span>
            </div>

            <div class="form-group">
                <label for="student-search">
                    Search Students
                </label>

                <input
                    id="student-search"
                    v-model="searchQuery"
                    type="search"
                    placeholder="Search by name or student ID"
                />
            </div>

            <p
                v-if="studentStore.loading"
                class="empty-state"
            >
                Loading student records...
            </p>

            <p
                v-else-if="studentStore.error && !studentStore.students.length"
                class="empty-state"
            >
                Unable to display student records.
            </p>

            <p
                v-else-if="filteredStudents.length === 0"
                class="empty-state"
            >
                No student records found.
            </p>

            <div v-else class="table-wrapper">

                <table>
                    <thead>
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Student ID</th>
                            <th scope="col">Phone</th>
                            <th scope="col">ZIP Code</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr
                            v-for="student in filteredStudents"
                            :key="student._id"
                        >
                            <td>{{ student.name }}</td>
                            <td>{{ student.id }}</td>
                            <td>{{ student.phone }}</td>
                            <td>{{ student.zip }}</td>

                            <td>
                                <button
                                    class="btn btn-danger"
                                    type="button"
                                    :disabled="studentStore.loading"
                                    @click="handleDeleteStudent(student)"
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

