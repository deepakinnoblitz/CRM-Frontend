import { useState, useRef } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import PurchaseCollectionNewEditForm from '../purchase-collection-new-edit-form';

// ----------------------------------------------------------------------

export function PurchaseCollectionCreateView() {
    const router = useRouter();
    const formRef = useRef<any>(null);
    const [loading, setLoading] = useState(false);

    const handleCreate = () => {
        if (formRef.current) {
            formRef.current.handleSubmit();
        }
    };

    const handleCancel = () => {
        router.push('/purchase-collections');
    };

    return (
        <DashboardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Typography variant="h4">Create New Purchase Collection</Typography>
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

            <PurchaseCollectionNewEditForm
                ref={formRef}
                onLoadingChange={setLoading}
            />
        </DashboardContent>
    );
}
