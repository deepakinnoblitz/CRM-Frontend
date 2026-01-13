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
            // Extract message from traceback or just use the exception string
            errorMessage = errorData.exception.split(':').pop()?.trim() || errorData.exception;
        } else if (errorData.message) {
            errorMessage = errorData.message;
        }
    } catch {
        // Fallback if JSON parsing fails
        errorMessage = res.statusText || errorMessage;
    }

    throw new Error(errorMessage);
}
