import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface Asset {
    name: string;
    asset_name: string;
    asset_tag: string;
    category: string;
    purchase_date: string;
    purchase_cost: number;
    current_status: string;
    description: string;
    creation?: string;
    modified?: string;
}

async function fetchFrappeList(params: {
    page: number;
    page_size: number;
    search?: string;
    orderBy?: string;
    order?: 'asc' | 'desc';
    filters?: {
        status?: string;
        category?: string;
        startDate?: string | null;
        endDate?: string | null;
    };
}) {
    const filters: any[] = [];

    // Add status and date filters
    if (params.filters) {
        if (params.filters.status && params.filters.status !== 'all') {
            filters.push(['Asset', 'current_status', '=', params.filters.status]);
        }
        if (params.filters.category && params.filters.category !== 'all') {
            filters.push(['Asset', 'category', '=', params.filters.category]);
        }
        if (params.filters.startDate) {
            filters.push(['Asset', 'purchase_date', '>=', params.filters.startDate]);
        }
        if (params.filters.endDate) {
            filters.push(['Asset', 'purchase_date', '<=', params.filters.endDate]);
        }
    }

    // Use or_filters for search across multiple fields
    const or_filters: any[] = params.search ? [
        ['Asset', 'asset_name', 'like', `%${params.search}%`],
        ['Asset', 'asset_tag', 'like', `%${params.search}%`],
        ['Asset', 'category', 'like', `%${params.search}%`]
    ] : [];

    const orderByParam = params.orderBy && params.order ? `${params.orderBy} ${params.order}` : "creation desc";

    const query = new URLSearchParams({
        doctype: 'Asset',
        fields: JSON.stringify(["*"]),
        filters: JSON.stringify(filters),
        or_filters: JSON.stringify(or_filters),
        limit_start: String((params.page - 1) * params.page_size),
        limit_page_length: String(params.page_size),
        order_by: orderByParam
    });

    const [res, countRes] = await Promise.all([
        frappeRequest(`/api/method/frappe.client.get_list?${query.toString()}`),
        frappeRequest(`/api/method/frappe.client.get_count?doctype=Asset&filters=${encodeURIComponent(JSON.stringify(filters))}&or_filters=${encodeURIComponent(JSON.stringify(or_filters))}`)
    ]);

    if (!res.ok) throw new Error("Failed to fetch assets");

    const data = await res.json();
    const countData = await countRes.json();

    return {
        data: data.message || [],
        total: countData.message || 0
    };
}

export const fetchAssets = (params: any) => fetchFrappeList(params);

export async function createAsset(data: Partial<Asset>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({ doc: { doctype: "Asset", ...data } })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to create asset"));
    }

    return (await res.json()).message;
}

export async function updateAsset(name: string, data: Partial<Asset>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Asset",
            name,
            fieldname: data
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to update asset"));
    }

    return (await res.json()).message;
}

export async function deleteAsset(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Asset", name })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to delete asset"));
    }

    return true;
}

export async function getAsset(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Asset&name=${name}`);

    if (!res.ok) {
        throw new Error("Failed to fetch asset details");
    }

    return (await res.json()).message;
}

export async function getAssetPermissions() {
    const res = await frappeRequest("/api/method/company.company.frontend_api.get_doc_permissions?doctype=Asset");

    if (!res.ok) {
        return { read: false, write: false, delete: false };
    }

    return (await res.json()).message || { read: false, write: false, delete: false };
}

export async function getAssetCategories(): Promise<any[]> {
    try {
        const res = await frappeRequest("/api/method/frappe.client.get_list?doctype=Asset Category&fields=[\"name\",\"category_name\"]&limit_page_length=999");

        if (!res.ok) {
            // Fallback to distinct list from Asset if Asset Category doesn't exist or fails
            const assetRes = await frappeRequest("/api/method/frappe.client.get_list?doctype=Asset&fields=[\"category\"]&distinct=true");
            if (!assetRes.ok) return [];
            const data = await assetRes.json();
            return (data.message || []).map((item: any) => ({ name: item.category, category_name: item.category }));
        }

        const data = await res.json();
        return data.message || [];
    } catch (error) {
        console.error('Failed to fetch asset categories:', error);
        return [];
    }
}

export async function createAssetCategory(categoryName: string, description?: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doc: {
                doctype: "Asset Category",
                category_name: categoryName,
                description
            }
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, "Failed to create asset category"));
    }

    return (await res.json()).message;
}
