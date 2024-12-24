import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Button,
    TextField,
    MenuItem,
    Divider,
    IconButton,
    Chip,
    FormControl,
    FormControlLabel,
    Switch,
    InputAdornment,
    Select,
    FormHelperText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ItemSpecificsForm from '../components/ItemSpecificsForm';
import { getEbayCategoryId } from '../services/ebayCategoryMapping';

interface ListingFormData {
    // Basic Details
    title: string;
    subtitle?: string;
    categoryId: string;
    price: number | '';
    quantity: number;
    duration: string;
    format: 'FixedPrice' | 'Auction';
    condition: string;
    conditionDescription?: string;
    description: string;
    
    // Item Specifics
    itemSpecifics: Record<string, string>;
    character?: string;
    franchise?: string;
    manufacturer?: string;
    type?: string;
    series?: string;
    size?: string;
    features?: string;
    theme?: string;
    bundleListing?: string;
    
    // Shipping Details
    packageWeight?: number;
    packageLength?: number;
    packageWidth?: number;
    packageHeight?: number;
    shippingService?: string;
    handlingTime?: number;
    returnsAccepted?: boolean;
    
    // Product Info
    upc?: string;
    images?: string[];
    market_data?: {
        average_price?: number;
        min_price?: number;
        max_price?: number;
        total_listings?: number;
        sold_last_month?: number;
    };
}

const conditionOptions = [
    { value: 'New', label: 'New with tags' },
    { value: 'NewOther', label: 'New without tags' },
    { value: 'NewDefects', label: 'New with defects' },
    { value: 'PreOwned', label: 'Pre-owned' },
    { value: 'Used', label: 'Used' }
];

const durationOptions = [
    { value: 'Days_3', label: '3 days' },
    { value: 'Days_5', label: '5 days' },
    { value: 'Days_7', label: '7 days' },
    { value: 'Days_10', label: '10 days' },
    { value: 'Days_30', label: '30 days' },
    { value: 'GTC', label: 'Good \'Til Cancelled' }
];

const shippingServiceOptions = [
    { value: 'USPSFirstClass', label: 'USPS First Class' },
    { value: 'USPSPriority', label: 'USPS Priority' },
    { value: 'USPSGround', label: 'USPS Ground' },
    { value: 'FedExGround', label: 'FedEx Ground' },
    { value: 'FedExHome', label: 'FedEx Home Delivery' }
];

