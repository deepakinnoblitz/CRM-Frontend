import { frappeRequest } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';
import { fetchFrappeList } from './hr-management';

export async function getCompanyEmailSettings() {
    try {
        const { data } = await fetchFrappeList('Company Email Settings', {
            page: 1,
            page_size: 1,
            fields: ["name", "hr_email", "hr_name", "hr_cc_emails"]
        });
        return data[0] || null;
    } catch (error) {
        console.error('Failed to fetch Company Email Settings:', error);
        return null;
    }
}

export async function updateCompanyEmailSettings(name: string, data: any) {
    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        body: JSON.stringify({
            doctype: "Company Email Settings",
            name,
            fieldname: data,
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update Email Settings"));
    return json.message;
}

export async function createCompanyEmailSettings(data: any) {
    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        body: JSON.stringify({
            doc: {
                doctype: "Company Email Settings",
                ...data
            }
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create Email Settings"));
    return json.message;
}
