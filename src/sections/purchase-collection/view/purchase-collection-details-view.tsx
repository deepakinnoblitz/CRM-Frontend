
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { getPurchaseCollection, PurchaseCollection } from 'src/api/purchase-collection';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function PurchaseCollectionDetailsView() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const [purchaseCollection, setPurchaseCollection] = useState<PurchaseCollection | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            setLoading(true);
            getPurchaseCollection(id as string)
                .then(setPurchaseCollection)
                .catch((err) => console.error('Failed to fetch purchase collection details:', err))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handleEdit = () => {
        router.push(`/purchase-collections/${id}/edit`);
    };

    const handleBack = () => {
        router.push('/purchase-collections');
    };

    if (loading) {
        return (
            <DashboardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                    <Iconify icon={"svg-spinners:12-dots-scale-rotate" as any} width={40} sx={{ color: 'primary.main' }} />
                </Box>
            </DashboardContent>
        );
    }

    if (!purchaseCollection) {
        return (
            <DashboardContent>
                <Box sx={{ py: 10, textAlign: 'center' }}>
                    <Iconify icon={"solar:ghost-bold" as any} width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>No Purchase Collection Found</Typography>
                </Box>
            </DashboardContent>
        );
    }

    return (
        <DashboardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Button
                    variant="outlined"
                    onClick={handleBack}
                    startIcon={<Iconify icon={"eva:arrow-ios-back-fill" as any} />}
                >
                    Back
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                    variant="contained"
                    startIcon={<Iconify icon="solar:pen-bold" />}
                    onClick={handleEdit}
                >
                    Edit
                </Button>
            </Stack>

            <Card sx={{ p: 4 }}>
                {/* Header Info */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, mb: 5 }}>
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'primary.lighter',
                            color: 'primary.main',
                        }}
                    >
                        <Iconify icon={"solar:file-check-bold" as any} width={32} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>{purchaseCollection.name}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Purchase: {purchaseCollection.purchase}</Typography>
                    </Box>
                </Box>

                <Divider sx={{ borderStyle: 'dashed', mb: 5 }} />

                {/* General Information */}
                <Box sx={{ mb: 5 }}>
                    <SectionHeader title="Collection Overview" icon="solar:info-circle-bold" />
                    <Box
                        sx={{
                            display: 'grid',
                            gap: 3,
                            gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                        }}
                    >
                        <DetailItem
                            label="Vendor"
                            value={purchaseCollection.vendor_name ? `${purchaseCollection.vendor_name} (${purchaseCollection.vendor})` : purchaseCollection.vendor}
                            icon="solar:user-bold"
                        />
                        <DetailItem
                            label="Date"
                            value={fDate(purchaseCollection.collection_date)}
                            icon="solar:calendar-bold"
                        />
                        <DetailItem
                            label="Mode of Payment"
                            value={purchaseCollection.mode_of_payment}
                            icon="solar:card-bold"
                        />
                    </Box>
                </Box>

                <Box>
                    <SectionHeader title="Financials" icon="solar:wad-of-money-bold" />
                    <Box
                        sx={{
                            display: 'grid',
                            gap: 3,
                            gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                        }}
                    >
                        <DetailItem
                            label="Amount Collected"
                            value={fCurrency(purchaseCollection.amount_collected)}
                            icon="solar:wad-of-money-bold"
                            color="success.main"
                        />
                        {/* We can add more fields if needed, like pending amount if available in the detailed API response */}
                    </Box>
                </Box>

                {purchaseCollection.remarks && (
                    <Box sx={{ mt: 5, p: 3, bgcolor: 'background.neutral', borderRadius: 2 }}>
                        <SectionHeader title="Remarks" icon="solar:document-text-bold" noMargin />
                        <Typography variant="body2" sx={{ mt: 2, color: 'text.primary', fontWeight: 600 }}>
                            {purchaseCollection.remarks}
                        </Typography>
                    </Box>
                )}

            </Card>
        </DashboardContent>
    );
}

function SectionHeader({ title, icon, noMargin = false }: { title: string; icon: string, noMargin?: boolean }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: noMargin ? 0 : 2.5 }}>
            <Iconify icon={icon as any} width={20} sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {title}
            </Typography>
        </Box>
    );
}

function DetailItem({ label, value, icon, color = 'text.primary' }: { label: string; value?: string | null | number; icon: string; color?: string }) {
    return (
        <Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                {label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon={icon as any} width={16} sx={{ color: 'text.disabled' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color }}>
                    {value || '-'}
                </Typography>
            </Box>
        </Box>
    );
}
