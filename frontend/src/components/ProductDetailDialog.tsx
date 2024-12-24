import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Grid,
    IconButton,
    Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface MarketData {
    average_price?: number;
    min_price?: number;
    max_price?: number;
    total_listings?: number;
    sold_last_month?: number;
}

interface ProductDetailDialogProps {
    open: boolean;
    onClose: () => void;
    product?: {
        title?: string;
        description?: string;
        upc?: string;
        brand?: string;
        image?: string;
        images?: string[];
        price?: number;
        condition?: string;
        market_data?: MarketData;
        [key: string]: any;
    };
}

export default function ProductDetailDialog({ open, onClose, product }: ProductDetailDialogProps) {
    if (!product) {
        return null;
    }

    // Handle both single image and image array formats
    const productImage = product.image || (product.images && product.images[0]) || '/placeholder.png';
    
    // Handle both direct price and market data price
    const productPrice = product.price || product.market_data?.average_price;

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: 'background.paper',
                    borderRadius: 1
                }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" component="div" sx={{ pr: 2 }}>
                    {product.title || 'Product Details'}
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        color: (theme) => theme.palette.grey[500]
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ width: '100%', height: '300px', position: 'relative' }}>
                            <img
                                src={productImage}
                                alt={product.title || 'Product image'}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain'
                                }}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        {product.description && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                    Description
                                </Typography>
                                <Typography variant="body1">
                                    {product.description}
                                </Typography>
                            </Box>
                        )}
                        {productPrice !== undefined && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                    Price
                                </Typography>
                                <Typography variant="h6" color="primary">
                                    ${productPrice.toFixed(2)}
                                </Typography>
                            </Box>
                        )}
                        {product.condition && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                    Condition
                                </Typography>
                                <Typography variant="body1">
                                    {product.condition}
                                </Typography>
                            </Box>
                        )}
                        {product.upc && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                    UPC
                                </Typography>
                                <Typography variant="body1">
                                    {product.upc}
                                </Typography>
                            </Box>
                        )}
                        {product.brand && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                    Brand
                                </Typography>
                                <Typography variant="body1">
                                    {product.brand}
                                </Typography>
                            </Box>
                        )}
                        {product.market_data && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                    Market Data
                                </Typography>
                                <Grid container spacing={2}>
                                    {product.market_data.min_price !== undefined && (
                                        <Grid item xs={6}>
                                            <Chip 
                                                label={`Min: $${product.market_data.min_price.toFixed(2)}`}
                                                size="small"
                                                sx={{ width: '100%' }}
                                            />
                                        </Grid>
                                    )}
                                    {product.market_data.max_price !== undefined && (
                                        <Grid item xs={6}>
                                            <Chip 
                                                label={`Max: $${product.market_data.max_price.toFixed(2)}`}
                                                size="small"
                                                sx={{ width: '100%' }}
                                            />
                                        </Grid>
                                    )}
                                    {product.market_data.total_listings !== undefined && (
                                        <Grid item xs={6}>
                                            <Chip 
                                                label={`Listings: ${product.market_data.total_listings}`}
                                                size="small"
                                                sx={{ width: '100%' }}
                                            />
                                        </Grid>
                                    )}
                                    {product.market_data.sold_last_month !== undefined && (
                                        <Grid item xs={6}>
                                            <Chip 
                                                label={`Sold: ${product.market_data.sold_last_month}`}
                                                size="small"
                                                sx={{ width: '100%' }}
                                            />
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained" color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
