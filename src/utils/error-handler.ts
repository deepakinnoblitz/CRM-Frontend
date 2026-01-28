
export const getFriendlyErrorMessage = (error: any): string => {
    if (!error) return "Unknown error";

    let message = "";

    // 1. Extract the core message string
    if (typeof error === 'string') {
        // Try to parse as JSON if it looks like a JSON object string
        if (error.trim().startsWith('{') && error.trim().endsWith('}')) {
            try {
                const parsed = JSON.parse(error);
                if (parsed.message) {
                    message = String(parsed.message);
                } else {
                    message = error;
                }
            } catch (e) {
                message = error;
            }
        } else {
            message = error;
        }
    } else if (error && typeof error === 'object') {
        // Handle common object structures like { message: "...", ... } or { error: "...", ... }
        if (error.message && typeof error.message === 'string') {
            message = error.message;
        } else if (error.error && typeof error.error === 'string') {
            message = error.error;
        } else if (error.message && typeof error.message === 'object') {
            message = JSON.stringify(error.message);
        } else {
            try {
                message = JSON.stringify(error);
            } catch (e) {
                message = String(error);
            }
        }
    } else {
        message = String(error);
    }

    // Prevents "[object Object]" from slipping through
    if (message === "[object Object]" || message === "{}") {
        return "An unspecified error occurred.";
    }

    // 2. Handle known technical Python/Frappe patterns
    const technicalPatterns = [
        { pattern: "Value missing for", replacement: "Missing value for " },
        { pattern: "'NoneType' object has no attribute", replacement: "Technical processing error: Missing data reference." },
        { pattern: "AttributeError:", replacement: "Internal processing error." },
        { pattern: "TypeError:", replacement: "Data type mismatch or invalid data format." },
        { pattern: "KeyError:", replacement: "Missing required data key." },
        { pattern: "IndexError:", replacement: "Data structure error (index out of range)." }
    ];

    for (const { pattern, replacement } of technicalPatterns) {
        if (message.includes(pattern)) {
            // Special handling for "Value missing for [DocType]: [Field]"
            if (pattern === "Value missing for" && message.includes(":")) {
                const fieldName = message.split(':').pop()?.trim();
                return `Missing required field: ${fieldName}`;
            }
            return replacement;
        }
    }

    // Handle Duplicate Entry Error (IntegrityError)
    if (message.includes("Duplicate entry")) {
        const match = message.match(/Duplicate entry '([^']+)' for key '([^']+)'/);
        if (match) {
            const value = match[1];
            const key = match[2];
            const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
            return `${formattedKey} '${value}' already exists.`;
        }
    }

    // Handle Frappe Exceptions & Tracebacks
    if (message.includes("frappe.exceptions.") || message.includes("Traceback (most recent call last):")) {
        if (message.includes("Traceback")) {
            const lines = message.split('\n').filter(l => l.trim() !== "");
            const lastLine = lines[lines.length - 1];
            if (lastLine && lastLine.includes(':')) {
                const parts = lastLine.split(':');
                const lastPart = parts.slice(1).join(':').trim();
                // Check if the last part itself is technical
                for (const { pattern, replacement } of technicalPatterns) {
                    if (lastPart.includes(pattern)) return replacement;
                }
                return lastPart;
            }
            return "An internal server error occurred. Please check the data format.";
        }

        let cleanMessage = message.replace(/frappe\.exceptions\.[a-zA-Z0-9]+:\s*/, '');

        if (cleanMessage.includes("Mandatory fields required")) {
            const match = cleanMessage.match(/Mandatory fields required in [^:]+:\s*(.+)/);
            if (match) {
                return `Missing mandatory fields: ${match[1]}`;
            }
        }

        if (cleanMessage.includes("IntegrityError")) {
            return "Database integrity error. Please check for duplicates or invalid references.";
        }

        cleanMessage = cleanMessage.replace(/\s*\([^)]+\)$/, '');
        return cleanMessage.trim();
    }

    return message;
};
