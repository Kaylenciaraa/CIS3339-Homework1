
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiRequest } from '../services/api'

export const useCourseStore = defineStore('courses', () => {

    const courses = ref([])
    const loading = ref(false)
    const error = ref('')
    const success = ref('')

    function clearMessages() {
        error.value = ''
        success.value = ''
    }

    // Retrieve all courses
    async function fetchCourses() {
        loading.value = true
        clearMessages()

        try {
            courses.value = await apiRequest('/courses')

        } catch (err) {
            error.value = err.message

        } finally {
            loading.value = false
        }
    }

    // Add a new course
    async function addCourse(course) {
        loading.value = true
        clearMessages()

        try {
            const result = await apiRequest(
                '/add-course',
                'POST',
                course
            )

            courses.value.push(result.course)
            success.value = result.message

            return true

        } catch (err) {
            error.value = err.message
            return false

        } finally {
            loading.value = false
        }
    }

    // Delete a course
    async function deleteCourse(courseId) {
        loading.value = true
        clearMessages()

        try {
            const result = await apiRequest(
                `/courses/${encodeURIComponent(courseId)}`,
                'DELETE'
            )

            courses.value = courses.value.filter(
                course => course.courseId !== courseId
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
        courses,
        loading,
        error,
        success,
        clearMessages,
        fetchCourses,
        addCourse,
        deleteCourse
    }
})
