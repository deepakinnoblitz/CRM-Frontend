import { frappeRequest } from 'src/utils/csrf';

export interface SalarySlip {
    name: string;
    employee: string;
    employee_name: string;
    department?: string;
    designation?: string;
    pay_period_start: string;
    pay_period_end: string;
    gross_pay: number;
    net_pay: number;
    grand_net_pay: number;
    total_deduction: number;
    basic_pay?: number;
    hra?: number;
    conveyance_allowances?: number;
    medical_allowances?: number;
    other_allowances?: number;
    pf?: number;
    professional_tax?: number;
    health_insurance?: number;
    loan_recovery?: number;
    lop?: number;
    creation?: string;
    modified?: string;
}

async function fetchFrappeList(params: {
    page: number;
    page_size: number;
    search?: string;
    filterValues?: Record<string, any>;
    orderBy?: string;
    order?: 'asc' | 'desc';
}) {
    const filters: any[] = [];

    if (params.search) {
        filters.push(['Salary Slip', 'employee_name', 'like', `%${params.search}%`]);
    }

    if (params.filterValues) {
        Object.entries(params.filterValues).forEach(([key, value]) => {
            if (value) {
                if (key === 'pay_period_start') {
                    filters.push(['Salary Slip', 'pay_period_start', '>=', value]);
                } else if (key === 'pay_period_end') {
                    filters.push(['Salary Slip', 'pay_period_end', '<=', value]);
                } else {
                    filters.push(['Salary Slip', key, '=', value]);
                }
            }
        });
    }

    const orderByParam = params.orderBy && params.order ? `${params.orderBy} ${params.order}` : "pay_period_start desc";

    const query = new URLSearchParams({
        doctype: 'Salary Slip',
        fields: JSON.stringify(["*"]),
        filters: JSON.stringify(filters),
        limit_start: String((params.page - 1) * params.page_size),
        limit_page_length: String(params.page_size),
        order_by: orderByParam
    });


    const [res, countRes] = await Promise.all([
        frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`),
        frappeRequest(`/api/method/frappe.client.get_count?doctype=Salary Slip&filters=${encodeURIComponent(JSON.stringify(filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch salary slips");

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0
    };
}

export const fetchSalarySlips = (params: any) => fetchFrappeList(params);

export async function createSalarySlip(data: Partial<SalarySlip>) {
    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        body: JSON.stringify({ doc: { doctype: "Salary Slip", ...data } })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to create salary slip");
    return json.message;
}

export async function autoAllocateSalarySlips(year: number, month: number, employees?: string[]) {
    const res = await frappeRequest("/api/method/company.company.api.generate_salary_slips_from_employee", {
        method: "POST",
        body: JSON.stringify({ year, month, employees: employees ? JSON.stringify(employees) : undefined })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to generate salary slips");
    return json.message;
}

export async function updateSalarySlip(name: string, data: Partial<SalarySlip>) {
    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        body: JSON.stringify({
            doctype: "Salary Slip",
            name,
            fieldname: data
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to update salary slip");
    return json.message;
}

export async function deleteSalarySlip(name: string) {
    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        body: JSON.stringify({
            doctype: "Salary Slip",
            name
        })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to delete salary slip");
    return json.message;
}



export async function getSalarySlip(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Salary Slip&name=${encodeURIComponent(name)}`);

    if (!res.ok) {
        throw new Error("Failed to fetch salary slip details");
    }

    return (await res.json()).message;
}

export async function getSalarySlipPermissions() {
    const res = await frappeRequest("/api/method/company.company.frontend_api.get_doc_permissions?doctype=Salary Slip");

    if (!res.ok) {
        return { read: false, write: false, delete: false };
    }

    return (await res.json()).message || { read: false, write: false, delete: false };
}

export function getSalarySlipDownloadUrl(name: string) {
    return `/api/method/frappe.utils.print_format.download_pdf?doctype=Salary%20Slip&name=${encodeURIComponent(name)}`;
}
