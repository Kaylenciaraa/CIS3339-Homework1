
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiRequest } from '../services/api'

export const useStudentStore = defineStore('students', () => {

    const students = ref([])
    const loading = ref(false)
    const error = ref('')
    const success = ref('')

    function clearMessages() {
        error.value = ''
        success.value = ''
    }

    // Retrieve all students
    async function fetchStudents() {
        loading.value = true
        clearMessages()

        try {
            students.value = await apiRequest('/students')
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    // Add a student
    async function addStudent(student) {
        loading.value = true
        clearMessages()

        try {
            const result = await apiRequest(
                '/add-student',
                'POST',
                student
            )

            students.value.push(result.student)
            success.value = result.message

            return true

        } catch (err) {
            error.value = err.message
            return false

        } finally {
            loading.value = false
        }
    }

    // Delete a student
    async function deleteStudent(id) {
        loading.value = true
        clearMessages()

        try {
            const result = await apiRequest(
                '/delete-student',
                'POST',
                { id }
            )

            students.value = students.value.filter(
                student => student.id !== id
            )

            success.value = result.message

            return true

        } catch (err) {
            error.value = err.message
            return false

        } finally {
            loading.value = false
        }
    }

    return {
        students,
        loading,
        error,
        success,
        clearMessages,
        fetchStudents,
        addStudent,
        deleteStudent
    }
})
