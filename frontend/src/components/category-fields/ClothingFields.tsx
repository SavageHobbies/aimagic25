import React from 'react';
import { Grid, TextField, MenuItem } from '@mui/material';
import { ClothingProduct } from '../../types/CategoryFields';

interface ClothingFieldsProps {
    data: Partial<ClothingProduct>;
    onChange: (field: string, value: any) => void;
}

const genderOptions = ['Men', 'Women', 'Unisex'];
const departmentOptions = ['Adult', 'Children', 'Baby', 'Teen'];

export default function ClothingFields({ data, onChange }: ClothingFieldsProps) {
    const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(field, event.target.value);
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    select
                    label="Gender"
                    value={data.gender || ''}
                    onChange={handleChange('gender')}
                >
                    {genderOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    select
                    label="Department"
                    value={data.department || ''}
                    onChange={handleChange('department')}
                >
                    {departmentOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="Size"
                    value={data.size || ''}
                    onChange={handleChange('size')}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="Color"
                    value={data.color || ''}
                    onChange={handleChange('color')}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="Material"
                    value={data.material || ''}
                    onChange={handleChange('material')}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="Style"
                    value={data.style || ''}
                    onChange={handleChange('style')}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Type"
                    value={data.type || ''}
                    onChange={handleChange('type')}
                    helperText="e.g., T-Shirt, Jeans, Dress, etc."
                />
            </Grid>
        </Grid>
    );
}
