import { isCSRFError, handleCSRFError } from 'src/utils/csrf';

export async function handleResponse(res: Response) {
    if (res.ok) {
        return res.json();
    }

    let errorMessage = 'Something went wrong';
    try {
        const errorData = await res.json();

        // Check for CSRF/Session error
        if (isCSRFError(errorData)) {
            handleCSRFError();
            errorMessage = 'Session expired - Please log in again';
        } else if (errorData._server_messages) {
            // Handle Frappe error structure
            const messages = JSON.parse(errorData._server_messages);
            if (messages.length > 0) {
                const firstMsg = JSON.parse(messages[0]);
                errorMessage = firstMsg.message || errorMessage;
            }
        } else if (errorData.exception) {
            // Extract message from exception string
            // Format: "frappe.exceptions.ValidationError: Scheduled Call Time cannot be in the past."
            // We want to remove the exception type and keep only the message
            const exceptionString = errorData.exception;

            // Find the first colon after the exception type
            const colonIndex = exceptionString.indexOf(':');
            if (colonIndex !== -1) {
                // Get everything after the first colon and trim whitespace
                errorMessage = exceptionString.substring(colonIndex + 1).trim();
            } else {
                errorMessage = exceptionString;
            }
        } else if (errorData.message) {
            errorMessage = errorData.message;
        }
    } catch {
        // Fallback if JSON parsing fails
        errorMessage = res.statusText || errorMessage;
    }

    throw new Error(errorMessage);
}
