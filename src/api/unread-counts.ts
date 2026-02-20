import { frappeRequest } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface UnreadCounts {
    'Leave Application': number;
    Request: number;
    'WFH Attendance': number;
}

export async function fetchUnreadCounts(): Promise<UnreadCounts> {
    try {
        const res = await frappeRequest('/api/method/company.company.api.get_unread_count');

        if (!res.ok) {
            const error = await res.json();
            throw new Error(handleFrappeError(error, 'Failed to fetch unread counts'));
        }

        const data = await res.json();
        return data.message;
    } catch (error) {
        console.error('Failed to fetch unread counts:', error);
        return {
            'Leave Application': 0,
            Request: 0,
            'WFH Attendance': 0,
        };
    }
}

export async function markAsRead(doctype: string, name: string): Promise<void> {
    try {
        const res = await frappeRequest('/api/method/company.company.api.mark_hr_item_as_read', {
            method: 'POST',
            body: JSON.stringify({ doctype, name }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(handleFrappeError(error, 'Failed to mark as read'));
        }
    } catch (error) {
        console.error('Failed to mark as read:', error);
    }
}