export default function ProductDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    const product = location.state?.product;

    const [formData, setFormData] = React.useState<ListingFormData>(() => {
        // Get eBay category ID from the product category
        const categoryId = product?.category ? getEbayCategoryId(product.category) : '';
        console.log('Product category:', product?.category);
        console.log('Mapped category ID:', categoryId);

        return {
            title: product?.title || '',
            categoryId,
            price: product?.price || product?.market_data?.average_price || '',
            quantity: 1,
            duration: 'GTC',
            format: 'FixedPrice',
            condition: 'New',
            description: product?.description || '',
            itemSpecifics: {},
            upc: product?.upc || '',
            images: product?.images || [],
            market_data: product?.market_data,
            returnsAccepted: true,
            handlingTime: 1,
            character: '',
            franchise: '',
            manufacturer: 'Funko',
            type: 'Pop!',
            series: '',
            size: '3.75"',
            features: '',
            theme: '',
            bundleListing: 'No'
        };
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        console.log('Current category ID:', formData.categoryId);
        console.log('Current item specifics:', formData.itemSpecifics);
    }, [formData.categoryId, formData.itemSpecifics]);

    if (!product) {
        return (
            <Container>
                <Typography>Product not found</Typography>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </Container>
        );
    }

    const handleChange = (field: keyof ListingFormData) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleSwitchChange = (field: keyof ListingFormData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.checked
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Create item specifics object
            const itemSpecifics = {
                'Character': formData.character,
                'Franchise': formData.franchise,
                'Manufacturer': formData.manufacturer,
                'Type': formData.type,
                'Series': formData.series,
                'Size': formData.size,
                'Features': formData.features,
                'Theme': formData.theme,
                'Bundle Listing': formData.bundleListing,
                'Condition': formData.condition
            };

            // Create the listing data
            const listingData = {
                title: formData.title,
                description: formData.description,
                price: formData.price,
                quantity: formData.quantity,
                condition: formData.condition,
                categoryId: formData.categoryId,
                images: formData.images,
                itemSpecifics: itemSpecifics,
                shippingDetails: {
                    shippingType: formData.shippingType,
                    shippingService: formData.shippingService,
                    shippingCost: formData.shippingCost,
                    handlingTime: formData.handlingTime,
                    packageWeight: formData.packageWeight,
                    packageLength: formData.packageLength,
                    packageWidth: formData.packageWidth,
                    packageHeight: formData.packageHeight
                },
                returnsAccepted: formData.returnsAccepted,
                returnPolicy: formData.returnPolicy
            };

            // Send to backend
            const response = await fetch('http://localhost:8000/api/listing/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(listingData)
            });

            if (!response.ok) {
                throw new Error('Failed to create listing');
            }

            // Show success message
            setSnackbar({
                open: true,
                message: 'Listing created successfully!',
                severity: 'success'
            });

            // Reset form
            setFormData({
                title: '',
                categoryId: '',
                price: '',
                quantity: 1,
                duration: 'GTC',
                format: 'FixedPrice',
                condition: 'New',
                description: '',
                itemSpecifics: {},
                upc: '',
                images: [],
                market_data: undefined,
                returnsAccepted: true,
                handlingTime: 1,
                character: '',
                franchise: '',
                manufacturer: 'Funko',
                type: 'Pop!',
                series: '',
                size: '3.75"',
                features: '',
                theme: '',
                bundleListing: 'No'
            });
            
        } catch (error) {
            console.error('Error creating listing:', error);
            setSnackbar({
                open: true,
                message: 'Error creating listing. Please try again.',
                severity: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ color: 'primary.main' }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" component="h1">
                        Create eBay Listing
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {/* Left Column - Images and Market Data */}
                    <Grid item xs={12} md={4}>
                        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Product Images
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <img
                                    src={product.images?.[0] || '/placeholder.png'}
                                    alt={product.title}
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        objectFit: 'contain',
                                        borderRadius: 8
                                    }}
                                />
                            </Box>
                            {product.images?.slice(1).map((image: string, index: number) => (
                                <Box
                                    key={index}
                                    component="img"
                                    src={image}
                                    alt={`Product ${index + 2}`}
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        objectFit: 'cover',
                                        borderRadius: 1,
                                        m: 0.5
                                    }}
                                />
                            ))}
                        </Paper>

                        {/* Market Data */}
                        {product.market_data && (
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Market Data
                                </Typography>
                                <Grid container spacing={1}>
                                    {product.market_data.average_price && (
                                        <Grid item xs={12}>
                                            <Chip
                                                label={`Average: $${product.market_data.average_price.toFixed(2)}`}
                                                color="primary"
                                                sx={{ width: '100%' }}
                                            />
                                        </Grid>
                                    )}
                                    {product.market_data.min_price && (
                                        <Grid item xs={6}>
                                            <Chip
                                                label={`Min: $${product.market_data.min_price.toFixed(2)}`}
                                                variant="outlined"
                                                size="small"
                                                sx={{ width: '100%' }}
                                            />
                                        </Grid>
                                    )}
                                    {product.market_data.max_price && (
                                        <Grid item xs={6}>
                                            <Chip
                                                label={`Max: $${product.market_data.max_price.toFixed(2)}`}
                                                variant="outlined"
                                                size="small"
                                                sx={{ width: '100%' }}
                                            />
                                        </Grid>
                                    )}
                                    {product.market_data.total_listings && (
                                        <Grid item xs={6}>
                                            <Chip
                                                label={`Listings: ${product.market_data.total_listings}`}
                                                variant="outlined"
                                                size="small"
                                                sx={{ width: '100%' }}
                                            />
                                        </Grid>
                                    )}
                                    {product.market_data.sold_last_month && (
                                        <Grid item xs={6}>
                                            <Chip
                                                label={`Sold: ${product.market_data.sold_last_month}`}
                                                variant="outlined"
                                                size="small"
                                                sx={{ width: '100%' }}
                                            />
                                        </Grid>
                                    )}
                                </Grid>
                            </Paper>
                        )}
                    </Grid>

                    {/* Right Column - Form */}
                    <Grid item xs={12} md={8}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            {/* Basic Details */}
                            <Typography variant="h6" gutterBottom>
                                Basic Details
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Title"
                                        value={formData.title}
                                        onChange={handleChange('title')}
                                        helperText="Create a compelling title that will attract buyers (80 characters max)"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Subtitle (Optional)"
                                        value={formData.subtitle}
                                        onChange={handleChange('subtitle')}
                                        helperText="Add a subtitle to provide more details (55 characters max)"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Category"
                                        value={formData.categoryId}
                                        disabled
                                        helperText="Category determined from UPC scan"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Price"
                                        type="number"
                                        value={formData.price}
                                        onChange={handleChange('price')}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Quantity"
                                        type="number"
                                        value={formData.quantity}
                                        onChange={handleChange('quantity')}
                                        inputProps={{ min: 1 }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Duration"
                                        value={formData.duration}
                                        onChange={handleChange('duration')}
                                    >
                                        {durationOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Format"
                                        value={formData.format}
                                        onChange={handleChange('format')}
                                    >
                                        <MenuItem value="FixedPrice">Fixed Price</MenuItem>
                                        <MenuItem value="Auction">Auction</MenuItem>
                                    </TextField>
                                </Grid>
                            </Grid>

                            {/* Item Specifics */}
                            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                                Item Specifics
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Condition"
                                        value={formData.condition}
                                        onChange={handleChange('condition')}
                                        required
                                    >
                                        <MenuItem value="New">New</MenuItem>
                                        <MenuItem value="New with tags">New with tags</MenuItem>
                                        <MenuItem value="New in box">New in box</MenuItem>
                                        <MenuItem value="Used">Used</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Character"
                                        value={formData.character}
                                        onChange={handleChange('character')}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Franchise"
                                        value={formData.franchise}
                                        onChange={handleChange('franchise')}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Manufacturer"
                                        value={formData.manufacturer || 'Funko'}
                                        onChange={handleChange('manufacturer')}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Type"
                                        value={formData.type || 'Pop!'}
                                        onChange={handleChange('type')}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Series"
                                        value={formData.series}
                                        onChange={handleChange('series')}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Size"
                                        value={formData.size || '3.75"'}
                                        onChange={handleChange('size')}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Features"
                                        value={formData.features}
                                        onChange={handleChange('features')}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Theme"
                                        value={formData.theme}
                                        onChange={handleChange('theme')}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Bundle Listing"
                                        select
                                        value={formData.bundleListing || 'No'}
                                        onChange={handleChange('bundleListing')}
                                    >
                                        <MenuItem value="Yes">Yes</MenuItem>
                                        <MenuItem value="No">No</MenuItem>
                                    </TextField>
                                </Grid>
                            </Grid>

                            {/* Description */}
                            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                                Description
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        label="Condition Description"
                                        value={formData.conditionDescription}
                                        onChange={handleChange('conditionDescription')}
                                        helperText="Describe any defects, wear, or special conditions"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={8}
                                        label="Item Description"
                                        value={formData.description}
                                        onChange={handleChange('description')}
                                        helperText="Provide a detailed description of your item"
                                    />
                                </Grid>
                            </Grid>

                            {/* Shipping */}
                            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                                Shipping Details
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Package Weight"
                                        value={formData.packageWeight}
                                        onChange={handleChange('packageWeight')}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">lbs</InputAdornment>
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Shipping Service"
                                        value={formData.shippingService}
                                        onChange={handleChange('shippingService')}
                                    >
                                        {shippingServiceOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Handling Time"
                                        value={formData.handlingTime}
                                        onChange={handleChange('handlingTime')}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">days</InputAdornment>
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.returnsAccepted || false}
                                                onChange={handleSwitchChange('returnsAccepted')}
                                            />
                                        }
                                        label="Accept Returns"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Package Dimensions
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={4}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="Length"
                                                value={formData.packageLength}
                                                onChange={handleChange('packageLength')}
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">in</InputAdornment>
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={4}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="Width"
                                                value={formData.packageWidth}
                                                onChange={handleChange('packageWidth')}
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">in</InputAdornment>
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={4}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="Height"
                                                value={formData.packageHeight}
                                                onChange={handleChange('packageHeight')}
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">in</InputAdornment>
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate(-1)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                >
                                    Create eBay Listing
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}
