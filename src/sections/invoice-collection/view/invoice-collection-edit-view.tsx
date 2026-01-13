import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { getInvoiceCollection, InvoiceCollection } from 'src/api/invoice-collection';

import InvoiceCollectionNewEditForm from '../invoice-collection-new-edit-form';

// ----------------------------------------------------------------------

export default function InvoiceCollectionEditView() {
    const params = useParams();
    const { id } = params;
    const router = useRouter();
    const formRef = useRef<any>(null);

    const [currentInvoiceCollection, setCurrentInvoiceCollection] = useState<InvoiceCollection>();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            getInvoiceCollection(id as string).then(setCurrentInvoiceCollection);
        }
    }, [id]);

    const handleSave = () => {
        if (formRef.current) {
            formRef.current.handleSubmit();
        }
    };

    const handleCancel = () => {
        router.push('/invoice-collections');
    };

    return (
        <DashboardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Typography variant="h4">
                    Edit Collection: {currentInvoiceCollection?.name}
                </Typography>
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
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Stack>
            </Stack>

            <InvoiceCollectionNewEditForm
                ref={formRef}
                currentInvoiceCollection={currentInvoiceCollection}
                onLoadingChange={setLoading}
            />
        </DashboardContent>
    );
}
