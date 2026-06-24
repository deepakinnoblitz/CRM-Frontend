import { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    IoMdArrowBack, IoMdSettings, IoMdCalendar, IoMdCreate
} from "react-icons/io";

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { frappeRequest } from 'src/utils/csrf';

import { DashboardContent } from 'src/layouts/dashboard';
import { getWhatsAppTemplate } from 'src/api/whatsapp-template';
import { getWhatsAppAutomation } from 'src/api/whatsapp-automation';

import { Iconify } from 'src/components/iconify';

export function WhatsAppAutomationsDetailsView() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [automation, setAutomation] = useState<any>(null);
    const [templateName, setTemplateName] = useState<string>('');
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (id) {
            getWhatsAppAutomation(id)
                .then((data) => {
                    setAutomation(data);
                    if (data.whatsapp_template) {
                        getWhatsAppTemplate(data.whatsapp_template)
                            .then((templateData) => setTemplateName(templateData.template_name || templateData.name))
                            .catch(() => setTemplateName(data.whatsapp_template));
                    }
                    
                    // Fallback to explicitly fetch conditions child table if missing
                    if (!data.conditions || data.conditions.length === 0) {
                        frappeRequest(`/api/method/frappe.client.get_list?doctype=CRM WhatsApp Automation Condition&filters=${encodeURIComponent(JSON.stringify({ parent: id }))}&fields=${encodeURIComponent(JSON.stringify(['name', 'field_name', 'operator', 'value']))}`)
                            .then(res => res.json())
                            .then(resData => {
                                if (resData.message && Array.isArray(resData.message)) {
                                    setAutomation((prev: any) => prev ? { ...prev, conditions: resData.message } : prev);
                                }
                            })
                            .catch(err => console.error('Failed to fetch conditions:', err));
                    }
                })
                .catch((err) => console.error('Failed to fetch automation details:', err))
                .finally(() => setFetching(false));
        }
    }, [id]);

    if (fetching) {
        return (
            <DashboardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <CircularProgress />
            </DashboardContent>
        );
    }

    if (!automation) {
        return (
            <DashboardContent maxWidth={false}>
                <Typography variant="h4">Automation not found</Typography>
                <Button onClick={() => navigate(-1)} sx={{ mt: 3 }}>
                    Go back to list
                </Button>
            </DashboardContent>
        );
    }

    const {
        automation_name,
        description,
        is_active,
        document_type,
        trigger_event,
        workflow_state,
        previous_workflow_state,
        deal_stage,
        previous_deal_stage,
        show_confirmation_dialog,
        dialog_title,
        dialog_message,
        auto_send,
        conditions,
    } = automation;

    return (
        <DashboardContent maxWidth={false}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5} mt={3}>
                <Typography variant="h4">Automation: {automation_name || id}</Typography>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => navigate(-1)}
                        startIcon={<IoMdArrowBack size={20} />}
                        sx={{
                            borderRadius: 1.5,
                            fontWeight: 600,
                            textTransform: 'none',
                            px: 2.5,
                            '&:hover': {
                                bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
                                borderColor: 'text.primary',
                            }
                        }}
                    >
                        Go Back
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => navigate(`/whatsapp-automation/${encodeURIComponent(id || '')}/edit`)}
                        startIcon={<IoMdCreate size={20} />}
                        sx={{
                            borderRadius: 1.5,
                            fontWeight: 600,
                            textTransform: 'none',
                            bgcolor: '#08a3cd',
                            color: 'common.white',
                            '&:hover': { bgcolor: '#068fb3' }
                        }}
                    >
                        Edit
                    </Button>
                </Stack>
            </Stack>

            <Card sx={{ p: 4, borderRadius: 2 }}>
                <Box
                    sx={{
                        display: 'grid',
                        columnGap: 4,
                        rowGap: 4,
                        gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
                    }}
                >
                    {/* Basic Information */}
                    <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                            <IoMdSettings size={20} />
                            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Basic Information</Typography>
                        </Stack>
                        <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
                            <Stack spacing={1.5}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Automation Name</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{automation_name || '-'}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Description</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold', textAlign: 'right', maxWidth: '60%' }}>{description || '-'}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Is Active</Typography>
                                    <Chip label={is_active ? 'Yes' : 'No'} size="small" color={is_active ? 'success' : 'default'} sx={{ borderRadius: 1 }} />
                                </Stack>
                            </Stack>
                        </Box>
                    </Stack>

                    {/* WhatsApp Configuration */}
                    <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                            <FaWhatsapp size={20} />
                            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>WhatsApp Configuration</Typography>
                        </Stack>
                        <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
                            <Stack spacing={1.5}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">WhatsApp Template</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{templateName || '-'}</Typography>
                                </Stack>
                            </Stack>
                        </Box>
                    </Stack>

                    {/* Trigger Configuration */}
                    <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                            <IoMdCalendar size={20} />
                            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Trigger Configuration</Typography>
                        </Stack>
                        <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
                            <Stack spacing={1.5}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Document Type</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{document_type || '-'}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Trigger Event</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{trigger_event || '-'}</Typography>
                                </Stack>
                                {trigger_event === 'Lead Workflow State Change' && (
                                    <>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="caption" color="text.disabled">Workflow State</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{workflow_state || '-'}</Typography>
                                        </Stack>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="caption" color="text.disabled">Previous Workflow State</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{previous_workflow_state || '-'}</Typography>
                                        </Stack>
                                    </>
                                )}
                                {trigger_event === 'Deal Stage Change' && (
                                    <>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="caption" color="text.disabled">Current Deal Stage</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{deal_stage || '-'}</Typography>
                                        </Stack>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="caption" color="text.disabled">Previous Deal Stage</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{previous_deal_stage || '-'}</Typography>
                                        </Stack>
                                    </>
                                )}
                            </Stack>
                        </Box>
                    </Stack>

                    {/* Execution Settings */}
                    <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                            <Iconify icon={"solar:programming-bold" as any} width={20} />
                            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Execution Settings</Typography>
                        </Stack>
                        <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
                            <Stack spacing={1.5}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Show Confirmation Dialog</Typography>
                                    <Chip label={show_confirmation_dialog ? 'Yes' : 'No'} size="small" color={show_confirmation_dialog ? 'info' : 'default'} sx={{ borderRadius: 1 }} />
                                </Stack>
                                {show_confirmation_dialog && (
                                    <>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="caption" color="text.disabled">Dialog Title</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{dialog_title || '-'}</Typography>
                                        </Stack>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="caption" color="text.disabled">Dialog Message</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold', textAlign: 'right', maxWidth: '60%' }}>{dialog_message || '-'}</Typography>
                                        </Stack>
                                    </>
                                )}
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Auto Send</Typography>
                                    <Chip label={auto_send ? 'Yes' : 'No'} size="small" color={auto_send ? 'success' : 'default'} sx={{ borderRadius: 1 }} />
                                </Stack>
                            </Stack>
                        </Box>
                    </Stack>

                    {/* Conditions */}
                    <Stack spacing={1.5} sx={{ gridColumn: { xs: 'span 1', md: 'span 2' } }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                            <Iconify icon="solar:users-group-rounded-bold" width={20} />
                            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Conditions</Typography>
                        </Stack>
                        <Box sx={{ borderRadius: 1.5, border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}`, overflow: 'hidden' }}>
                            {conditions && conditions.length > 0 ? (
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04) }}>
                                        <TableRow>
                                            <TableCell width={60}>No.</TableCell>
                                            <TableCell>Field</TableCell>
                                            <TableCell>Operator</TableCell>
                                            <TableCell>Value</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {conditions.map((cond: any, index: number) => (
                                            <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell sx={{ fontWeight: 'fontWeightSemiBold' }}>{cond.field_name}</TableCell>
                                                <TableCell><Chip size="small" label={cond.operator} sx={{ borderRadius: 1 }} /></TableCell>
                                                <TableCell>{cond.value}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">No conditions added</Typography>
                                </Box>
                            )}
                        </Box>
                    </Stack>
                </Box>
            </Card>
        </DashboardContent>
    );
}
