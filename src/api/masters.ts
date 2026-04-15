import { frappeRequest, getAuthHeaders } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

import { fetchFrappeList } from './hr-management';

export interface Department {
    name: string;
    department_name: string;
    department_code?: string;
    department_head?: string;
    status: 'Active' | 'Inactive';
    description?: string;
}

export interface Project {
    name: string;
    project_name: string; // Display name
    status: string;
    customer?: string;
    department?: string;
    start_date?: string;
    end_date?: string;
    creation?: string;
    modified?: string;
}

export interface ActivityType {
    name: string;
    activity_type: string;
    billing_rate?: number;
    description?: string;
    creation?: string;
    modified?: string;
}

export interface BankAccount {
    name: string;
    bank_account_name: string;
    account_number: string;
    bank_name: string;
    branch?: string;
    ifsc_code?: string;
    account_type: 'Savings' | 'Current' | 'Salary Account' | 'Other';
    creation?: string;
    modified?: string;
}

export interface ClaimType {
    name: string;
    claim_type: string;
    creation?: string;
    modified?: string;
}

export interface AssetCategory {
    name: string;
    category_name: string;
    description?: string;
    creation?: string;
    modified?: string;
}

export interface EvaluationTraitCategory {
    name: string;
    category_name: string;
    creation?: string;
    modified?: string;
}

export interface Designation {
    name: string;
    designation_name: string;
    designation_code?: string;
    department: string;
    level?: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Manager' | 'Director';
    status: 'Active' | 'Inactive';
    description?: string;
    creation?: string;
    modified?: string;
}

// Department APIs
export const fetchDepartments = (params: any) => {
    const { search, ...restParams } = params;

    const or_filters = search ? [
        ["Department", "department_name", "like", `%${search}%`],
        ["Department", "department_code", "like", `%${search}%`],
        ["Department", "department_head", "like", `%${search}%`],
    ] : undefined;

    return fetchFrappeList("Department", {
        ...restParams,
        search: undefined,
        or_filters
    });
};

export async function createDepartment(data: Partial<Department>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({ doc: { doctype: "Department", ...data } })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create department"));
    return json.message;
}

export async function updateDepartment(name: string, data: Partial<Department>) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Department", name, fieldname: data })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update department"));
    return json.message;
}

export async function deleteDepartment(name: string) {
    const headers = await getAuthHeaders();

    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Department", name })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete department"));
    return true;
}

export async function renameDepartment(oldName: string, newName: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.rename_doc", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Department",
            old_name: oldName,
            new_name: newName,
            merge: false
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to rename department"));
    return json.message;
}

export async function getDepartment(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Department&name=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error("Failed to fetch department details");
    return (await res.json()).message;
}

// Project APIs
export const fetchProjects = (params: any) => {
    const { search, ...restParams } = params;

    const or_filters = search ? [
        ["project_name", "like", `%${search}%`],
        ["name", "like", `%${search}%`],
    ] : undefined;

    return fetchFrappeList("Project", {
        ...restParams,
        search: undefined,
        or_filters
    });
};

export async function createProject(data: Partial<Project>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({ doc: { doctype: "Project", ...data } })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create project"));
    return json.message;
}

export async function updateProject(name: string, data: Partial<Project>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Project", name, fieldname: data })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update project"));
    return json.message;
}

export async function deleteProject(name: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Project", name })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete project"));
    return true;
}

export async function renameProject(oldName: string, newName: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.rename_doc", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Project",
            old_name: oldName,
            new_name: newName,
            merge: false
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to rename project"));
    return json.message;
}

export async function getProject(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Project&name=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error("Failed to fetch project details");
    return (await res.json()).message;
}

// Activity Type APIs
export const fetchActivityTypes = (params: any) => {
    const { search, ...restParams } = params;

    const or_filters = search ? [
        ["Activity Type", "activity_type", "like", `%${search}%`],
    ] : undefined;

    return fetchFrappeList("Activity Type", {
        ...restParams,
        search: undefined,
        or_filters
    });
};

