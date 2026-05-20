import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { IoMdArrowBack } from 'react-icons/io';
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import TableContainer from '@mui/material/TableContainer';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CircularProgress from '@mui/material/CircularProgress';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useRouter } from 'src/routes/hooks';

import { getContact } from 'src/api/contacts';
import { getDoctypeList } from 'src/api/leads';
import { uploadFile } from 'src/api/data-import';
import { createProposal } from 'src/api/proposal';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = ['Draft', 'Sent', 'Approved', 'Rejected', 'Expired'];

type AttachmentRow = {
    attachment: string | File | null;
    description: string;
    file_name: string;
    file_size: string;
    uploaded_on: string;
    uploaded_by: string;
    _localFile?: File;
    _preview?: string;
};

function createEmptyAttachment(): AttachmentRow {
    return {
        attachment: null,
        description: '',
        file_name: '',
        file_size: '',
        uploaded_on: '',
        uploaded_by: '',
    };
}

// ----------------------------------------------------------------------

export function ProposalCreateView() {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const [searchParams] = useSearchParams();
    const prospectIdParam = searchParams.get('prospect_id');
    const clientIdParam = searchParams.get('client_id');

    // Form state
    const [proposalTitle, setProposalTitle] = useState('');
    const [clientName, setClientName] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [billingName, setBillingName] = useState('');
    const [billingNameOptions, setBillingNameOptions] = useState<
        { name: string; account_name: string }[]
    >([]);
    const [prospect, setProspect] = useState(prospectIdParam || '');
    const [proposalDate, setProposalDate] = useState(new Date().toISOString().split('T')[0]);
    const [validUntil, setValidUntil] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [termsAndConditions, setTermsAndConditions] = useState('');
    const [status, setStatus] = useState('Draft');

    // Attachment table state
    const [attachments, setAttachments] = useState<AttachmentRow[]>([createEmptyAttachment()]);

    // Options
    const [customerOptions, setCustomerOptions] = useState<any[]>([]);
    const [prospectOptions, setProspectOptions] = useState<any[]>([]);

    // Loading
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Validation
    const [titleError, setTitleError] = useState(false);
    const [clientError, setClientError] = useState(false);

    // File input ref per row
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        getDoctypeList('Contacts', ['name', 'first_name', 'company_name'])
            .then(setCustomerOptions)
            .catch(console.error);

        getDoctypeList('Deal', ['name', 'deal_title'])
            .then(setProspectOptions)
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (clientIdParam && customerOptions.length > 0) {
            handleCustomerChange(clientIdParam);
        }
    }, [clientIdParam, customerOptions]);

    const handleCustomerChange = async (name: string) => {
        setClientName(name);
        setClientError(false);
        if (name) {
            try {
                const contact = await getContact(name);
                setCustomerName(contact.first_name || '');
                const mappedOptions =
                    contact.company_names?.map((id: string, idx: number) => ({
                        name: id,
                        account_name: contact.company_name_list?.[idx] || id,
                    })) || [];
                setBillingNameOptions(mappedOptions);
                if (mappedOptions.length === 1) {
                    setBillingName(mappedOptions[0].name);
                } else {
                    setBillingName('');
                }
            } catch (err) {
                console.error('Failed to fetch contact details:', err);
            }
        } else {
            setCustomerName('');
            setBillingName('');
            setBillingNameOptions([]);
        }
    };

    // ---- Attachment Table Handlers ----

    const handleAddAttachmentRow = () => {
        setAttachments((prev) => [...prev, createEmptyAttachment()]);
    };

    const handleRemoveAttachmentRow = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAttachmentChange = (
        index: number,
        field: keyof AttachmentRow,
        value: any
    ) => {
        setAttachments((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleFileSelect = (index: number, file: File) => {
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const preview = URL.createObjectURL(file);
        const sizeFmt =
            file.size < 1024
                ? `${file.size} B`
                : file.size < 1024 * 1024
                ? `${(file.size / 1024).toFixed(1)} KB`
                : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

        setAttachments((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                _localFile: file,
                _preview: preview,
                file_name: file.name,
                file_size: sizeFmt,
                uploaded_on: now,
                attachment: file.name,
            };
            return updated;
        });
    };

    const handlePreviewAttachment = (row: AttachmentRow) => {
        if (row._preview) {
            window.open(row._preview, '_blank');
        } else if (typeof row.attachment === 'string' && row.attachment) {
            window.open(row.attachment, '_blank');
        }
    };

    const handleDownloadAttachment = (row: AttachmentRow) => {
        if (row._localFile) {
            const url = URL.createObjectURL(row._localFile);
            const a = document.createElement('a');
            a.href = url;
            a.download = row.file_name || 'attachment';
            a.click();
            URL.revokeObjectURL(url);
        } else if (typeof row.attachment === 'string' && row.attachment) {
            const a = document.createElement('a');
            a.href = row.attachment;
            a.download = row.file_name || 'attachment';
            a.click();
        }
    };

    // ---- Save ----

    const handleSave = async () => {
        let hasError = false;
        if (!proposalTitle.trim()) {
            setTitleError(true);
            hasError = true;
        }
        if (!clientName) {
            setClientError(true);
            hasError = true;
        }
        if (hasError) {
            enqueueSnackbar('Please fill all required fields', { variant: 'error' });
            return;
        }

        try {
            setLoading(true);

            // Upload files
            const uploadedAttachments: any[] = [];
            for (const row of attachments) {
                if (row._localFile) {
                    setUploading(true);
                    try {
                        const uploaded = await uploadFile(row._localFile);
                        uploadedAttachments.push({
                            attachment: uploaded.file_url,
                            description: row.description,
                            file_name: row.file_name,
                            file_size: row.file_size,
                            uploaded_on: row.uploaded_on,
                        });
                    } finally {
                        setUploading(false);
                    }
                } else if (typeof row.attachment === 'string' && row.attachment) {
                    uploadedAttachments.push({
                        attachment: row.attachment,
                        description: row.description,
                        file_name: row.file_name,
                        file_size: row.file_size,
                        uploaded_on: row.uploaded_on,
                    });
                }
            }

            const payload: any = {
                proposal_title: proposalTitle,
                client_name: clientName,
                customer_name: customerName,
                billing_name: billingName || undefined,
                prospect: prospect || undefined,
                proposal_date: proposalDate,
                valid_until: validUntil || undefined,
                subject: subject || undefined,
                description: description || undefined,
                terms_and_conditions: termsAndConditions || undefined,
                status,
                attachments_table: uploadedAttachments,
            };

            const result = await createProposal(payload);
            enqueueSnackbar('Proposal created successfully', { variant: 'success' });
            setTimeout(() => router.push(`/proposals/${encodeURIComponent(result.name)}/view`), 1200);
        } catch (err: any) {
            enqueueSnackbar(err.message || 'Failed to create proposal', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardContent maxWidth="xl">
            {/* Header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5} mt={3}>
                <Stack spacing={0.5}>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        New Proposal
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Fill in the details to create a new proposal
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => router.push('/proposals')}
                        startIcon={<IoMdArrowBack size={20} />}
                        sx={{
                            borderRadius: 1.5,
                            fontWeight: 600,
                            textTransform: 'none',
                            px: 2.5,
                        }}
                    >
                        Go Back
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={loading || uploading}
                        sx={{
                            borderRadius: 1.5,
                            bgcolor: '#08a3cd',
                            color: 'common.white',
                            '&:hover': { bgcolor: '#068fb3' },
                        }}
                    >
                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Proposal'}
                    </Button>
                </Stack>
            </Stack>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                {/* Main Details Card */}
                <Card sx={{ p: 4, mb: 3 }}>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            mb: 3,
                            fontWeight: 700,
                            color: 'text.secondary',
                            textTransform: 'uppercase',
                            fontSize: 12,
                            letterSpacing: 1,
                        }}
                    >
                        Proposal Details
                    </Typography>

                    <Box
                        sx={{
                            display: 'grid',
                            columnGap: 3,
                            rowGap: 3,
                            gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                        }}
                    >
                        {/* Proposal Title */}
                        <TextField
                            fullWidth
                            label="Proposal Title"
                            required
                            value={proposalTitle}
                            onChange={(e) => {
                                setProposalTitle(e.target.value);
                                if (e.target.value) setTitleError(false);
                            }}
                            error={titleError}
                            helperText={titleError ? 'Proposal title is required' : ''}
                            sx={{ gridColumn: { sm: 'span 2' } }}
                        />

                        {/* Client */}
                        <Autocomplete
                            fullWidth
                            options={customerOptions}
                            getOptionLabel={(opt) =>
                                opt.first_name ? `${opt.first_name} (${opt.name})` : opt.name || ''
                            }
                            value={customerOptions.find((o) => o.name === clientName) || null}
                            onChange={(_e, val) => handleCustomerChange(val?.name || '')}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Client"
                                    required
                                    error={clientError}
                                    helperText={clientError ? 'Please select a client' : ''}
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props} key={option.name}>
                                    <Stack spacing={0.5} sx={{ py: 0.5 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            {option.first_name || option.name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            ID: {option.name}
                                        </Typography>
                                    </Stack>
                                </li>
                            )}
                        />

                        {/* Customer Name (auto-filled) */}
                        <TextField
                            fullWidth
                            label="Customer Name"
                            value={customerName}
                            slotProps={{ input: { readOnly: true } }}
                            sx={{ bgcolor: (t) => alpha(t.palette.grey[500], 0.05) }}
                        />

                        {/* Billing Name */}
                        <Autocomplete
                            fullWidth
                            options={billingNameOptions}
                            getOptionLabel={(opt) => opt.account_name || opt.name || ''}
                            value={
                                billingNameOptions.find((o) => o.name === billingName) || null
                            }
                            onChange={(_e, val) => setBillingName(val?.name || '')}
                            renderInput={(params) => (
                                <TextField {...params} label="Billing Name" />
                            )}
                            renderOption={(props, option) => (
                                <li {...props} key={option.name}>
                                    <Stack spacing={0.5} sx={{ py: 0.5 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            {option.account_name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            ID: {option.name}
                                        </Typography>
                                    </Stack>
                                </li>
                            )}
                        />

                        {/* Prospect (Deal) */}
                        <Autocomplete
                            fullWidth
                            options={prospectOptions}
                            getOptionLabel={(opt) =>
                                opt.deal_title ? `${opt.deal_title} (${opt.name})` : opt.name || ''
                            }
                            value={prospectOptions.find((o) => o.name === prospect) || null}
                            onChange={(_e, val) => setProspect(val?.name || '')}
                            renderInput={(params) => (
                                <TextField {...params} label="Prospect" />
                            )}
                        />

                        {/* Proposal Date */}
                        <DatePicker
                            label="Proposal Date *"
                            value={dayjs(proposalDate)}
                            onChange={(val) =>
                                setProposalDate(val?.format('YYYY-MM-DD') || '')
                            }
                            slotProps={{ textField: { fullWidth: true, InputLabelProps: { shrink: true } } }}
                        />

                        {/* Valid Until */}
                        <DatePicker
                            label="Valid Until"
                            value={validUntil ? dayjs(validUntil) : null}
                            onChange={(val) =>
                                setValidUntil(val?.format('YYYY-MM-DD') || '')
                            }
                            slotProps={{
                                textField: { fullWidth: true, InputLabelProps: { shrink: true } },
                                field: { clearable: true, onClear: () => setValidUntil('') },
                            }}
                        />

                        {/* Subject */}
                        <TextField
                            fullWidth
                            label="Subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />

                        {/* Status */}
                        <TextField
                            fullWidth
                            label="Status"
                            select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <MenuItem key={s} value={s}>
                                    {s}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Description */}
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            sx={{ gridColumn: { sm: 'span 2' } }}
                        />
                    </Box>
                </Card>

                {/* Terms & Conditions Card */}
                <Card sx={{ p: 4, mb: 3 }}>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            mb: 3,
                            fontWeight: 700,
                            color: 'text.secondary',
                            textTransform: 'uppercase',
                            fontSize: 12,
                            letterSpacing: 1,
                        }}
                    >
                        Terms & Conditions
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={6}
                        label="Terms and Conditions"
                        value={termsAndConditions}
                        onChange={(e) => setTermsAndConditions(e.target.value)}
                        placeholder="Enter terms and conditions for this proposal..."
                    />
                </Card>

                {/* Attachments Card */}
                <Card sx={{ p: 4, mb: 3 }}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        mb={3}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 700,
                                color: 'text.secondary',
                                textTransform: 'uppercase',
                                fontSize: 12,
                                letterSpacing: 1,
                            }}
                        >
                            Attachments ({attachments.filter((a) => a.attachment).length})
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                            onClick={handleAddAttachmentRow}
                            sx={{ borderRadius: 1.5 }}
                        >
                            Add Row
                        </Button>
                    </Stack>

                    <TableContainer
                        sx={{
                            border: (t) => `1px solid ${t.palette.divider}`,
                            borderRadius: 1.5,
                            overflow: 'auto',
                        }}
                    >
                        <Table sx={{ minWidth: 800 }}>
                            <TableHead
                                sx={{
                                    bgcolor: (t) => alpha(t.palette.grey[500], 0.08),
                                    '& th': { fontWeight: 700, fontSize: 13 },
                                }}
                            >
                                <TableRow>
                                    <TableCell width={40} align="center">
                                        S.No
                                    </TableCell>
                                    <TableCell>Attachment</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>File Name</TableCell>
                                    <TableCell>File Size</TableCell>
                                    <TableCell>Uploaded On</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {attachments.map((row, index) => (
                                    <TableRow
                                        key={index}
                                        sx={{
                                            '&:hover': {
                                                bgcolor: (t) =>
                                                    alpha(t.palette.primary.main, 0.02),
                                            },
                                        }}
                                    >
                                        <TableCell align="center">
                                            <Box
                                                sx={{
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: '50%',
                                                    bgcolor: (t) =>
                                                        alpha(t.palette.primary.main, 0.1),
                                                    color: 'primary.main',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    mx: 'auto',
                                                }}
                                            >
                                                {index + 1}
                                            </Box>
                                        </TableCell>

                                        {/* Attachment Upload */}
                                        <TableCell>
                                            <input
                                                type="file"
                                                style={{ display: 'none' }}
                                                ref={(el) => {
                                                    fileInputRefs.current[index] = el;
                                                }}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleFileSelect(index, file);
                                                    e.target.value = '';
                                                }}
                                            />
                                            {row._localFile || (typeof row.attachment === 'string' && row.attachment) ? (
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Chip
                                                        label={row.file_name || 'File'}
                                                        size="small"
                                                        color="success"
                                                        icon={
                                                            <Iconify
                                                                icon={"solar:file-bold" as any}
                                                                width={14}
                                                            />
                                                        }
                                                        sx={{ maxWidth: 150 }}
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                            fileInputRefs.current[index]?.click()
                                                        }
                                                        title="Change file"
                                                    >
                                                        <Iconify icon="solar:refresh-bold" width={14} />
                                                    </IconButton>
                                                </Stack>
                                            ) : (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<Iconify icon="solar:upload-bold" width={14} />}
                                                    onClick={() =>
                                                        fileInputRefs.current[index]?.click()
                                                    }
                                                    sx={{ fontSize: 12, borderRadius: 1 }}
                                                >
                                                    Upload File
                                                </Button>
                                            )}
                                        </TableCell>

                                        {/* Description */}
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                placeholder="Description..."
                                                value={row.description}
                                                onChange={(e) =>
                                                    handleAttachmentChange(
                                                        index,
                                                        'description',
                                                        e.target.value
                                                    )
                                                }
                                                variant="standard"
                                                InputProps={{ disableUnderline: true, sx: { fontSize: 13 } }}
                                                fullWidth
                                            />
                                        </TableCell>

                                        {/* File Name (read only) */}
                                        <TableCell>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12 }}>
                                                {row.file_name || '—'}
                                            </Typography>
                                        </TableCell>

                                        {/* File Size (read only) */}
                                        <TableCell>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12 }}>
                                                {row.file_size || '—'}
                                            </Typography>
                                        </TableCell>

                                        {/* Uploaded On (read only) */}
                                        <TableCell>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12 }}>
                                                {row.uploaded_on || '—'}
                                            </Typography>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell align="center">
                                            <Stack
                                                direction="row"
                                                spacing={0.5}
                                                justifyContent="center"
                                            >
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handlePreviewAttachment(row)}
                                                    sx={{ color: 'info.main' }}
                                                    disabled={!row.attachment}
                                                    title="Preview"
                                                >
                                                    <Iconify icon="solar:eye-bold" width={16} />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDownloadAttachment(row)}
                                                    sx={{ color: 'success.main' }}
                                                    disabled={!row.attachment}
                                                    title="Download"
                                                >
                                                    <Iconify icon="solar:download-bold" width={16} />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveAttachmentRow(index)}
                                                    sx={{ color: 'error.main' }}
                                                    title="Delete row"
                                                >
                                                    <Iconify
                                                        icon="solar:trash-bin-trash-bold"
                                                        width={16}
                                                    />
                                                </IconButton>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {attachments.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                                No attachments added. Click &quot;Add Row&quot; to start.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </LocalizationProvider>
        </DashboardContent>
    );
}
