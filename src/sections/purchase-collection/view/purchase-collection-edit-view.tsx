import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { getPurchaseCollection, PurchaseCollection } from 'src/api/purchase-collection';

import PurchaseCollectionNewEditForm from '../purchase-collection-new-edit-form';

// ----------------------------------------------------------------------

export function PurchaseCollectionEditView() {
    const params = useParams();
    const { id } = params;
    const router = useRouter();
    const formRef = useRef<any>(null);

    const [currentPurchaseCollection, setCurrentPurchaseCollection] = useState<PurchaseCollection>();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            getPurchaseCollection(id as string).then(setCurrentPurchaseCollection);
        }
    }, [id]);

    const handleSave = () => {
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
                <Typography variant="h4">
                    Edit Collection: {currentPurchaseCollection?.name}
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

            <PurchaseCollectionNewEditForm
                ref={formRef}
                currentPurchaseCollection={currentPurchaseCollection}
                onLoadingChange={setLoading}
            />
        </DashboardContent>
    );
}
