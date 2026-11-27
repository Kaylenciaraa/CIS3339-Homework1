
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiRequest } from '../services/api'

export const useEnrollmentStore = defineStore('enrollments', () => {

    const enrollments = ref([])
    const roster = ref([])
    const selectedCourse = ref(null)

    const loading = ref(false)
    const error = ref('')
    const success = ref('')

    function clearMessages() {
        error.value = ''
        success.value = ''
    }

    // Retrieve all enrollments
    async function fetchEnrollments() {
        loading.value = true
        clearMessages()

        try {
            enrollments.value = await apiRequest('/enrollments')

        } catch (err) {
            error.value = err.message

        } finally {
            loading.value = false
        }
    }

    // Enroll a student in a course
    async function addEnrollment(enrollment) {
        loading.value = true
        clearMessages()

        try {
            const result = await apiRequest(
                '/add-enrollment',
                'POST',
                enrollment
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

    // Retrieve students enrolled in a course
    async function fetchCourseRoster(courseId) {
        loading.value = true
        error.value = ''

        roster.value = []
        selectedCourse.value = null

        try {
            const result = await apiRequest(
                `/courses/${encodeURIComponent(courseId)}/students`
            )

            roster.value = result.students
            selectedCourse.value = result.course

        } catch (err) {
            error.value = err.message

        } finally {
            loading.value = false
        }
    }

    function clearRoster() {
        roster.value = []
        selectedCourse.value = null
    }

    return {
        enrollments,
        roster,
        selectedCourse,
        loading,
        error,
        success,
        clearMessages,
        fetchEnrollments,
        addEnrollment,
        fetchCourseRoster,
        clearRoster
    }
})