export async function createActivityType(data: Partial<ActivityType>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({ doc: { doctype: "Activity Type", ...data } })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create activity type"));
    return json.message;
}

export async function updateActivityType(name: string, data: Partial<ActivityType>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Activity Type", name, fieldname: data })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update activity type"));
    return json.message;
}

export async function deleteActivityType(name: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Activity Type", name })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete activity type"));
    return true;
}

export async function renameActivityType(oldName: string, newName: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.rename_doc", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Activity Type",
            old_name: oldName,
            new_name: newName,
            merge: false
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to rename activity type"));
    return json.message;
}

export async function getActivityType(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Activity Type&name=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error("Failed to fetch activity type details");
    return (await res.json()).message;
}

// Bank Account APIs
export const fetchBankAccounts = (params: any) => {
    const { search, ...restParams } = params;

    const or_filters = search ? [
        ["Bank Account", "bank_account_name", "like", `%${search}%`],
        ["Bank Account", "account_number", "like", `%${search}%`],
        ["Bank Account", "bank_name", "like", `%${search}%`],
    ] : undefined;

    return fetchFrappeList("Bank Account", {
        ...restParams,
        search: undefined,
        or_filters
    });
};

export async function createBankAccount(data: Partial<BankAccount>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({ doc: { doctype: "Bank Account", ...data } })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create bank account"));
    return json.message;
}

export async function updateBankAccount(name: string, data: Partial<BankAccount>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Bank Account", name, fieldname: data })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update bank account"));
    return json.message;
}

export async function deleteBankAccount(name: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Bank Account", name })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete bank account"));
    return true;
}

export async function renameBankAccount(oldName: string, newName: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.rename_doc", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Bank Account",
            old_name: oldName,
            new_name: newName,
            merge: false
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to rename bank account"));
    return json.message;
}

export async function getBankAccount(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Bank Account&name=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error("Failed to fetch bank account details");
    return (await res.json()).message;
}

// Claim Type APIs
export const fetchClaimTypes = (params: any) => {
    const { search, ...restParams } = params;

    const or_filters = search ? [
        ["Claim Type", "claim_type", "like", `%${search}%`],
    ] : undefined;

    return fetchFrappeList("Claim Type", {
        ...restParams,
        search: undefined,
        or_filters
    });
};

export async function createClaimType(data: Partial<ClaimType>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({ doc: { doctype: "Claim Type", ...data } })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create claim type"));
    return json.message;
}

export async function updateClaimType(name: string, data: Partial<ClaimType>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Claim Type", name, fieldname: data })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update claim type"));
    return json.message;
}

export async function deleteClaimType(name: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Claim Type", name })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete claim type"));
    return true;
}

export async function renameClaimType(oldName: string, newName: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.rename_doc", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Claim Type",
            old_name: oldName,
            new_name: newName,
            merge: false
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to rename claim type"));
    return json.message;
}

export async function getClaimType(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Claim Type&name=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error("Failed to fetch claim type details");
    return (await res.json()).message;
}
// Asset Category APIs
export const fetchAssetCategories = (params: any) => {
    const { search, ...restParams } = params;

    const or_filters = search ? [
        ["Asset Category", "category_name", "like", `%${search}%`],
    ] : undefined;

    return fetchFrappeList("Asset Category", {
        ...restParams,
        search: undefined,
        or_filters
    });
};

export async function createAssetCategory(data: Partial<AssetCategory>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({ doc: { doctype: "Asset Category", ...data } })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create asset category"));
    return json.message;
}

export async function updateAssetCategory(name: string, data: Partial<AssetCategory>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Asset Category", name, fieldname: data })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update asset category"));
    return json.message;
}

export async function deleteAssetCategory(name: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Asset Category", name })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete asset category"));
    return true;
}

export async function renameAssetCategory(oldName: string, newName: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.rename_doc", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Asset Category",
            old_name: oldName,
            new_name: newName,
            merge: false
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to rename asset category"));
    return json.message;
}

export async function getAssetCategory(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Asset Category&name=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error("Failed to fetch asset category details");
    return (await res.json()).message;
}

