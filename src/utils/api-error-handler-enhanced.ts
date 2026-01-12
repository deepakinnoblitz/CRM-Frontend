/**
 * API Error Handler Utility
 * 
 * Handles API errors including CSRF token errors with automatic logout
 */

/**
 * Check if error is a CSRF token error
 */
export function isCSRFError(error: any): boolean {
    if (!error) return false;

    // Check error message
    const errorMessage = error.message || error.toString();
    if (errorMessage.includes('CSRFTokenError') || errorMessage.includes('Invalid Request')) {
        return true;
    }

    // Check if response has CSRF error
    if (error.exc_type === 'CSRFTokenError') {
        return true;
    }

    return false;
}

/**
 * Handle CSRF error by logging out user
 */
export function handleCSRFError(): void {
    console.error('CSRF Token Error detected - logging out user');

    // Clear local storage
    localStorage.clear();

    // Redirect to logout endpoint
    window.location.href = '/api/method/logout';
}

/**
 * Enhanced error handler that checks for CSRF errors
 */
export async function handleAPIError(response: Response): Promise<void> {
    try {
        const json = await response.json();

        // Check if it's a CSRF error
        if (isCSRFError(json)) {
            handleCSRFError();
            throw new Error('CSRF Token Error - Please log in again');
        }

        // Handle other errors
        const errorMessage = json.message || json.exception || 'An error occurred';
        throw new Error(errorMessage);
    } catch (error) {
        // If JSON parsing fails, check response status
        if (response.status === 403 || response.status === 401) {
            handleCSRFError();
            throw new Error('Authentication Error - Please log in again');
        }
        throw error;
    }
}

/**
 * Wrapper for fetch that automatically handles CSRF errors
 */
export async function safeFetch(url: string, options: RequestInit = {}): Promise<Response> {
    try {
        const response = await fetch(url, options);

        // If response is not ok, check for CSRF error
        if (!response.ok) {
            const clone = response.clone();
            try {
                const json = await clone.json();
                if (isCSRFError(json)) {
                    handleCSRFError();
                    throw new Error('CSRF Token Error - Please log in again');
                }
            } catch (e) {
                // If JSON parsing fails, continue with original response
            }
        }

        return response;
    } catch (error) {
        // Check if network error might be auth-related
        if (isCSRFError(error)) {
            handleCSRFError();
        }
        throw error;
    }
}
