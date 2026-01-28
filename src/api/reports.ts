import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export async function runReport(reportName: string, filters: any = {}) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest('/api/method/frappe.desk.query_report.run', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            report_name: reportName,
            filters: JSON.stringify(filters),
        }),
    });

    if (!res.ok) {
        const json = await res.json();
        throw new Error(handleFrappeError(json, 'Failed to run report'));
    }

    const data = await res.json();
    return data.message;
}

export async function getReportFilters(reportName: string) {
    const res = await frappeRequest(`/api/method/frappe.desk.query_report.get_script?report_name=${reportName}`);

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, 'Failed to fetch report filters'));
    }

    const data = await res.json();
    return data.message;
}
