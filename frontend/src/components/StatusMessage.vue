
<script setup>
defineProps({
    error: {
        type: String,
        default: ''
    },
    success: {
        type: String,
        default: ''
    },
    loading: {
        type: Boolean,
        default: false
    }
})
</script>

<template>
    <div class="status-messages">

        <div
            v-if="error"
            class="alert alert-error"
            role="alert"
        >
            {{ error }}
        </div>

        <div
            v-if="success"
            class="alert alert-success"
            role="status"
        >
            {{ success }}
        </div>

        <div
            v-if="loading"
            class="alert alert-loading"
            role="status"
        >
            Processing your request...
        </div>

    </div>
</template>
