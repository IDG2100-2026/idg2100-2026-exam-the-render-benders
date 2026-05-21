import { API_BASE_URL } from "@/utils/constants";

export async function apiCall(endpoint, options = {}) {
    const {
        method = 'GET',
        body = null,
        userType = 'anonymous',
        userId = null,
        ...fetchOptions
    } = options;

    const headers = {
        'Content-Type': 'application/json',
        'X-User-Type': userType,
        ...fetchOptions.headers
    };

    if (userId){
        headers['X-User-Id'] = userId;
    }

    const config = {
        method,
        headers,
        ...fetchOptions
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        const errorData = await response.json();
        const error= new Error(errorData.message || `HTTP ${response.status}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
    }

    return response.json();
}