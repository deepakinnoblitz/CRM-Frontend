import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface PersonalityTrait {
    name: string;
    trait_name: string;
    category?: string;
    description?: string;
    reward_score: number;
    penalty_score: number;
    modified_by: string;
}

export interface PersonalityEvent {
    name: string;
    employee: string;
    employee_name?: string;
    trait: string;
    evaluation_type: 'Agree' | 'Neutral' | 'Disagree';
    evaluation_date: string;
    score_change: number;
    hr_user: string;
    remarks?: string;
    docstatus: number;
    modified_by: string;
    modified: string;
}

export interface PersonalityScoreLog {
    name: string;
    employee: string;
    employee_name?: string;
    previous_score: number;
    change: number;
    new_score: number;
    reason: string;
    date: string;
    modified_by: string;
}

// APIs for Personality Trait
export async function fetchPersonalityTraits(params: {
    page: number;
    page_size: number;
    search?: string;
    sort_by?: string;
    category?: string;
}) {
    const filters: any[] = [];
    if (params.category) {
        filters.push(["Personality Trait", "category", "like", `%${params.category}%`]);
    }
    const or_filters: any[] = [];

    if (params.search) {
        or_filters.push(["Personality Trait", "trait_name", "like", `%${params.search}%`]);
        or_filters.push(["Personality Trait", "category", "like", `%${params.search}%`]);
    }

    let orderBy = "modified_by desc";
    if (params.sort_by) {
        const parts = params.sort_by.split('_');
        const direction = parts.pop();
        const field = parts.join('_');
        orderBy = `${field} ${direction}, name ${direction}`;
    }

    const query = new URLSearchParams({
        doctype: "Personality Trait",
        fields: JSON.stringify(["name", "trait_name", "category", "reward_score", "penalty_score", "modified_by"]),
        filters: JSON.stringify(filters),
        or_filters: JSON.stringify(or_filters),
        limit_start: String((params.page - 1) * params.page_size),
        limit_page_length: String(params.page_size),
        order_by: orderBy
    });

    const [res, countRes] = await Promise.all([
        frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`),
        frappeRequest(`/api/method/frappe.client.get_count?doctype=Personality Trait&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch personality traits");

    return {
        data: (await res.json()).message || [],
        total: (await countRes.json()).message || 0
    };
}

export async function createPersonalityTrait(data: Partial<PersonalityTrait>) {
    const res = await frappeRequest('/api/method/frappe.client.insert', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
            doc: {
                doctype: 'Personality Trait',
                ...data
            }
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to create personality trait"));
    }
    return (await res.json()).message;
}

export async function updatePersonalityTrait(name: string, data: Partial<PersonalityTrait>) {
    const res = await frappeRequest('/api/method/frappe.client.set_value', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
            doctype: 'Personality Trait',
            name: name,
            fieldname: data
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to update personality trait"));
    }
    return (await res.json()).message;
}

export async function deletePersonalityTrait(name: string) {
    const res = await frappeRequest('/api/method/frappe.client.delete', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
            doctype: 'Personality Trait',
            name: name
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to delete personality trait"));
    }
    return (await res.json()).message;
}

// APIs for Personality Event
export async function fetchPersonalityEvents(params: {
    page: number;
    page_size: number;
    search?: string;
    sort_by?: string;
    employee?: string;
    trait?: string;
    evaluation_type?: string;
    docstatus?: number;
}) {
    const filters: any[] = [];
    if (params.employee) filters.push(["Personality Event", "employee", "=", params.employee]);
    if (params.trait) filters.push(["Personality Event", "trait", "=", params.trait]);
    if (params.evaluation_type && params.evaluation_type !== 'all') {
        filters.push(["Personality Event", "evaluation_type", "=", params.evaluation_type]);
    }
    if (params.docstatus !== undefined && params.docstatus !== null) {
        filters.push(["Personality Event", "docstatus", "=", params.docstatus]);
    }

    const or_filters: any[] = [];

    if (params.search) {
        or_filters.push(["Personality Event", "employee", "like", `%${params.search}%`]);
        or_filters.push(["Personality Event", "employee_name", "like", `%${params.search}%`]);
        or_filters.push(["Personality Event", "trait", "like", `%${params.search}%`]);
    }

    let orderBy = "modified_by desc";
    if (params.sort_by) {
        const parts = params.sort_by.split('_');
        const direction = parts.pop();
        const field = parts.join('_');
        orderBy = `${field} ${direction}, name ${direction}`;
    }

    const query = new URLSearchParams({
        doctype: "Personality Event",
        fields: JSON.stringify(["name", "employee", "employee_name", "trait", "evaluation_type", "evaluation_date", "score_change", "hr_user", "docstatus", "modified_by", "modified"]),
        filters: JSON.stringify(filters),
        or_filters: JSON.stringify(or_filters),
        limit_start: String((params.page - 1) * params.page_size),
        limit_page_length: String(params.page_size),
        order_by: orderBy
    });

    const [res, countRes] = await Promise.all([
        frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`),
        frappeRequest(`/api/method/frappe.client.get_count?doctype=Personality Event&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch personality events");

    return {
        data: (await res.json()).message || [],
        total: (await countRes.json()).message || 0
    };
}

// APIs for Personality Score Log
export async function fetchPersonalityScoreLogs(params: {
    page: number;
    page_size: number;
    search?: string;
    sort_by?: string;
    employee?: string;
}) {
    const filters: any[] = [];
    if (params.employee) {
        filters.push(["Personality Score Log", "employee", "=", params.employee]);
    }
    const or_filters: any[] = [];

    if (params.search) {
        or_filters.push(["Personality Score Log", "employee", "like", `%${params.search}%`]);
        or_filters.push(["Personality Score Log", "employee_name", "like", `%${params.search}%`]);
        or_filters.push(["Personality Score Log", "reason", "like", `%${params.search}%`]);
    }

    let orderBy = "modified_by desc";
    if (params.sort_by) {
        const parts = params.sort_by.split('_');
        const direction = parts.pop();
        const field = parts.join('_');
        orderBy = `${field} ${direction}, name ${direction}`;
    }

    const query = new URLSearchParams({
        doctype: "Personality Score Log",
        fields: JSON.stringify(["name", "employee", "employee_name", "previous_score", "change", "new_score", "reason", "date", "modified_by"]),
        filters: JSON.stringify(filters),
        or_filters: JSON.stringify(or_filters),
        limit_start: String((params.page - 1) * params.page_size),
        limit_page_length: String(params.page_size),
        order_by: orderBy
    });

    const [res, countRes] = await Promise.all([
        frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`),
        frappeRequest(`/api/method/frappe.client.get_count?doctype=Personality Score Log&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch personality score logs");

    return {
        data: (await res.json()).message || [],
        total: (await countRes.json()).message || 0
    };
}

export async function createPersonalityEvent(data: Partial<PersonalityEvent>) {
    const res = await frappeRequest('/api/method/frappe.client.insert', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
            doc: {
                doctype: 'Personality Event',
                ...data
            }
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to create personality event"));
    }
    return (await res.json()).message;
}

export async function submitPersonalityEvent(doc: Partial<PersonalityEvent> & { doctype: string }) {
    const res = await frappeRequest('/api/method/frappe.client.submit', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
            doc
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to submit personality event"));
    }
    return (await res.json()).message;
}

export async function cancelPersonalityEvent(name: string) {
    const res = await frappeRequest('/api/method/frappe.client.cancel', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
            doctype: 'Personality Event',
            name: name
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to cancel personality event"));
    }
    return (await res.json()).message;
}

export async function deletePersonalityEvent(name: string) {
    const res = await frappeRequest('/api/method/frappe.client.delete', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
            doctype: 'Personality Event',
            name: name
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to delete personality event"));
    }
    return (await res.json()).message;
}

export async function updatePersonalityEvent(name: string, data: Partial<PersonalityEvent>) {
    const res = await frappeRequest('/api/method/frappe.client.set_value', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
            doctype: 'Personality Event',
            name: name,
            fieldname: data
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to update personality event"));
    }
    return (await res.json()).message;
}
