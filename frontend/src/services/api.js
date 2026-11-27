
const API_URL = '/api'

export async function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    }

    if (data !== null) {
        options.body = JSON.stringify(data)
    }

    const response = await fetch(`${API_URL}${endpoint}`, options)
    const result = await response.json()

    if (!response.ok) {
        throw new Error(result.error || 'Something went wrong')
    }

    return result
}


