import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { PersonalityTrait, createPersonalityTrait, updatePersonalityTrait } from 'src/api/personality';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: VoidFunction;
    onSuccess: VoidFunction;
    selectedTrait?: PersonalityTrait | null;
};

const CATEGORY_OPTIONS = ['Behavior', 'Collaboration', 'Communication', 'Attendance', 'Leadership'];

export function PersonalityTraitFormDialog({ open, onClose, onSuccess, selectedTrait }: Props) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        trait_name: '',
        category: 'Behavior',
        description: '',
        reward_score: 2,
        penalty_score: 5,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (selectedTrait) {
            setFormData({
                trait_name: selectedTrait.trait_name || '',
                category: selectedTrait.category || 'Behavior',
                description: selectedTrait.description || '',
                reward_score: selectedTrait.reward_score || 0,
                penalty_score: selectedTrait.penalty_score || 0,
            });
        } else {
            setFormData({
                trait_name: '',
                category: 'Behavior',
                description: '',
                reward_score: 2,
                penalty_score: 5,
            });
        }
    }, [selectedTrait, open]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.trait_name) newErrors.trait_name = 'Trait Name is required';
        if (!formData.category) newErrors.category = 'Category is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const dataToSave = {
                ...formData,
                reward_score: Number(formData.reward_score) || 0,
                penalty_score: Number(formData.penalty_score) || 0,
            };

            if (selectedTrait) {
                await updatePersonalityTrait(selectedTrait.name, dataToSave);
            } else {
                await createPersonalityTrait(dataToSave);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {selectedTrait ? 'Edit Personality Trait' : 'New Personality Trait'}
                <IconButton onClick={onClose}>
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={3} sx={{ pt: 1 }}>
                    <TextField
                        fullWidth
                        label="Trait Name"
                        required
                        value={formData.trait_name}
                        onChange={(e) => {
                            setFormData({ ...formData, trait_name: e.target.value });
                            if (errors.trait_name) setErrors({ ...errors, trait_name: '' });
                        }}
                        error={!!errors.trait_name}
                        helperText={errors.trait_name}
                    />

                    <TextField
                        select
                        fullWidth
                        label="Category"
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        {CATEGORY_OPTIONS.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Stack direction="row" spacing={2}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Reward Score (+)"
                            value={formData.reward_score}
                            onChange={(e) => setFormData({ ...formData, reward_score: e.target.value as any })}
                            helperText="Points added on 'Agree'"
                        />
                        <TextField
                            fullWidth
                            type="number"
                            label="Penalty Score (-)"
                            value={formData.penalty_score}
                            onChange={(e) => setFormData({ ...formData, penalty_score: e.target.value as any })}
                            helperText="Points deducted on 'Disagree'"
                        />
                    </Stack>

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </Stack>
            </DialogContent>

            <DialogActions>
                <LoadingButton
                    variant="contained"
                    onClick={handleSave}
                    loading={loading}
                    sx={{ bgcolor: '#00A5D1', '&:hover': { bgcolor: '#0084a7' } }}
                >
                    {selectedTrait ? 'Update' : 'Create'}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
