import React, { useEffect, useState } from 'react';
import {
    Grid,
    TextField,
    MenuItem,
    Typography,
    Autocomplete,
    CircularProgress
} from '@mui/material';
import { ItemAspect, getItemAspectsForCategory, organizeAspects } from '../services/ebayTaxonomy';

interface ItemSpecificsFormProps {
    categoryId: string;
    onChange: (specifics: Record<string, string>) => void;
    initialValues?: Record<string, string>;
}

export default function ItemSpecificsForm({ categoryId, onChange, initialValues = {} }: ItemSpecificsFormProps) {
    const [loading, setLoading] = useState(true);
    const [aspects, setAspects] = useState<{
        required: ItemAspect[];
        recommended: ItemAspect[];
        optional: ItemAspect[];
    }>({
        required: [],
        recommended: [],
        optional: []
    });
    const [values, setValues] = useState<Record<string, string>>(initialValues);

    useEffect(() => {
        async function fetchAspects() {
            try {
                const response = await getItemAspectsForCategory(categoryId);
                setAspects(organizeAspects(response.aspects));
            } catch (error) {
                console.error('Failed to fetch aspects:', error);
            } finally {
                setLoading(false);
            }
        }

        if (categoryId) {
            fetchAspects();
        }
    }, [categoryId]);

    const handleChange = (aspect: ItemAspect) => (
        event: React.ChangeEvent<HTMLInputElement> | null,
        newValue: string | null
    ) => {
        const newValues = {
            ...values,
            [aspect.localizedAspectName]: newValue || ''
        };
        setValues(newValues);
        onChange(newValues);
    };

    if (loading) {
        return <CircularProgress />;
    }

    const renderAspectField = (aspect: ItemAspect) => {
        const value = values[aspect.localizedAspectName] || '';
        const isRequired = aspect.aspectConstraint.aspectRequired;

        if (aspect.aspectMode === 'SELECTION_ONLY' && aspect.aspectValues) {
            return (
                <Autocomplete
                    value={value}
                    onChange={handleChange(aspect)}
                    options={aspect.aspectValues.map(av => av.value)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={aspect.localizedAspectName}
                            required={isRequired}
                            helperText={isRequired ? 'Required' : 'Recommended'}
                        />
                    )}
                />
            );
        }

        return (
            <TextField
                fullWidth
                label={aspect.localizedAspectName}
                value={value}
                onChange={(e) => handleChange(aspect)(e, e.target.value)}
                required={isRequired}
                helperText={isRequired ? 'Required' : 'Recommended'}
            />
        );
    };

    return (
        <Grid container spacing={3}>
            {/* Required Aspects */}
            {aspects.required.length > 0 && (
                <>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" color="primary">
                            Required Specifications
                        </Typography>
                    </Grid>
                    {aspects.required.map((aspect) => (
                        <Grid item xs={12} sm={6} key={aspect.localizedAspectName}>
                            {renderAspectField(aspect)}
                        </Grid>
                    ))}
                </>
            )}

            {/* Recommended Aspects */}
            {aspects.recommended.length > 0 && (
                <>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" color="primary" sx={{ mt: 2 }}>
                            Recommended Specifications
                        </Typography>
                    </Grid>
                    {aspects.recommended.map((aspect) => (
                        <Grid item xs={12} sm={6} key={aspect.localizedAspectName}>
                            {renderAspectField(aspect)}
                        </Grid>
                    ))}
                </>
            )}

            {/* Optional Aspects */}
            {aspects.optional.length > 0 && (
                <>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" color="primary" sx={{ mt: 2 }}>
                            Optional Specifications
                        </Typography>
                    </Grid>
                    {aspects.optional.map((aspect) => (
                        <Grid item xs={12} sm={6} key={aspect.localizedAspectName}>
                            {renderAspectField(aspect)}
                        </Grid>
                    ))}
                </>
            )}
        </Grid>
    );
}
