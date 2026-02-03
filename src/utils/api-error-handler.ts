/**
 * Beautifies technical Frappe error messages.
 * e.g., converts snake_case field names to Title Case.
 */
function beautifyFrappeMessage(msg: string): string {
    if (!msg) return msg;

    // Remove HTML tags and normalize whitespace
    let cleanMsg = msg.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    // Remove "Error: " prefix if it exists
    cleanMsg = cleanMsg.replace(/^Error:\s*/i, '');

    // Handle ValidationError with collection amount
    if (cleanMsg.includes('Collection exceeds Invoice Amount')) {
        const grandTotal = cleanMsg.match(/Grand Total:\s*([\d.]+)/)?.[1];
        const alreadyCollected = cleanMsg.match(/Already Collected:\s*([\d.]+)/)?.[1];
        const tryingToAdd = cleanMsg.match(/Trying to Add:\s*([\d.]+)/)?.[1];
        const remaining = cleanMsg.match(/Remaining Balance:\s*([\d.]+)/)?.[1];

        if (grandTotal && remaining && tryingToAdd) {
            return `Collection Amount Exceeds Invoice Balance!\n\n` +
                `Invoice Total: ₹${parseFloat(grandTotal).toLocaleString()}\n` +
                `Already Collected: ₹${parseFloat(alreadyCollected || '0').toLocaleString()}\n` +
                `Remaining Balance: ₹${parseFloat(remaining).toLocaleString()}\n\n` +
                `You tried to collect ₹${parseFloat(tryingToAdd).toLocaleString()}, ` +
                `but only ₹${parseFloat(remaining).toLocaleString()} is remaining.`;
        }
    }

    // 1. Handle MandatoryError
    // frappe.exceptions.MandatoryError: [Employee, EMP00027]: employee_id, email
    if (cleanMsg.includes('MandatoryError')) {
        const parts = cleanMsg.split(':');
        const fieldPart = parts[parts.length - 1];
        if (fieldPart) {
            const fields = fieldPart.split(',').map(f => f.trim()).filter(Boolean);
            const beautifiedFields = fields.map(f =>
                f.split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')
            );
            return `Mandatory Fields Required: ${beautifiedFields.join(', ')}`;
        }
    }

    return cleanMsg;
}

/**
 * Parses Frappe server error responses to extract human-readable messages.
 * Frappe often sends errors in `_server_messages` as stringified JSON.
 */
export function handleFrappeError(json: any, defaultMessage: string = "An error occurred"): string {
    if (!json) return defaultMessage;

    const rawMessages: string[] = [];

    // 1. Try to parse _server_messages
    if (json._server_messages) {
        try {
            const serverMsgs = JSON.parse(json._server_messages);
            if (Array.isArray(serverMsgs)) {
                serverMsgs.forEach((m: string | any) => {
                    try {
                        const inner = typeof m === 'string' ? JSON.parse(m) : m;
                        if (inner.message) rawMessages.push(inner.message);
                    } catch {
                        if (typeof m === 'string') rawMessages.push(m);
                    }
                });
            }
        } catch (e) {
            console.error("Failed to parse _server_messages", e);
        }
    }

    // 2. Include exception (extract message only, remove exception type)
    if (json.exception) {
        // Format: "frappe.exceptions.ValidationError: Scheduled Call Time cannot be in the past."
        const exceptionString = json.exception;
        const colonIndex = exceptionString.indexOf(':');
        if (colonIndex !== -1) {
            // Get everything after the first colon and trim
            const cleanMessage = exceptionString.substring(colonIndex + 1).trim();
            rawMessages.push(cleanMessage);
        } else {
            // No colon found, use the whole exception
            const excLines = exceptionString.split('\n');
            if (excLines[0]) rawMessages.push(excLines[0]);
        }
    }

    // 3. Include message
    if (json.message && typeof json.message === 'string') {
        rawMessages.push(json.message);
    }

    // Process and Deduplicate
    const processedMessages = rawMessages.map(m => beautifyFrappeMessage(m));

    // If a "Mandatory Fields Required" message exists, remove individual "Value missing" messages
    const hasMandatorySummary = processedMessages.some(m => m.startsWith('Mandatory Fields Required'));

    const finalMessages = processedMessages.filter((m, index) => {
        // Normalization for comparison - remove all spaces and lowercase
        const normalized = m.toLowerCase().replace(/\s+/g, '');

        // Remove if it's a duplicate based on normalized content
        const firstIndex = processedMessages.findIndex(msg =>
            msg.toLowerCase().replace(/\s+/g, '') === normalized
        );

        if (firstIndex !== index) return false;

        // Remove individual "Value missing" if we have a summary
        if (hasMandatorySummary && m.toLowerCase().includes('value missing')) return false;

        return true;
    });

    return finalMessages.length > 0 ? finalMessages.join('\n') : defaultMessage;
}
