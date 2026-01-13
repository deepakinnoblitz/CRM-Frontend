/**
 * CSRF Token Management Utility
 * 
 * This module handles CSRF token retrieval and management for Frappe API calls.
 * CSRF tokens are required for all POST, PUT, DELETE requests to prevent
 * Cross-Site Request Forgery attacks.
 */

/**
 * Handle CSRF error by logging out user
 */
async function handleCSRFError(): Promise<void> {
    console.error('CSRF Token Error detected - logging out user');

    // Clear local storage
    localStorage.clear();

    try {
        // Call logout API endpoint
        await fetch('/api/method/logout', {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Error during logout:', error);
    }

    // Redirect to login page
    window.location.href = '/login';
}

/**
 * Check if error response contains CSRF error
 */
function isCSRFError(json: any): boolean {
    if (!json) return false;

    const errorMessage = json.exception || json.message || '';
    return errorMessage.includes('CSRFTokenError') ||
        errorMessage.includes('Invalid Request') ||
        json.exc_type === 'CSRFTokenError';
}

/**
 * Get CSRF token from cookies
 * Frappe stores the CSRF token in a cookie named 'csrf_token'
 */
export function getCSRFTokenFromCookie(): string | null {
    const name = 'csrf_token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for (let i = 0; i < cookieArray.length; i++) {
        const cookie = cookieArray[i].trim();
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return null;
}

/**
 * Fetch a fresh CSRF token from Frappe
 * This makes a request to get the current logged-in user, which returns
 * a fresh CSRF token in the response headers
 */
export async function fetchCSRFToken(): Promise<string | null> {
    try {
        const response = await fetch('/api/method/frappe.auth.get_logged_user', {
            credentials: 'include'
        });

        if (!response.ok) {
            console.error('Failed to fetch CSRF token');
            return null;
        }

        // Try to get token from response header
        const headerToken = response.headers.get('X-Frappe-CSRF-Token');
        if (headerToken) {
            return headerToken;
        }

        // Fallback to cookie
        return getCSRFTokenFromCookie();
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
        return null;
    }
}

/**
 * Get CSRF token - tries cookie first, then fetches if needed
 * This is the main function to use when making API calls
 */
export async function getCSRFToken(): Promise<string> {
    // First try to get from cookie (fastest)
    let token = getCSRFTokenFromCookie();

    // If not in cookie, fetch a fresh one
    if (!token) {
        token = await fetchCSRFToken();
    }

    return token || '';
}

/**
 * Create headers object with CSRF token included
 * Use this helper to ensure all your requests have the proper headers
 */
export async function getAuthHeaders(additionalHeaders: Record<string, string> = {}): Promise<HeadersInit> {
    const csrfToken = await getCSRFToken();

    return {
        'Content-Type': 'application/json',
        'X-Frappe-CSRF-Token': csrfToken,
        ...additionalHeaders
    };
}

/**
 * Enhanced fetch wrapper that automatically includes CSRF token
 * and handles CSRF errors with auto-logout
 */
export async function frappeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = await getAuthHeaders(options.headers as Record<string, string> || {});

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include'
    });

    // Check for CSRF errors
    if (!response.ok) {
        try {
            const clone = response.clone();
            const json = await clone.json();

            if (isCSRFError(json)) {
                handleCSRFError();
                throw new Error('CSRF Token Error - Session expired');
            }
        } catch (e) {
            // If not a JSON response or parsing fails, continue
            if (e instanceof Error && e.message.includes('CSRF')) {
                throw e;
            }
        }
    }

    return response;
}

/**
 * Safe wrapper for API calls that handles CSRF errors
 * Use this for all API calls that need automatic logout on CSRF error
 */
export async function safeAPICall<T>(
    apiCall: () => Promise<T>,
    errorMessage: string = 'API call failed'
): Promise<T> {
    try {
        return await apiCall();
    } catch (error: any) {
        // Check if it's a CSRF error
        if (error.message?.includes('CSRFTokenError') ||
            error.message?.includes('Invalid Request') ||
            error.exc_type === 'CSRFTokenError') {
            handleCSRFError();
            throw new Error('Session expired - Please log in again');
        }

        throw new Error(error.message || errorMessage);
    }
}

