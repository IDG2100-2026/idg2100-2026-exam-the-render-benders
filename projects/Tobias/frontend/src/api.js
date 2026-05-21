// Getting the API connection details from the .env
const {
    VITE_API_HOSTNAME,
    VITE_API_PORT,
    VITE_API_PROTOCOL,
    VITE_API_VERSION
} = import.meta.env;

// base URL for all the API calls (example: http://localhost:3000/api/v1)
export const API_URL = `${VITE_API_PROTOCOL}://${VITE_API_HOSTNAME}:${VITE_API_PORT}/api/${VITE_API_VERSION}`;

// reusable fetch function used by all services
export async function apiFetch(endpoint, options = {}) {
    // ?. retruns undefined if options.headers does not exist instead of crash
    // || {} uses empty object as a fallback if it is undefined
    const headers = { ...(options?.headers || {}), "Content-Type": "application/json" };
    const resp = await fetch(API_URL + endpoint, {
        ...options, // spreading all options (for example method and body) into the fetch config
        headers // adding the headers that I built above
    });

    const result = await resp.json();

    // throwing a new error if the response is not ok
    if (!resp.ok) {
        throw new Error(result?.msg || "An error occured while fetching data");
    }

    return result;
}
