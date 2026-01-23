import { frappeRequest } from 'src/utils/csrf';
import { handleFrappeError } from 'src/utils/api-error-handler';

export interface DocField {
    fieldname: string;
    label: string;
    fieldtype: string;
    options?: string;
    hidden?: number;
}

export interface DocTypeMeta {
    name: string;
    fields: DocField[];
}

export async function getDoctypeMeta(doctype: string): Promise<DocTypeMeta> {
    const res = await frappeRequest(`/api/method/company.company.frontend_api.get_doctype_fields?doctype=${doctype}`);

    if (!res.ok) {
        const error = await res.json();
        throw new Error(handleFrappeError(error, `Failed to fetch doctype meta for ${doctype}`));
    }

    const json = await res.json();
    console.log('getDoctypeMeta raw response:', json);
    const doc = json.message;
    console.log('getDoctypeMeta raw doc:', doc);

    return {
        name: doc.name,
        fields: doc.fields
    };
}
