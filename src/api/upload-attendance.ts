import { frappeRequest } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

import { getHRDoc, fetchFrappeList } from './hr-management';

// Fetch Upload Attendance list
export async function fetchUploadAttendance(params: {
    page: number;
    page_size: number;
    search?: string;
    filters?: {
        startDate?: string;
        endDate?: string;
    };
    orderBy?: string;
    order?: 'asc' | 'desc';
}) {
    const filters: any[] = [];
    const or_filters: any[] = [];

    if (params.search) {
        or_filters.push(["Upload Attendance", "name", "like", `%${params.search}%`]);
        or_filters.push(["Upload Attendance", "attendance_file", "like", `%${params.search}%`]);
    }

    if (params.filters) {
        if (params.filters.startDate) {
            filters.push(["Upload Attendance", "upload_date", ">=", params.filters.startDate]);
        }
        if (params.filters.endDate) {
            filters.push(["Upload Attendance", "upload_date", "<=", params.filters.endDate]);
        }
    }

    return fetchFrappeList('Upload Attendance', {
        ...params,
        filters,
        or_filters
    });
}

// Get single Upload Attendance record
export async function getUploadAttendance(name: string) {
    return getHRDoc('Upload Attendance', name);
}

// Create Upload Attendance record
export async function createUploadAttendance(data: any) {
    const res = await frappeRequest('/api/method/frappe.client.insert', {
        method: 'POST',
        body: JSON.stringify({
            doc: {
                doctype: 'Upload Attendance',
                ...data
            }
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, 'Failed to create Upload Attendance'));
    }

    return (await res.json()).message;
}

// Update Upload Attendance record
export async function updateUploadAttendance(name: string, data: any) {
    const res = await frappeRequest('/api/method/frappe.client.set_value', {
        method: 'POST',
        body: JSON.stringify({
            doctype: 'Upload Attendance',
            name,
            fieldname: data
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, 'Failed to update Upload Attendance'));
    }

    return (await res.json()).message;
}

// Delete Upload Attendance record
export async function deleteUploadAttendance(name: string) {
    const res = await frappeRequest('/api/method/frappe.client.delete', {
        method: 'POST',
        body: JSON.stringify({
            doctype: 'Upload Attendance',
            name
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, 'Failed to delete Upload Attendance'));
    }

    return (await res.json()).message;
}

// Import Attendance from uploaded file
export async function importAttendance(docname: string) {
    const res = await frappeRequest('/api/method/company.company.doctype.upload_attendance.upload_attendance.import_attendance', {
        method: 'POST',
        body: JSON.stringify({
            docname
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, 'Failed to import attendance'));
    }

    return (await res.json()).message;
}
