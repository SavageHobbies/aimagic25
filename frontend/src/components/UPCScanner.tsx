import React, { useState, useRef, useEffect } from 'react';
import { 
    TextField, 
    IconButton, 
    Typography, 
    Paper, 
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    useTheme 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import InfoIcon from '@mui/icons-material/Info';
import useSound from 'use-sound';
import { useNavigate } from 'react-router-dom';

interface ScannedItem {
    upc: string;
    quantity: number;
    title?: string;
    brand?: string;
    price?: number;
    description?: string;
    category?: string;
    images?: string[];
    market_data?: {
        average_price?: number;
        min_price?: number;
        max_price?: number;
        total_listings?: number;
        sold_last_month?: number;
    };
}

export default function UPCScanner() {
    const navigate = useNavigate();
    const theme = useTheme();
    const [upcInput, setUpcInput] = useState('');
    const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [remainingLookups, setRemainingLookups] = useState<number>(100);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load sounds
    const [playSuccess] = useSound('/sounds/success.mp3', { volume: 0.5 });
    const [playError] = useSound('/sounds/error.mp3', { volume: 0.5 });

    useEffect(() => {
        // Always keep input focused
        inputRef.current?.focus();
    }, []);

    const handleUPCSubmit = async (upc: string) => {
        if (!upc.trim()) return;
        
        try {
            setError(null);
            setLoading(true);
            console.log('Submitting UPC:', upc);
            
            const response = await fetch('http://localhost:8000/api/upc/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ upc, quantity: 1 }),
            });

            console.log('Response status:', response.status);
            
            const remainingLookups = response.headers.get('X-RateLimit-Remaining');
            if (remainingLookups) {
                setRemainingLookups(parseInt(remainingLookups));
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to lookup UPC');
            }

            const data = await response.json();
            console.log('Response data:', data);

            if (!data.success || !data.product) {
                throw new Error('Product not found');
            }

            // Check if item already exists
            const existingItemIndex = scannedItems.findIndex(item => item.upc === upc);
            
            if (existingItemIndex !== -1) {
                // Update quantity of existing item
                const updatedItems = [...scannedItems];
                updatedItems[existingItemIndex].quantity += 1;
                setScannedItems(updatedItems);
            } else {
                // Add new item
                const newItem = {
                    upc,
                    quantity: 1,
                    title: data.product.title,
                    brand: data.product.brand,
                    price: data.product.market_data?.average_price || data.product.suggested_price,
                    description: data.product.description,
                    category: data.product.category,
                    images: data.product.images,
                    market_data: data.product.market_data
                };
                setScannedItems([...scannedItems, newItem]);
            }

            playSuccess();
            setUpcInput('');
        } catch (err: any) {
            console.error('Error:', err);
            setError(err.message || 'Failed to lookup UPC');
            playError();
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUpcInput(event.target.value);
    };

    const handleInputKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleUPCSubmit(upcInput);
        }
    };

    const handleQuantityChange = (index: number, change: number) => {
        const updatedItems = [...scannedItems];
        const newQuantity = updatedItems[index].quantity + change;
        
        if (newQuantity > 0) {
            updatedItems[index].quantity = newQuantity;
            setScannedItems(updatedItems);
        }
    };

    const handleDeleteItem = (index: number) => {
        const updatedItems = scannedItems.filter((_, i) => i !== index);
        setScannedItems(updatedItems);
    };

    const handleShowDetails = (item: ScannedItem) => {
        navigate('/product-details', { state: { product: item } });
    };

    return (
        <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 2 }}>
            <Paper 
                elevation={3} 
                sx={{ 
                    p: 3, 
                    mb: 3, 
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 2
                }}
            >
                <TextField
                    fullWidth
                    label="Enter UPC"
                    value={upcInput}
                    onChange={handleInputChange}
                    onKeyPress={handleInputKeyPress}
                    inputRef={inputRef}
                    error={!!error}
                    helperText={error || ' '}
                    disabled={loading}
                    variant="outlined"
                    placeholder="Scan or type UPC code..."
                    InputProps={{
                        sx: {
                            backgroundColor: theme.palette.background.default,
                            '&.Mui-focused': {
                                backgroundColor: theme.palette.background.default,
                            },
                        },
                    }}
                    sx={{ mb: 2 }}
                />
                
                <Typography variant="body2" color="textSecondary" sx={{ opacity: 0.7 }}>
                    Remaining Lookups: {remainingLookups}
                </Typography>
            </Paper>

            {scannedItems.length > 0 ? (
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                                <TableCell sx={{ color: '#fff', fontWeight: 600, width: 100 }}>Image</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Title</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Brand</TableCell>
                                <TableCell align="right" sx={{ color: '#fff', fontWeight: 600 }}>Price</TableCell>
                                <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Quantity</TableCell>
                                <TableCell align="right" sx={{ color: '#fff', fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {scannedItems.map((item, index) => (
                                <TableRow 
                                    key={index}
                                    onClick={() => handleShowDetails(item)}
                                    sx={{ 
                                        '&:hover': { 
                                            backgroundColor: theme.palette.action.hover,
                                            cursor: 'pointer'
                                        }
                                    }}
                                >
                                    <TableCell>
                                        {item.images && item.images[0] ? (
                                            <Box
                                                component="img"
                                                src={item.images[0]}
                                                alt={item.title || 'Product image'}
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    objectFit: 'contain',
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    borderRadius: 1,
                                                    backgroundColor: '#fff'
                                                }}
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    borderRadius: 1,
                                                    backgroundColor: '#fff'
                                                }}
                                            >
                                                <Typography variant="caption" color="textSecondary">
                                                    No image
                                                </Typography>
                                            </Box>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 300 }}>
                                        <Typography 
                                            noWrap 
                                            sx={{ 
                                                '&:hover': { 
                                                    textDecoration: 'underline',
                                                    color: 'primary.main'
                                                }
                                            }}
                                        >
                                            {item.title || item.upc}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{item.brand || '-'}</TableCell>
                                    <TableCell align="right">
                                        {item.price ? `$${item.price.toFixed(2)}` : '-'}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 1
                                        }}>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleQuantityChange(index, -1);
                                                }}
                                                sx={{ color: theme.palette.primary.main }}
                                            >
                                                <RemoveIcon />
                                            </IconButton>
                                            <Typography>{item.quantity}</Typography>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleQuantityChange(index, 1);
                                                }}
                                                sx={{ color: theme.palette.primary.main }}
                                            >
                                                <AddIcon />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteItem(index);
                                                }}
                                                sx={{ color: theme.palette.error.main }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 4, 
                        textAlign: 'center',
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 2,
                        border: `1px dashed ${theme.palette.divider}`
                    }}
                >
                    <Typography variant="body1" color="textSecondary">
                        No items scanned yet. Start by scanning a UPC code or entering it manually.
                    </Typography>
                </Paper>
            )}
        </Box>
    );
}