// Evaluation Trait Category APIs
export const fetchEvaluationTraitCategories = (params: any) => {
    const { search, ...restParams } = params;

    const or_filters = search ? [
        ["Evaluation Trait Category", "category_name", "like", `%${search}%`],
    ] : undefined;

    return fetchFrappeList("Evaluation Trait Category", {
        ...restParams,
        search: undefined,
        or_filters
    });
};

export async function createEvaluationTraitCategory(data: Partial<EvaluationTraitCategory>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({ doc: { doctype: "Evaluation Trait Category", ...data } })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create evaluation trait category"));
    return json.message;
}

export async function updateEvaluationTraitCategory(name: string, data: Partial<EvaluationTraitCategory>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Evaluation Trait Category", name, fieldname: data })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update evaluation trait category"));
    return json.message;
}

export async function deleteEvaluationTraitCategory(name: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Evaluation Trait Category", name })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete evaluation trait category"));
    return true;
}

export async function renameEvaluationTraitCategory(oldName: string, newName: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.rename_doc", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Evaluation Trait Category",
            old_name: oldName,
            new_name: newName,
            merge: false
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to rename evaluation trait category"));
    return json.message;
}

export async function getEvaluationTraitCategory(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Evaluation Trait Category&name=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error("Failed to fetch evaluation trait category details");
    return (await res.json()).message;
}

// Designation APIs
export const fetchDesignations = (params: any) => {
    const { search, ...restParams } = params;

    const or_filters = search ? [
        ["Designation", "designation_name", "like", `%${search}%`],
        ["Designation", "department", "like", `%${search}%`],
    ] : undefined;

    return fetchFrappeList("Designation", {
        ...restParams,
        search: undefined,
        or_filters
    });
};

export async function createDesignation(data: Partial<Designation>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({ doc: { doctype: "Designation", ...data } })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create designation"));
    return json.message;
}

export async function updateDesignation(name: string, data: Partial<Designation>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Designation", name, fieldname: data })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update designation"));
    return json.message;
}

export async function deleteDesignation(name: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Designation", name })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete designation"));
    return true;
}

export async function renameDesignation(oldName: string, newName: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.rename_doc", {
        method: "POST",
        headers,
        body: JSON.stringify({
            doctype: "Designation",
            old_name: oldName,
            new_name: newName,
            merge: false
        })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to rename designation"));
    return json.message;
}

export async function getDesignation(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Designation&name=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error("Failed to fetch designation details");
    return (await res.json()).message;
}

export interface SalaryStructureComponent {
    name: string;
    component_name: string;
    type?: 'Earning' | 'Deduction';
    is_default?: number;
    percentage?: number;
    static_amount?: number;
    creation?: string;
    modified?: string;
}

// Salary Structure Component APIs
export const fetchSalaryStructureComponents = (params: any) => {
    const { search, ...restParams } = params;

    const or_filters = search ? [
        ["Salary Structure Component", "component_name", "like", `%${search}%`],
    ] : undefined;

    return fetchFrappeList("Salary Structure Component", {
        ...restParams,
        search: undefined,
        or_filters
    });
};

export async function createSalaryStructureComponent(data: Partial<SalaryStructureComponent>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.insert", {
        method: "POST",
        headers,
        body: JSON.stringify({ doc: { doctype: "Salary Structure Component", ...data } })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to create salary structure component"));
    return json.message;
}

export async function updateSalaryStructureComponent(name: string, data: Partial<SalaryStructureComponent>) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.set_value", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Salary Structure Component", name, fieldname: data })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to update salary structure component"));
    return json.message;
}

export async function deleteSalaryStructureComponent(name: string) {
    const headers = await getAuthHeaders();
    const res = await frappeRequest("/api/method/frappe.client.delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ doctype: "Salary Structure Component", name })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(handleFrappeError(json, "Failed to delete salary structure component"));
    return true;
}

export async function getSalaryStructureComponent(name: string) {
    const res = await frappeRequest(`/api/method/frappe.client.get?doctype=Salary Structure Component&name=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error("Failed to fetch salary structure component details");
    return (await res.json()).message;
}
