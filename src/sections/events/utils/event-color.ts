export function getEventStatus(event: any): string {
    if (!event) return '';
    return String(
        event.status ||
        event.rawStatus ||
        event.workflow_state ||
        event.call_status ||
        event.meeting_status ||
        event.event_status ||
        event.eventOriginalData?.status ||
        ''
    ).trim();
}

export function getEventType(event: any): string {
    if (!event) return '';
    return String(
        event.reference_doctype ||
        event.event_category ||
        event.eventOriginalData?.reference_doctype ||
        event.eventOriginalData?.event_category ||
        ''
    ).trim();
}

/**
 * Returns solid background hex color for event chips based on event type and status.
 *
 * Rules:
 * Calls/Meetings:
 *   Scheduled / Open -> #F5A623 (yellow/amber)
 *   Completed / Closed -> #22A559 (green)
 * To-Dos:
 *   Open / Scheduled -> #F5A623 (yellow/amber)
 *   Closed / Completed -> #22A559 (green)
 *   Canceled / Cancelled -> #DC3545 (red)
 */
export function getEventChipColor(type?: string, status?: string, fallbackColor?: string): string {
    const normStatus = String(status || '').trim().toLowerCase();

    if (normStatus === 'completed' || normStatus === 'closed') {
        return '#22A559';
    }
    if (normStatus === 'canceled' || normStatus === 'cancelled') {
        return '#DC3545';
    }
    if (normStatus === 'scheduled' || normStatus === 'open') {
        return '#F5A623';
    }

    if (fallbackColor) {
        return fallbackColor;
    }

    const normType = String(type || '').trim().toLowerCase();
    if (normType.includes('call')) return '#F5A623';
    if (normType.includes('meeting')) return '#22A559';
    if (normType.includes('todo') || normType.includes('to-do')) return '#F5A623';

    return '#F5A623';
}
