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

import { useEmployeeEvaluationPoints } from 'src/hooks/useEmployeeEvaluation';

import { EmployeeEvaluationTrait, createEmployeeEvaluationTrait, updateEmployeeEvaluationTrait } from 'src/api/employee-evaluation';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: VoidFunction;
    onSuccess: VoidFunction;
    selectedTrait?: EmployeeEvaluationTrait | null;
};

const CATEGORY_OPTIONS = ['Behavior', 'Collaboration', 'Communication', 'Attendance', 'Leadership'];

export function EmployeeEvaluationTraitFormDialog({ open, onClose, onSuccess, selectedTrait }: Props) {
    const { data: evaluationPoints } = useEmployeeEvaluationPoints();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<{
        trait_name: string;
        category: string;
        description: string;
        evaluation_scores: { evaluation_point: string; score: number }[];
    }>({
        trait_name: '',
        category: 'Behavior',
        description: '',
        evaluation_scores: [],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (selectedTrait) {
            setFormData({
                trait_name: selectedTrait.trait_name || '',
                category: selectedTrait.category || 'Behavior',
                description: selectedTrait.description || '',
                evaluation_scores: selectedTrait.evaluation_scores || [],
            });
        } else {
            setFormData({
                trait_name: '',
                category: 'Behavior',
                description: '',
                evaluation_scores: evaluationPoints.map(p => ({
                    evaluation_point: p.name,
                    score: p.default_score
                })),
            });
        }
    }, [selectedTrait, open, evaluationPoints]);

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
            };

            if (selectedTrait) {
                await updateEmployeeEvaluationTrait(selectedTrait.name, dataToSave);
            } else {
                await createEmployeeEvaluationTrait(dataToSave);
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
                {selectedTrait ? 'Edit Evaluation Trait' : 'New Evaluation Trait'}
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

                    <Typography variant="subtitle1" sx={{ mt: 2 }}>
                        Score Overrides (Optional)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Leave empty to use global default scores.
                    </Typography>

                    {evaluationPoints.map((point) => {
                        const scoreRow = formData.evaluation_scores.find(s => s.evaluation_point === point.name);
                        return (
                            <Stack key={point.name} direction="row" spacing={2} alignItems="center">
                                <Typography sx={{ minWidth: 100 }}>{point.point_name}</Typography>
                                <TextField
                                    size="small"
                                    type="number"
                                    placeholder={`Default: ${point.default_score}`}
                                    value={scoreRow?.score ?? ''}
                                    onChange={(e) => {
                                        const newScore = e.target.value === '' ? undefined : Number(e.target.value);
                                        let newScores = [...formData.evaluation_scores];
                                        if (newScore === undefined) {
                                            newScores = newScores.filter(s => s.evaluation_point !== point.name);
                                        } else {
                                            const existingIndex = newScores.findIndex(s => s.evaluation_point === point.name);
                                            if (existingIndex > -1) {
                                                newScores[existingIndex].score = newScore;
                                            } else {
                                                newScores.push({ evaluation_point: point.name, score: newScore });
                                            }
                                        }
                                        setFormData({ ...formData, evaluation_scores: newScores });
                                    }}
                                />
                            </Stack>
                        );
                    })}

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
