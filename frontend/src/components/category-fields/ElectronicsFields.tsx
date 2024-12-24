import React from 'react';
import { Grid, TextField, Autocomplete, Chip } from '@mui/material';
import { ElectronicsProduct } from '../../types/CategoryFields';

interface ElectronicsFieldsProps {
    data: Partial<ElectronicsProduct>;
    onChange: (field: string, value: any) => void;
}

const powerSourceOptions = [
    'Battery',
    'AC Adapter',
    'USB',
    'Solar',
    'Wireless Charging',
    'Other'
];

export default function ElectronicsFields({ data, onChange }: ElectronicsFieldsProps) {
    const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(field, event.target.value);
    };

    const handleArrayChange = (field: string) => (_: any, values: string[]) => {
        onChange(field, values);
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="Model"
                    value={data.model || ''}
                    onChange={handleChange('model')}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    select
                    label="Power Source"
                    value={data.powerSource || ''}
                    onChange={handleChange('powerSource')}
                    SelectProps={{
                        native: true
                    }}
                >
                    <option value=""></option>
                    {powerSourceOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </TextField>
            </Grid>
            <Grid item xs={12}>
                <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={data.features || []}
                    onChange={handleArrayChange('features')}
                    renderTags={(value: string[], getTagProps) =>
                        value.map((option: string, index: number) => (
                            <Chip
                                variant="outlined"
                                label={option}
                                {...getTagProps({ index })}
                            />
                        ))
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Features"
                            placeholder="Add feature and press Enter"
                            helperText="Add key features of the product"
                        />
                    )}
                />
            </Grid>
            <Grid item xs={12}>
                <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={data.connectivity || []}
                    onChange={handleArrayChange('connectivity')}
                    renderTags={(value: string[], getTagProps) =>
                        value.map((option: string, index: number) => (
                            <Chip
                                variant="outlined"
                                label={option}
                                {...getTagProps({ index })}
                            />
                        ))
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Connectivity"
                            placeholder="Add connectivity options"
                            helperText="e.g., Bluetooth, Wi-Fi, USB-C"
                        />
                    )}
                />
            </Grid>
            <Grid item xs={12}>
                <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={data.compatibility || []}
                    onChange={handleArrayChange('compatibility')}
                    renderTags={(value: string[], getTagProps) =>
                        value.map((option: string, index: number) => (
                            <Chip
                                variant="outlined"
                                label={option}
                                {...getTagProps({ index })}
                            />
                        ))
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Compatibility"
                            placeholder="Add compatible devices/systems"
                            helperText="e.g., iOS, Android, Windows"
                        />
                    )}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Warranty"
                    value={data.warranty || ''}
                    onChange={handleChange('warranty')}
                    helperText="Describe the warranty terms"
                />
            </Grid>
        </Grid>
    );
}
