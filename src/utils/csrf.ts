/**
 * CSRF Token Management Utility
 * 
 * This module handles CSRF token retrieval and management for Frappe API calls.
 * CSRF tokens are required for all POST, PUT, DELETE requests to prevent
 * Cross-Site Request Forgery attacks.
 */

/**
 * Show session expired message
 */
function showSessionExpiredMessage(): Promise<void> {
    return new Promise((resolve) => {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            backdrop-filter: blur(4px);
        `;

        // Create message box
        const messageBox = document.createElement('div');
        messageBox.style.cssText = `
            background: white;
            padding: 32px 48px;
            border-radius: 16px;
            box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
            text-align: center;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;

        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);

        // Create icon
        const icon = document.createElement('div');
        icon.innerHTML = `
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin: 0 auto 16px;">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#f44336"/>
            </svg>
        `;

        // Create title
        const title = document.createElement('div');
        title.textContent = 'Session Expired';
        title.style.cssText = `
            font-size: 24px;
            font-weight: 700;
            color: #212B36;
            margin-bottom: 8px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        `;

        // Create message
        const message = document.createElement('div');
        message.textContent = 'Your session has expired. Please log in again.';
        message.style.cssText = `
            font-size: 14px;
            color: #637381;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        `;

        // Assemble
        messageBox.appendChild(icon);
        messageBox.appendChild(title);
        messageBox.appendChild(message);
        overlay.appendChild(messageBox);
        document.body.appendChild(overlay);

        // Remove after 2 seconds
        setTimeout(() => {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(overlay);
                document.head.removeChild(style);
                resolve();
            }, 300);
        }, 2000);
    });
}

/**
 * Handle CSRF error by logging out user
 */
export async function handleCSRFError(): Promise<void> {
    console.error('CSRF Token Error detected - logging out user');

    // Show session expired message
    await showSessionExpiredMessage();

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

    // Redirect to sign-in page
    window.location.href = '/sign-in';
}

/**
 * Check if error response contains CSRF error
 */
export function isCSRFError(json: any): boolean {
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

    // Remove Content-Type header if body is FormData to let browser set it with boundary
    if (options.body instanceof FormData) {
        if (headers instanceof Headers) {
            headers.delete('Content-Type');
        } else if (typeof headers === 'object' && headers !== null) {
            delete (headers as any)['Content-Type'];
        }
    }

    let response = await fetch(url, {
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
                console.warn('CSRF token invalid, refreshing...');

                // Token might be expired, try to fetch a new one explicitly
                const newToken = await fetchCSRFToken();

                if (newToken) {
                    console.log('Got new CSRF token, retrying request...');

                    // Update header with new token
                    if (headers instanceof Headers) {
                        headers.set('X-Frappe-CSRF-Token', newToken);
                    } else if (typeof headers === 'object' && headers !== null) {
                        (headers as any)['X-Frappe-CSRF-Token'] = newToken;
                    }

                    // Retry request with new token
                    response = await fetch(url, {
                        ...options,
                        headers,
                        credentials: 'include'
                    });

                    // Check if retry failed (only checking for CSRF again)
                    if (!response.ok) {
                        const retryClone = response.clone();
                        const retryJson = await retryClone.json();

                        if (isCSRFError(retryJson)) {
                            console.error('CSRF Retry failed');
                            handleCSRFError();
                            throw new Error('CSRF Token Error - Session expired');
                        }
                    }
                } else {
                    console.error('Failed to refresh CSRF token');
                    handleCSRFError();
                    throw new Error('CSRF Token Error - Session expired');
                }
            }
        } catch (e) {
            // If not a JSON response or parsing fails, continue
            if (e instanceof Error && e.message.includes('CSRF')) {
                throw e;
            }
            // For other errors during retry or parsing, we just return the original response 
            // (or let the caller handle the error from the retried response)
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

