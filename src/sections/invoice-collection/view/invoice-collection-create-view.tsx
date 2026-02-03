import { useRef, useState } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import InvoiceCollectionNewEditForm from '../invoice-collection-new-edit-form';

// ----------------------------------------------------------------------

export function InvoiceCollectionCreateView() {
    const router = useRouter();
    const formRef = useRef<any>(null);
    const [loading, setLoading] = useState(false);

    const handleCreate = () => {
        if (formRef.current) {
            formRef.current.handleSubmit();
        }
    };

    const handleCancel = () => {
        router.push('/deals?tab=invoices&subtab=collections');
    };

    return (
        <DashboardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Typography variant="h4">Create New Invoice Collection</Typography>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCreate}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Collection'}
                    </Button>
                </Stack>
            </Stack>

            <InvoiceCollectionNewEditForm
                ref={formRef}
                onLoadingChange={setLoading}
            />
        </DashboardContent>
    );
}
