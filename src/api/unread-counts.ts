import { frappeRequest } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface UnreadCounts {
  counts: {
    'Leave Application': number;
    Request: number;
    'WFH Attendance': number;
    [key: string]: number;
  };
  unread_ids: {
    'Leave Application': string[];
    Request: string[];
    'WFH Attendance': string[];
    [key: string]: string[];
  };
}

export async function fetchUnreadCounts(): Promise<UnreadCounts> {
  try {
    const res = await frappeRequest('/api/method/company.company.api.get_unread_count');

    if (!res.ok) {
      const error = await res.json();
      throw new Error(handleFrappeError(error, 'Failed to fetch unread counts'));
    }

    const data = await res.json();
    const message = data.message || {};

    return {
      counts: message.counts || {},
      unread_ids: message.unread_ids || {},
    };
  } catch (error) {
    console.error('Failed to fetch unread counts:', error);
    return {
      counts: {
        'Leave Application': 0,
        Request: 0,
        'WFH Attendance': 0,
      },
      unread_ids: {
        'Leave Application': [],
        Request: [],
        'WFH Attendance': [],
      },
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
