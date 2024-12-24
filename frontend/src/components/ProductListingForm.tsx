import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Typography,
    Paper,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Divider,
    Button,
    IconButton,
    useTheme,
    Chip,
    FormHelperText,
    InputAdornment,
    Card,
    CardContent,
    LinearProgress,
} from '@mui/material';
import {
    AddPhotoAlternate as AddPhotoIcon,
    Delete as DeleteIcon,
    DragIndicator as DragIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import InfoIcon from '@mui/icons-material/Info';
import { Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Autocomplete from '@mui/material/Autocomplete';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ItemSpecificsBulkEditor from './ItemSpecificsBulkEditor';

interface ProductListingFormProps {
    product: any;
    onSave: (updatedProduct: any) => void;
    onClose: () => void;
}

interface Condition {
    id: string;
    label: string;
    description: string;
}

const CONDITIONS: Condition[] = [
    { id: '1000', label: 'New', description: 'A brand-new, unused, unopened, undamaged item in its original packaging' },
    { id: '1500', label: 'New other', description: 'New without tags or original packaging' },
    { id: '1750', label: 'New with defects', description: 'New with defects or flaws' },
    { id: '2000', label: 'Certified Refurbished', description: 'Restored to working order by manufacturer or manufacturer-approved vendor' },
    { id: '2500', label: 'Excellent - Refurbished', description: 'Fully restored to working order' },
    { id: '3000', label: 'Very Good', description: 'Minor wear, fully functional' },
    { id: '4000', label: 'Good', description: 'Moderate wear, fully functional' },
    { id: '5000', label: 'Acceptable', description: 'Heavy wear, but still works' },
    { id: '6000', label: 'For parts or not working', description: 'Not fully functional, for parts or repair' },
];

const LISTING_DURATIONS = [
    'Days_3',
    'Days_5',
    'Days_7',
    'Days_10',
    'Days_30',
    'GTC'
];

interface CategoryField {
    name: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'multiselect';
    required: boolean;
    options?: string[];
    unit?: string;
}

interface CategoryFields {
    [category: string]: CategoryField[];
}

const CATEGORY_SPECIFIC_FIELDS: CategoryFields = {
    'Electronics': [
        { name: 'model', label: 'Model', type: 'text', required: true },
        { name: 'features', label: 'Features', type: 'multiselect', required: false, options: [
            'Bluetooth', 'Wi-Fi', 'USB-C', 'Wireless Charging', '5G', '4K', 'HDR'
        ]},
        { name: 'screenSize', label: 'Screen Size', type: 'number', required: false, unit: 'inches' },
        { name: 'storage', label: 'Storage Capacity', type: 'select', required: false, options: [
            '16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB'
        ]},
        { name: 'connectivity', label: 'Connectivity', type: 'multiselect', required: false, options: [
            'Wi-Fi', 'Bluetooth', 'NFC', '4G LTE', '5G', 'Ethernet'
        ]},
    ],
    'Funko Pop': [
        { name: 'series', label: 'Series/Line', type: 'select', required: true, options: [
            'Pop!', 'Pop! Rides', 'Pop! Movies', 'Pop! Animation', 'Pop! Games', 'Pop! Disney',
            'Pop! Marvel', 'Pop! DC', 'Pop! Star Wars', 'Pop! Television', 'Pop! Sports',
            'Pop! Rocks', 'Pop! Ad Icons', 'Soda', 'Pop! Deluxe'
        ]},
        { name: 'number', label: 'Pop Number', type: 'text', required: true },
        { name: 'exclusive', label: 'Exclusive To', type: 'select', required: false, options: [
            'None', 'Hot Topic', 'BoxLunch', 'Target', 'Walmart', 'Amazon', 'GameStop',
            'FYE', 'Funko Shop', 'Convention Exclusive', 'Chase', 'Other'
        ]},
        { name: 'variant', label: 'Variant Type', type: 'select', required: false, options: [
            'Regular', 'Chase', 'Flocked', 'Glow in the Dark', 'Metallic', 'Diamond Collection',
            'Chrome', 'Glitter', 'Scented', 'Black Light'
        ]},
        { name: 'boxCondition', label: 'Box Condition', type: 'select', required: true, options: [
            'Mint', 'Near Mint', 'Good', 'Fair', 'Poor', 'No Box'
        ]},
        { name: 'boxDamage', label: 'Box Damage Description', type: 'text', required: false },
        { name: 'yearReleased', label: 'Year Released', type: 'number', required: false },
        { name: 'vaulted', label: 'Vaulted', type: 'select', required: true, options: ['Yes', 'No'] },
    ],
    'Clothing': [
        { name: 'gender', label: 'Gender', type: 'select', required: true, options: [
            'Men', 'Women', 'Unisex', 'Boys', 'Girls'
        ]},
        { name: 'size', label: 'Size', type: 'select', required: true, options: [
            'XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'
        ]},
        { name: 'sizeType', label: 'Size Type', type: 'select', required: false, options: [
            'Regular', 'Petite', 'Plus', 'Juniors', 'Maternity', 'Big & Tall'
        ]},
        { name: 'color', label: 'Primary Color', type: 'select', required: true, options: [
            'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink',
            'Orange', 'Brown', 'Gray', 'Navy', 'Beige', 'Multi'
        ]},
        { name: 'material', label: 'Materials', type: 'multiselect', required: true, options: [
            'Cotton', 'Polyester', 'Wool', 'Silk', 'Linen', 'Leather', 'Denim',
            'Spandex', 'Nylon', 'Rayon', 'Cashmere', 'Bamboo'
        ]},
        { name: 'style', label: 'Style', type: 'select', required: false, options: [
            'Casual', 'Formal', 'Business', 'Athletic', 'Streetwear', 'Vintage',
            'Designer', 'Basic', 'Bohemian', 'Gothic', 'Preppy'
        ]},
        { name: 'season', label: 'Season', type: 'multiselect', required: false, options: [
            'Spring', 'Summer', 'Fall', 'Winter', 'All Season'
        ]},
        { name: 'care', label: 'Care Instructions', type: 'multiselect', required: false, options: [
            'Machine Wash', 'Hand Wash', 'Dry Clean', 'Spot Clean', 'Line Dry',
            'Tumble Dry', 'Do Not Bleach', 'Iron Low'
        ]},
        { name: 'measurements', label: 'Measurements', type: 'text', required: false },
        { name: 'defects', label: 'Defects/Wear', type: 'text', required: false },
    ],
    'Books': [
        { name: 'isbn', label: 'ISBN', type: 'text', required: true },
        { name: 'format', label: 'Format', type: 'select', required: true, options: [
            'Hardcover', 'Paperback', 'eBook', 'Audiobook'
        ]},
        { name: 'language', label: 'Language', type: 'text', required: true },
        { name: 'publisher', label: 'Publisher', type: 'text', required: true },
        { name: 'publicationYear', label: 'Publication Year', type: 'number', required: true },
    ],
    'Sports Equipment': [
        { name: 'sport', label: 'Sport', type: 'text', required: true },
        { name: 'skillLevel', label: 'Skill Level', type: 'select', required: false, options: [
            'Beginner', 'Intermediate', 'Advanced', 'Professional'
        ]},
        { name: 'ageGroup', label: 'Age Group', type: 'select', required: false, options: [
            'Youth', 'Adult', 'Senior'
        ]},
        { name: 'material', label: 'Material', type: 'text', required: false },
    ],
    'Automotive': [
        { name: 'make', label: 'Make', type: 'text', required: true },
        { name: 'model', label: 'Model', type: 'text', required: true },
        { name: 'year', label: 'Year', type: 'number', required: true },
        { name: 'partNumber', label: 'Part Number', type: 'text', required: true },
        { name: 'compatibility', label: 'Compatibility', type: 'text', required: false },
    ],
};

interface MarketData {
    avgSoldPrice: number;
    soldPriceRange: {
        min: number;
        max: number;
    };
    avgShipping: number;
    freeShippingPercentage: number;
    sellThrough: number;
    totalSellers: number;
    lastSold?: string;
    salesHistory: {
        date: string;
        price: number;
        shipping: number;
        condition: string;
        title: string;
    }[];
}

interface TerapeakData {
    avgSoldPrice: number;
    totalSold: number;
    sellThrough: number;
    avgListingPrice: number;
    totalListings: number;
    salesTrend: 'up' | 'down' | 'stable';
    salesHistory: {
        date: string;
        soldPrice: number;
        shipping: number;
        condition: string;
        itemLocation: string;
    }[];
}

const FUNKO_SPECIFIC_FIELDS = {
    brand: { type: 'text', required: true, default: 'Funko' },
    mpn: { type: 'text', required: false },
    theme: { type: 'select', required: true, options: [
        'Animation', 'Comics', 'Disney', 'Games', 'Movies', 'Music', 'Sports', 'Television'
    ]},
    character: { type: 'text', required: true },
    series: { type: 'text', required: true },
    
    manufacturer: { type: 'text', required: true, default: 'Funko' },
    productLine: { type: 'select', required: true, options: [
        'Pop!', 'Pop! Rides', 'Pop! Moments', 'Soda', 'Pop! Deluxe'
    ]},
    packageType: { type: 'select', required: true, options: [
        'Original (Unopened)', 'Original (Opened)', 'Replacement Box', 'No Box'
    ]},
    features: { type: 'multiselect', required: false, options: [
        'Chase', 'Convention Exclusive', 'Flocked', 'Glow in the Dark', 'Metallic', 
        'Store Exclusive', 'Limited Edition'
    ]},
    
    boxCondition: { type: 'select', required: true, options: [
        'Mint', 'Near Mint', 'Very Good', 'Good', 'Fair', 'Poor'
    ]},
    boxDamage: { type: 'multiselect', required: false, options: [
        'None', 'Corner Dings', 'Creases', 'Window Damage', 'Shelf Wear', 'Sticker Residue'
    ]},
    
    exclusiveRelease: { type: 'select', required: false, options: [
        'Not Exclusive', 'Hot Topic', 'BoxLunch', 'Target', 'Walmart', 'Amazon', 'GameStop',
        'FYE', 'Funko Shop', 'Convention', 'Other'
    ]},
    
    popNumber: { type: 'text', required: true },
    yearReleased: { type: 'number', required: false },
    
    vaulted: { type: 'boolean', required: true },
    edition: { type: 'text', required: false },
    pieceCount: { type: 'number', required: false }
};

const LISTING_FIELDS = {
    title: { type: 'text', required: true, maxLength: 80 },
    subtitle: { type: 'text', required: false, maxLength: 55 },
    
    category: { type: 'category', required: true },
    condition: { type: 'select', required: true },
    conditionDescription: { type: 'textarea', required: false },
    
    price: { type: 'number', required: true },
    quantity: { type: 'number', required: true },
    acceptOffers: { type: 'boolean', required: false },
    
    format: { type: 'select', required: true, options: [
        'Fixed Price', 'Auction', 'Auction with Buy It Now'
    ]},
    duration: { type: 'select', required: true, options: [
        'Days_1', 'Days_3', 'Days_5', 'Days_7', 'Days_10', 'Days_30', 'GTC'
    ]},
    
    shippingType: { type: 'select', required: true, options: [
        'Calculated', 'Flat', 'Freight', 'Local Pickup'
    ]},
    packageWeight: { type: 'number', required: true },
    packageDimensions: {
        length: { type: 'number', required: true },
        width: { type: 'number', required: true },
        height: { type: 'number', required: true }
    },
    domesticShipping: {
        service: { type: 'select', required: true },
        cost: { type: 'number', required: false },
        additionalCost: { type: 'number', required: false },
        freeShipping: { type: 'boolean', required: false }
    },
    internationalShipping: {
        offered: { type: 'boolean', required: true },
        service: { type: 'select', required: false },
        locations: { type: 'multiselect', required: false }
    },
    
    returns: {
        accepted: { type: 'boolean', required: true },
        duration: { type: 'select', required: false },
        type: { type: 'select', required: false },
        shippingCost: { type: 'select', required: false }
    },
    
    location: { type: 'text', required: true },
    postalCode: { type: 'text', required: true },
    
    specifics: { type: 'dynamic', required: true },
    
    description: { type: 'richtext', required: true },
    
    photos: { type: 'photos', required: true, max: 12 },
    
    paymentPolicy: { type: 'select', required: true },
    returnPolicy: { type: 'select', required: true },
    shippingPolicy: { type: 'select', required: true }
};

const useTerapeakData = (upc: string) => {
    const [terapeakData, setTerapeakData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<'30' | '90' | '365'>('30');

    useEffect(() => {
        const fetchTerapeakData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/terapeak?upc=${upc}&days=${timeRange}`);
                const data = await response.json();
                if (data.success) {
                    setTerapeakData(data.data);
                    setError(null);
                } else {
                    setError(data.message);
                }
            } catch (err) {
                setError('Failed to fetch Terapeak data');
            } finally {
                setLoading(false);
            }
        };

        if (upc) {
            fetchTerapeakData();
        }
    }, [upc, timeRange]);

    return { terapeakData, loading, error, timeRange, setTimeRange };
};

const TopSellerListings = ({ listings }: { listings: any[] }) => (
    <List>
        {listings.map((listing) => (
            <ListItem key={listing.itemId} divider>
                <ListItemText
                    primary={listing.title}
                    secondary={
                        <React.Fragment>
                            <Typography variant="body2" color="textSecondary">
                                Price: ${listing.price} | Sold: {listing.soldQuantity} units
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Total Sales: ${listing.totalGMV} | Sell-through: {listing.sellThrough}%
                            </Typography>
                        </React.Fragment>
                    }
                />
                <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => window.open(`https://www.ebay.com/itm/${listing.itemId}`, '_blank')}
                >
                    View Listing
                </Button>
            </ListItem>
        ))}
    </List>
);

const useTemplate = (category: string) => {
    const [template, setTemplate] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTemplate = async () => {
            if (!category) return;
            
            setLoading(true);
            try {
                const response = await fetch(`/api/templates/${category}`);
                const data = await response.json();
                if (response.ok) {
                    setTemplate(data.template);
                    setError(null);
                } else {
                    setError(data.detail);
                }
            } catch (err) {
                setError('Failed to fetch template');
            } finally {
                setLoading(false);
            }
        };

        fetchTemplate();
    }, [category]);

    const fillTemplate = async (productData: any) => {
        try {
            const response = await fetch(`/api/templates/${category}/fill`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });
            const data = await response.json();
            if (response.ok) {
                return data.html;
            } else {
                throw new Error(data.detail);
            }
        } catch (err) {
            console.error('Error filling template:', err);
            return null;
        }
    };

    return { template, loading, error, fillTemplate };
};

const useItemSpecifics = (categoryId: string) => {
    const [aspects, setAspects] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAspects = async () => {
            if (!categoryId) return;
            
            setLoading(true);
            try {
                const response = await fetch(`/api/categories/${categoryId}/aspects`);
                const data = await response.json();
                if (response.ok) {
                    setAspects(data);
                    setError(null);
                } else {
                    setError(data.detail);
                }
            } catch (err) {
                setError('Failed to fetch item specifics');
            } finally {
                setLoading(false);
            }
        };

        fetchAspects();
    }, [categoryId]);

    const getAspectValues = async (aspectName: string) => {
        try {
            const response = await fetch(`/api/categories/${categoryId}/aspects/${aspectName}/values`);
            const data = await response.json();
            return response.ok ? data : [];
        } catch (err) {
            console.error('Error fetching aspect values:', err);
            return [];
        }
    };

    return { aspects, loading, error, getAspectValues };
};

const useAIAssistance = (categoryId: string, context: any) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fillAllAspects = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/ai/item-specifics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    category_id: categoryId,
                    context: {
                        title: context.title,
                        upc: context.upc,
                        brand: context.brand,
                        category: context.category,
                        description: context.description
                    }
                }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to get AI suggestions');
            }
            
            const data = await response.json();
            setError(null);
            return data;
        } catch (err) {
            setError(err.message);
            return {};
        } finally {
            setLoading(false);
        }
    };

    const fillSingleAspect = async (aspectName: string) => {
        try {
            const response = await fetch(`/api/ai/item-specific/${aspectName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    category_id: categoryId,
                    context: {
                        title: context.title,
                        upc: context.upc,
                        brand: context.brand,
                        category: context.category,
                        description: context.description
                    }
                }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to get AI suggestion');
            }
            
            const data = await response.json();
            return data[aspectName] || '';
        } catch (err) {
            console.error('Error getting AI suggestion:', err);
            return '';
        }
    };

    return { fillAllAspects, fillSingleAspect, loading, error };
};

const SellSimilarDialog = ({ open, onClose, onSelect, listings }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Select Listing to Copy</DialogTitle>
            <DialogContent>
                <List>
                    {listings.map((listing) => (
                        <ListItem key={listing.itemId} button onClick={() => onSelect(listing.itemId)}>
                            <ListItemText
                                primary={listing.title}
                                secondary={`Price: $${listing.price} | Sold: ${listing.soldQuantity}`}
                            />
                            <ListItemSecondaryAction>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => onSelect(listing.itemId)}
                                >
                                    Use This
                                </Button>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const renderTerapeakData = () => {
    const { terapeakData, loading, error, timeRange, setTimeRange } = useTerapeakData(product?.upc);

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return (
            <Alert severity="error">
                {error}
            </Alert>
        );
    }

    if (!terapeakData) {
        return null;
    }

    return (
        <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon /> Terapeak Sales Data
                </Typography>
                <FormControl sx={{ minWidth: 200 }}>
                    <Select
                        size="small"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as '30' | '90' | '365')}
                    >
                        <MenuItem value="365">Last 365 days</MenuItem>
                        <MenuItem value="90">Last 90 days</MenuItem>
                        <MenuItem value="30">Last 30 days</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            
            <Grid container spacing={2}>
                <Grid item xs={12} lg={8}>
                    <Card variant="outlined">
                        <CardContent>
                            <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                                <Box>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Total Sold
                                    </Typography>
                                    <Typography variant="h6">
                                        {terapeakData.metrics.totalSold}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Avg Sold Price
                                    </Typography>
                                    <Typography variant="h6">
                                        ${terapeakData.metrics.avgSoldPrice.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Total GMV
                                    </Typography>
                                    <Typography variant="h6">
                                        ${terapeakData.metrics.totalGMV.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Sell Through
                                    </Typography>
                                    <Typography variant="h6">
                                        {terapeakData.metrics.sellThrough}%
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="h6" gutterBottom>
                                Top Performing Listings
                            </Typography>
                            <TopSellerListings listings={terapeakData.topListings} />
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} lg={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                                Market Insights
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" gutterBottom>
                                    • Most successful listing sold {terapeakData.topListings[0]?.soldQuantity} units
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    • Highest price achieved: ${Math.max(...terapeakData.topListings.map((l: any) => l.price))}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    • Average shipping cost: ${terapeakData.metrics.avgShipping.toFixed(2)}
                                </Typography>
                                
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Recommendations
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        • Use title format from top seller: 
                                        {terapeakData.topListings[0]?.title}
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        • Price competitively between ${terapeakData.metrics.avgSoldPrice.toFixed(2)} and ${Math.max(...terapeakData.topListings.slice(0, 3).map((l: any) => l.price))}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

const renderDescriptionEditor = () => {
    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>Description</Typography>
            <TextField
                fullWidth
                multiline
                rows={6}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                variant="outlined"
                margin="normal"
                required
                error={!formData.description}
                helperText={!formData.description ? 'Description is required' : ''}
            />
        </Box>
    );
};

const renderItemSpecifics = () => {
    const { aspects, loading: aspectsLoading, error: aspectsError } = useItemSpecifics(formData.categoryId);
    const { fillAllAspects, fillSingleAspect, loading: aiLoading, error: aiError } = useAIAssistance(
        formData.categoryId,
        {
            title: formData.title,
            upc: product?.upc,
            brand: formData.brand,
            category: selectedCategory,
            description: formData.description
        }
    );
    const [bulkEditorOpen, setBulkEditorOpen] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<{[key: string]: any}>({});

    const fetchAllAspectSuggestions = async () => {
        try {
            const response = await fetch('/api/ai/item-specifics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category_id: formData.categoryId,
                    context: {
                        title: formData.title,
                        upc: product?.upc,
                        brand: formData.brand,
                        category: selectedCategory,
                        description: formData.description
                    }
                }),
            });
            
            if (!response.ok) throw new Error('Failed to get AI suggestions');
            const data = await response.json();
            setAiSuggestions(data);
        } catch (err) {
            console.error('Error getting AI suggestions:', err);
        }
    };

    const fetchSingleAspectSuggestion = async (aspectName: string) => {
        try {
            const response = await fetch(`/api/ai/item-specific/${aspectName}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category_id: formData.categoryId,
                    context: {
                        title: formData.title,
                        upc: product?.upc,
                        brand: formData.brand,
                        category: selectedCategory,
                        description: formData.description
                    }
                }),
            });
            
            if (!response.ok) throw new Error('Failed to get AI suggestion');
            const data = await response.json();
            setAiSuggestions(prev => ({
                ...prev,
                [aspectName]: data[aspectName]
            }));
        } catch (err) {
            console.error('Error getting AI suggestion:', err);
        }
    };

    const handleAIFill = async () => {
        await fetchAllAspectSuggestions();
        setBulkEditorOpen(true);
    };

    const handleSingleAspectAIFill = async (aspectName: string) => {
        await fetchSingleAspectSuggestion(aspectName);
    };

    const handleAspectChange = async (name: string, value: string) => {
        setFormData({
            ...formData,
            itemSpecifics: {
                ...formData.itemSpecifics,
                [name]: value
            }
        });
    };

    if (aspectsLoading || aiLoading) return <CircularProgress />;
    if (aspectsError) return <Alert severity="error">{aspectsError}</Alert>;
    if (!aspects) return null;

    return (
        <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                <Typography variant="h6">Item Specifics</Typography>
                <Box>
                    <Tooltip title="Use AI to fill all item specifics">
                        <IconButton 
                            onClick={handleAIFill}
                            sx={{ ml: 1 }}
                        >
                            <AutoFixHighIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Required Aspects */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="error">Required</Typography>
                {aspects.required.map((aspect) => {
                    const suggestion = aiSuggestions[aspect.name];
                    return (
                        <Box key={aspect.name} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ flexGrow: 1, mr: 1 }}>
                                <Autocomplete
                                    freeSolo
                                    fullWidth
                                    options={aspect.values || []}
                                    value={formData.itemSpecifics[aspect.name] || ''}
                                    onChange={(_, value) => handleAspectChange(aspect.name, value)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            label={aspect.name}
                                            margin="normal"
                                            error={!formData.itemSpecifics[aspect.name]}
                                            helperText={
                                                !formData.itemSpecifics[aspect.name] 
                                                    ? 'This field is required' 
                                                    : suggestion?.confidence !== undefined
                                                    ? `Confidence: ${Math.round(suggestion.confidence * 100)}%`
                                                    : ''
                                            }
                                        />
                                    )}
                                />
                            </Box>
                            <Tooltip title={`Use AI to fill "${aspect.name}"`}>
                                <IconButton
                                    onClick={() => handleSingleAspectAIFill(aspect.name)}
                                    size="small"
                                >
                                    <AutoFixHighIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    );
                })}
            </Box>

            {/* Recommended Aspects */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="primary">Recommended</Typography>
                {aspects.recommended.map((aspect) => {
                    const suggestion = aiSuggestions[aspect.name];
                    return (
                        <Box key={aspect.name} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ flexGrow: 1, mr: 1 }}>
                                <Autocomplete
                                    freeSolo
                                    fullWidth
                                    options={aspect.values || []}
                                    value={formData.itemSpecifics[aspect.name] || ''}
                                    onChange={(_, value) => handleAspectChange(aspect.name, value)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={aspect.name}
                                            margin="normal"
                                            helperText={
                                                suggestion?.confidence !== undefined
                                                    ? `Confidence: ${Math.round(suggestion.confidence * 100)}%`
                                                    : ''
                                            }
                                        />
                                    )}
                                />
                            </Box>
                            <Tooltip title={`Use AI to fill "${aspect.name}"`}>
                                <IconButton
                                    onClick={() => handleSingleAspectAIFill(aspect.name)}
                                    size="small"
                                >
                                    <AutoFixHighIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    );
                })}
            </Box>

            <ItemSpecificsBulkEditor
                open={bulkEditorOpen}
                onClose={() => setBulkEditorOpen(false)}
                onSave={(values) => {
                    setFormData(prev => ({
                        ...prev,
                        itemSpecifics: {
                            ...prev.itemSpecifics,
                            ...values
                        }
                    }));
                }}
                aspects={[...aspects.required, ...aspects.recommended]}
                currentValues={formData.itemSpecifics}
                aiSuggestions={aiSuggestions}
                onRefreshSuggestion={fetchSingleAspectSuggestion}
            />
        </Box>
    );
};

export default function ProductListingForm({ product, onSave, onClose }: ProductListingFormProps) {
    const theme = useTheme();
    const [formData, setFormData] = useState({
        // Basic Info
        title: product?.title || '',
        subtitle: '',
        condition: '1000',
        conditionDescription: '',
        
        // Item Specifics
        brand: product?.brand || '',
        mpn: product?.mpn || '',
        upc: product?.upc || '',
        category: product?.category || '',
        
        // Description
        description: product?.description || '',
        
        // Photos
        images: product?.images || [],
        
        // Price & Quantity
        price: product?.price || '',
        quantity: product?.quantity || 1,
        
        // Shipping
        shippingType: 'calculated',
        weight: '',
        length: '',
        width: '',
        height: '',
        
        // Listing Details
        format: 'FixedPrice',
        duration: 'GTC',
        autoRelist: true,
        acceptOffers: false,
        
        // Item Location
        location: '',
        
        // Payment
        paymentMethods: ['PayPal'],
        returnPolicy: {
            accepted: true,
            days: 30,
            type: 'Money back',
            shippingCost: 'Buyer'
        },
        categorySpecificFields: {} as Record<string, any>,
    });

    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [categoryFields, setCategoryFields] = useState<CategoryField[]>([]);
    const [marketData, setMarketData] = useState<MarketData>({
        avgSoldPrice: 0,
        soldPriceRange: { min: 0, max: 0 },
        avgShipping: 0,
        freeShippingPercentage: 0,
        sellThrough: 0,
        totalSellers: 0,
        salesHistory: []
    });
    const [terapeakData, setTerapeakData] = useState<TerapeakData>({
        avgSoldPrice: 0,
        totalSold: 0,
        sellThrough: 0,
        avgListingPrice: 0,
        totalListings: 0,
        salesTrend: 'stable',
        salesHistory: []
    });

    const [sellSimilarOpen, setSellSimilarOpen] = useState(false);
    const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

    useEffect(() => {
        if (selectedCategory && CATEGORY_SPECIFIC_FIELDS[selectedCategory]) {
            setCategoryFields(CATEGORY_SPECIFIC_FIELDS[selectedCategory]);
        } else {
            setCategoryFields([]);
        }
    }, [selectedCategory]);

    useEffect(() => {
        // Simulated market data - replace with actual API call
        if (product?.upc) {
            // Simulate API call delay
            const delay = setTimeout(() => {
                const mockMarketData: MarketData = {
                    avgSoldPrice: 24.99,
                    soldPriceRange: { min: 19.99, max: 29.99 },
                    avgShipping: 5.99,
                    freeShippingPercentage: 20,
                    sellThrough: 62,
                    totalSellers: 45,
                    lastSold: '2023-12-23',
                    salesHistory: [
                        { date: '2023-12-23', price: 22.99, shipping: 5.99, condition: 'New', title: 'Product Title' },
                        { date: '2023-12-22', price: 25.99, shipping: 5.99, condition: 'New', title: 'Product Title' },
                        { date: '2023-12-21', price: 23.99, shipping: 5.99, condition: 'New', title: 'Product Title' },
                        { date: '2023-12-20', price: 24.99, shipping: 5.99, condition: 'New', title: 'Product Title' },
                        { date: '2023-12-19', price: 26.99, shipping: 5.99, condition: 'New', title: 'Product Title' },
                    ],
                };
                setMarketData(mockMarketData);
            }, 1000);

            return () => clearTimeout(delay);
        }
    }, [product?.upc]);

    useEffect(() => {
        // Simulated terapeak data - replace with actual API call
        if (product?.upc) {
            // Simulate API call delay
            const delay = setTimeout(() => {
                const mockTerapeakData: TerapeakData = {
                    avgSoldPrice: 24.99,
                    totalSold: 100,
                    sellThrough: 62,
                    avgListingPrice: 29.99,
                    totalListings: 150,
                    salesTrend: 'up',
                    salesHistory: [
                        { date: '2023-12-23', soldPrice: 22.99, shipping: 5.99, condition: 'New', itemLocation: 'USA' },
                        { date: '2023-12-22', soldPrice: 25.99, shipping: 5.99, condition: 'New', itemLocation: 'USA' },
                        { date: '2023-12-21', soldPrice: 23.99, shipping: 5.99, condition: 'New', itemLocation: 'USA' },
                        { date: '2023-12-20', soldPrice: 24.99, shipping: 5.99, condition: 'New', itemLocation: 'USA' },
                        { date: '2023-12-19', soldPrice: 26.99, shipping: 5.99, condition: 'New', itemLocation: 'USA' },
                    ],
                };
                setTerapeakData(mockTerapeakData);
            }, 1000);

            return () => clearTimeout(delay);
        }
    }, [product?.upc]);

    const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [field]: event.target.value });
    };

    const handleCategoryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const category = event.target.value as string;
        setSelectedCategory(category);
        setFormData(prev => ({
            ...prev,
            category,
            categorySpecificFields: {} // Reset category-specific fields when category changes
        }));
    };

    const handleCategoryFieldChange = (fieldName: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            categorySpecificFields: {
                ...prev.categorySpecificFields,
                [fieldName]: value
            }
        }));
    };

    const handleImageReorder = (result: any) => {
        if (!result.destination) return;
        
        const items = Array.from(formData.images);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        
        setFormData({ ...formData, images: items });
    };

    const handleImageDelete = (index: number) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData({ ...formData, images: newImages });
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    const handleSellSimilar = async (itemId: string) => {
        try {
            const response = await fetch(`/api/listings/${itemId}`);
            const data = await response.json();
            if (response.ok) {
                setFormData({
                    ...formData,
                    title: data.title,
                    description: data.description,
                    price: data.price,
                    condition: data.condition_id,
                    conditionDescription: data.condition_description,
                    itemSpecifics: data.item_specifics,
                    quantity: data.quantity,
                    shippingDetails: data.shipping_details,
                    returnPolicy: data.return_policy
                });
                setSellSimilarOpen(false);
            }
        } catch (err) {
            console.error('Error fetching listing details:', err);
        }
    };

    const renderCategoryFields = () => {
        if (!categoryFields.length) return null;

        return (
            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    {selectedCategory} Specific Details
                </Typography>
                <Grid container spacing={3}>
                    {categoryFields.map((field) => (
                        <Grid item xs={12} md={6} key={field.name}>
                            {field.type === 'select' ? (
                                <FormControl fullWidth>
                                    <InputLabel>{field.label}{field.required ? ' *' : ''}</InputLabel>
                                    <Select
                                        value={formData.categorySpecificFields[field.name] || ''}
                                        onChange={(e) => handleCategoryFieldChange(field.name, e.target.value)}
                                        label={field.label}
                                        required={field.required}
                                    >
                                        {field.options?.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            ) : field.type === 'multiselect' ? (
                                <FormControl fullWidth>
                                    <InputLabel>{field.label}{field.required ? ' *' : ''}</InputLabel>
                                    <Select
                                        multiple
                                        value={formData.categorySpecificFields[field.name] || []}
                                        onChange={(e) => handleCategoryFieldChange(field.name, e.target.value)}
                                        label={field.label}
                                        required={field.required}
                                        renderValue={(selected: any) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {(selected as string[]).map((value) => (
                                                    <Chip key={value} label={value} />
                                                ))}
                                            </Box>
                                        )}
                                    >
                                        {field.options?.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            ) : (
                                <TextField
                                    fullWidth
                                    label={`${field.label}${field.required ? ' *' : ''}`}
                                    type={field.type}
                                    value={formData.categorySpecificFields[field.name] || ''}
                                    onChange={(e) => handleCategoryFieldChange(field.name, e.target.value)}
                                    required={field.required}
                                    InputProps={field.unit ? {
                                        endAdornment: <InputAdornment position="end">{field.unit}</InputAdornment>,
                                    } : undefined}
                                />
                            )}
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    };

    const renderMarketData = () => (
        <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon /> Sales Data
                </Typography>
                <FormControl sx={{ minWidth: 200 }}>
                    <Select
                        size="small"
                        value="year"
                        onChange={() => {}}
                    >
                        <MenuItem value="year">Last 365 days</MenuItem>
                        <MenuItem value="90days">Last 90 days</MenuItem>
                        <MenuItem value="30days">Last 30 days</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            
            <Grid container spacing={2}>
                <Grid item xs={12} lg={8}>
                    <Card variant="outlined">
                        <CardContent>
                            <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                                <Box>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Avg sold price
                                    </Typography>
                                    <Typography variant="h6">
                                        ${marketData.avgSoldPrice.toFixed(2)}
                                    </Typography>
                                    <Tooltip title="Average price items sold for, excluding shipping">
                                        <IconButton size="small">
                                            <InfoIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Sold price range
                                    </Typography>
                                    <Typography variant="h6">
                                        ${marketData.soldPriceRange.min.toFixed(2)} - ${marketData.soldPriceRange.max.toFixed(2)}
                                    </Typography>
                                    <Tooltip title="Range of prices items sold for">
                                        <IconButton size="small">
                                            <InfoIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Avg shipping
                                    </Typography>
                                    <Typography variant="h6">
                                        ${marketData.avgShipping.toFixed(2)}
                                    </Typography>
                                    <Tooltip title="Average shipping cost">
                                        <IconButton size="small">
                                            <InfoIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Free shipping
                                    </Typography>
                                    <Typography variant="h6">
                                        {marketData.freeShippingPercentage}%
                                    </Typography>
                                    <Tooltip title="Percentage of listings offering free shipping">
                                        <IconButton size="small">
                                            <InfoIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={marketData.salesHistory}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="date" 
                                            tickFormatter={(date) => new Date(date).toLocaleDateString()}
                                        />
                                        <YAxis 
                                            tickFormatter={(value) => `$${value}`}
                                        />
                                        <Tooltip 
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <Card sx={{ p: 1.5, boxShadow: 2, maxWidth: 300 }}>
                                                            <Typography variant="subtitle2">
                                                                {new Date(label).toLocaleDateString()}
                                                            </Typography>
                                                            <Typography variant="body2" color="textSecondary">
                                                                {data.title}
                                                            </Typography>
                                                            <Box sx={{ mt: 1 }}>
                                                                <Typography variant="body2">
                                                                    Price: ${data.price}
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    Shipping: ${data.shipping}
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    Condition: {data.condition}
                                                                </Typography>
                                                            </Box>
                                                        </Card>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="price" 
                                            stroke={theme.palette.primary.main}
                                            dot={{ r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} lg={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                                Market Summary
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Sell-through rate
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={marketData.sellThrough}
                                            sx={{ flexGrow: 1 }}
                                        />
                                        <Typography variant="body2">
                                            {marketData.sellThrough}%
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" color="textSecondary">
                                        Based on {marketData.totalSellers} sellers
                                    </Typography>
                                </Box>

                                {marketData.lastSold && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Last sold
                                        </Typography>
                                        <Typography variant="body2">
                                            {new Date(marketData.lastSold).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                )}

                                <Box>
                                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                        Pricing recommendations
                                    </Typography>
                                    <Typography variant="body2">
                                        • List between ${marketData.soldPriceRange.min.toFixed(2)} - ${marketData.soldPriceRange.max.toFixed(2)}
                                    </Typography>
                                    <Typography variant="body2">
                                        • {marketData.freeShippingPercentage}% of sellers offer free shipping
                                    </Typography>
                                    {marketData.avgShipping > 0 && (
                                        <Typography variant="body2">
                                            • Average shipping cost is ${marketData.avgShipping.toFixed(2)}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );

    const renderTerapeakData = () => {
        const { terapeakData, loading, error, timeRange, setTimeRange } = useTerapeakData(product?.upc);

        if (loading) {
            return <CircularProgress />;
        }

        if (error) {
            return (
                <Alert severity="error">
                    {error}
                </Alert>
            );
        }

        if (!terapeakData) {
            return null;
        }

        return (
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUpIcon /> Terapeak Sales Data
                    </Typography>
                    <FormControl sx={{ minWidth: 200 }}>
                        <Select
                            size="small"
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as '30' | '90' | '365')}
                        >
                            <MenuItem value="365">Last 365 days</MenuItem>
                            <MenuItem value="90">Last 90 days</MenuItem>
                            <MenuItem value="30">Last 30 days</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                
                <Grid container spacing={2}>
                    <Grid item xs={12} lg={8}>
                        <Card variant="outlined">
                            <CardContent>
                                <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Total Sold
                                        </Typography>
                                        <Typography variant="h6">
                                            {terapeakData.metrics.totalSold}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Avg Sold Price
                                        </Typography>
                                        <Typography variant="h6">
                                            ${terapeakData.metrics.avgSoldPrice.toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Total GMV
                                        </Typography>
                                        <Typography variant="h6">
                                            ${terapeakData.metrics.totalGMV.toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Sell Through
                                        </Typography>
                                        <Typography variant="h6">
                                            {terapeakData.metrics.sellThrough}%
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Typography variant="h6" gutterBottom>
                                    Top Performing Listings
                                </Typography>
                                <TopSellerListings listings={terapeakData.topListings} />
                            </CardContent>
                        </Card>
                    </Grid>
                    
                    <Grid item xs={12} lg={4}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle2" gutterBottom>
                                    Market Insights
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" gutterBottom>
                                        • Most successful listing sold {terapeakData.topListings[0]?.soldQuantity} units
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        • Highest price achieved: ${Math.max(...terapeakData.topListings.map((l: any) => l.price))}
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        • Average shipping cost: ${terapeakData.metrics.avgShipping.toFixed(2)}
                                    </Typography>
                                    
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Recommendations
                                        </Typography>
                                        <Typography variant="body2" gutterBottom>
                                            • Use title format from top seller: 
                                            {terapeakData.topListings[0]?.title}
                                        </Typography>
                                        <Typography variant="body2" gutterBottom>
                                            • Price competitively between ${terapeakData.metrics.avgSoldPrice.toFixed(2)} and ${Math.max(...terapeakData.topListings.slice(0, 3).map((l: any) => l.price))}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    const renderListingForm = () => (
        <Grid container spacing={3}>
            {/* Basic Info */}
            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                <TextField
                    fullWidth
                    required
                    label="Title"
                    value={formData.title}
                    onChange={handleChange('title')}
                    helperText={`${formData.title.length}/80 characters`}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="Subtitle (Optional)"
                    value={formData.subtitle}
                    onChange={handleChange('subtitle')}
                    helperText={`${formData.subtitle.length}/55 characters`}
                />
            </Grid>

            {/* Category & Condition */}
            <Grid item xs={12} md={6}>
                <FormControl fullWidth required sx={{ mb: 2 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {Object.keys(CATEGORY_SPECIFIC_FIELDS).map((cat) => (
                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                
                <FormControl fullWidth required>
                    <InputLabel>Condition</InputLabel>
                    <Select
                        value={formData.condition}
                        onChange={handleChange('condition')}
                    >
                        <MenuItem value="New">New</MenuItem>
                        <MenuItem value="Used">Used</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            {/* Price & Quantity */}
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    required
                    type="number"
                    label="Price"
                    value={formData.price}
                    onChange={handleChange('price')}
                    InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    required
                    type="number"
                    label="Quantity"
                    value={formData.quantity}
                    onChange={handleChange('quantity')}
                />
            </Grid>

            {/* Format & Duration */}
            <Grid item xs={12} md={6}>
                <FormControl fullWidth required sx={{ mb: 2 }}>
                    <InputLabel>Format</InputLabel>
                    <Select
                        value={formData.format}
                        onChange={handleChange('format')}
                    >
                        <MenuItem value="FixedPrice">Fixed Price</MenuItem>
                        <MenuItem value="Auction">Auction</MenuItem>
                        <MenuItem value="AuctionBIN">Auction with Buy It Now</MenuItem>
                    </Select>
                </FormControl>

                <FormControl fullWidth required>
                    <InputLabel>Duration</InputLabel>
                    <Select
                        value={formData.duration}
                        onChange={handleChange('duration')}
                    >
                        <MenuItem value="Days_1">1 Day</MenuItem>
                        <MenuItem value="Days_3">3 Days</MenuItem>
                        <MenuItem value="Days_5">5 Days</MenuItem>
                        <MenuItem value="Days_7">7 Days</MenuItem>
                        <MenuItem value="Days_10">10 Days</MenuItem>
                        <MenuItem value="Days_30">30 Days</MenuItem>
                        <MenuItem value="GTC">Good 'Til Cancelled</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            {/* Funko Specific Fields */}
            {selectedCategory === 'Funko' && (
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Funko Details</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                required
                                label="Pop Number"
                                value={formData.popNumber}
                                onChange={handleChange('popNumber')}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth required>
                                <InputLabel>Product Line</InputLabel>
                                <Select
                                    value={formData.productLine}
                                    onChange={handleChange('productLine')}
                                >
                                    {FUNKO_SPECIFIC_FIELDS.productLine.options.map((option) => (
                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth required>
                                <InputLabel>Box Condition</InputLabel>
                                <Select
                                    value={formData.boxCondition}
                                    onChange={handleChange('boxCondition')}
                                >
                                    {FUNKO_SPECIFIC_FIELDS.boxCondition.options.map((option) => (
                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Exclusive Release</InputLabel>
                                <Select
                                    value={formData.exclusiveRelease}
                                    onChange={handleChange('exclusiveRelease')}
                                >
                                    {FUNKO_SPECIFIC_FIELDS.exclusiveRelease.options.map((option) => (
                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth required>
                                <InputLabel>Theme</InputLabel>
                                <Select
                                    value={formData.theme}
                                    onChange={handleChange('theme')}
                                >
                                    {FUNKO_SPECIFIC_FIELDS.theme.options.map((option) => (
                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                required
                                label="Character"
                                value={formData.character}
                                onChange={handleChange('character')}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Features</InputLabel>
                                <Select
                                    multiple
                                    value={formData.features || []}
                                    onChange={handleChange('features')}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={value} />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {FUNKO_SPECIFIC_FIELDS.features.options.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            <Checkbox checked={(formData.features || []).indexOf(option) > -1} />
                                            <ListItemText primary={option} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Grid>
            )}

            {/* Shipping */}
            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Shipping</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth required sx={{ mb: 2 }}>
                            <InputLabel>Shipping Type</InputLabel>
                            <Select
                                value={formData.shippingType}
                                onChange={handleChange('shippingType')}
                            >
                                {LISTING_FIELDS.shippingType.options.map((option) => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            required
                            type="number"
                            label="Package Weight (oz)"
                            value={formData.packageWeight}
                            onChange={handleChange('packageWeight')}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>Package Dimensions</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    required
                                    type="number"
                                    label="Length"
                                    value={formData.packageDimensions?.length}
                                    onChange={handleChange('packageDimensions.length')}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    required
                                    type="number"
                                    label="Width"
                                    value={formData.packageDimensions?.width}
                                    onChange={handleChange('packageDimensions.width')}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    required
                                    type="number"
                                    label="Height"
                                    value={formData.packageDimensions?.height}
                                    onChange={handleChange('packageDimensions.height')}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
                {renderDescriptionEditor()}
            </Grid>
        </Grid>
    );

    const renderItemSpecificsSection = () => {
        return (
            <Grid item xs={12}>
                {renderItemSpecifics()}
            </Grid>
        );
    };

    return (
        <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
            <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ color: theme.palette.primary.main }}>
                    Create Your Listing
                </Typography>
                
                {/* Title Section */}
                <Box sx={{ mb: 4 }}>
                    <TextField
                        fullWidth
                        label="Title"
                        value={formData.title}
                        onChange={handleChange('title')}
                        helperText={`${formData.title.length}/80 characters`}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Subtitle (Optional)"
                        value={formData.subtitle}
                        onChange={handleChange('subtitle')}
                        helperText="Add a subtitle for more visibility (additional fee applies)"
                    />
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Market Data Section */}
                {renderMarketData()}

                <Divider sx={{ my: 4 }} />

                {/* Terapeak Data Section */}
                {renderTerapeakData()}

                <Divider sx={{ my: 4 }} />

                {/* Photos Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Photos
                    </Typography>
                    <DragDropContext onDragEnd={handleImageReorder}>
                        <Droppable droppableId="images" direction="horizontal">
                            {(provided) => (
                                <Grid container spacing={2} {...provided.droppableProps} ref={provided.innerRef}>
                                    {formData.images.map((image: string, index: number) => (
                                        <Draggable key={image} draggableId={image} index={index}>
                                            {(provided) => (
                                                <Grid item xs={3} 
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                >
                                                    <Paper 
                                                        elevation={2}
                                                        sx={{ 
                                                            position: 'relative',
                                                            paddingTop: '100%',
                                                            backgroundImage: `url(${image})`,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center'
                                                        }}
                                                    >
                                                        <Box sx={{ 
                                                            position: 'absolute',
                                                            top: 0,
                                                            right: 0,
                                                            p: 0.5
                                                        }}>
                                                            <IconButton 
                                                                size="small"
                                                                onClick={() => handleImageDelete(index)}
                                                                sx={{ 
                                                                    bgcolor: 'rgba(255,255,255,0.8)',
                                                                    '&:hover': {
                                                                        bgcolor: 'rgba(255,255,255,0.9)'
                                                                    }
                                                                }}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Box>
                                                        <Box 
                                                            {...provided.dragHandleProps}
                                                            sx={{ 
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                p: 0.5
                                                            }}
                                                        >
                                                            <DragIcon sx={{ color: 'rgba(0,0,0,0.5)' }} />
                                                        </Box>
                                                    </Paper>
                                                </Grid>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    <Grid item xs={3}>
                                        <Paper 
                                            elevation={0}
                                            sx={{ 
                                                height: '100%',
                                                minHeight: 200,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: `2px dashed ${theme.palette.divider}`,
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    borderColor: theme.palette.primary.main
                                                }
                                            }}
                                        >
                                            <Box sx={{ textAlign: 'center' }}>
                                                <AddPhotoIcon sx={{ fontSize: 40, color: theme.palette.text.secondary }} />
                                                <Typography variant="body2" color="textSecondary">
                                                    Add Photos
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            )}
                        </Droppable>
                    </DragDropContext>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Item Specifics */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Item Specifics
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Condition</InputLabel>
                                <Select
                                    value={formData.condition}
                                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                    label="Condition"
                                >
                                    {CONDITIONS.map((condition) => (
                                        <MenuItem key={condition.id} value={condition.id}>
                                            <Box>
                                                <Typography variant="body1">
                                                    {condition.label}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {condition.description}
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Condition Description"
                                value={formData.conditionDescription}
                                onChange={handleChange('conditionDescription')}
                                helperText="Describe any defects, repairs, or unique characteristics"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Brand"
                                value={formData.brand}
                                onChange={handleChange('brand')}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="MPN"
                                value={formData.mpn}
                                onChange={handleChange('mpn')}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="UPC"
                                value={formData.upc}
                                onChange={handleChange('upc')}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Category"
                                value={formData.category}
                                onChange={handleChange('category')}
                            />
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Category Selection */}
                <Box sx={{ mb: 4 }}>
                    <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            label="Category"
                        >
                            {Object.keys(CATEGORY_SPECIFIC_FIELDS).map((category) => (
                                <MenuItem key={category} value={category}>
                                    {category}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Category-specific fields */}
                {renderCategoryFields()}

                <Divider sx={{ my: 4 }} />

                {/* Description */}
                <Box sx={{ mb: 4 }}>
                    {renderDescriptionEditor()}
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Price & Quantity */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Price & Quantity
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Price"
                                type="number"
                                value={formData.price}
                                onChange={handleChange('price')}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                                sx={{ mb: 2 }}
                            />
                            <FormControl fullWidth>
                                <InputLabel>Format</InputLabel>
                                <Select
                                    value={formData.format}
                                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                                    label="Format"
                                >
                                    <MenuItem value="FixedPrice">Buy It Now</MenuItem>
                                    <MenuItem value="Auction">Auction</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Quantity"
                                type="number"
                                value={formData.quantity}
                                onChange={handleChange('quantity')}
                                sx={{ mb: 2 }}
                            />
                            <FormControl fullWidth>
                                <InputLabel>Duration</InputLabel>
                                <Select
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    label="Duration"
                                >
                                    {LISTING_DURATIONS.map((duration) => (
                                        <MenuItem key={duration} value={duration}>
                                            {duration.replace('_', ' ')}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Shipping */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Shipping
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Shipping Type</InputLabel>
                                <Select
                                    value={formData.shippingType}
                                    onChange={(e) => setFormData({ ...formData, shippingType: e.target.value })}
                                    label="Shipping Type"
                                >
                                    <MenuItem value="calculated">Calculated</MenuItem>
                                    <MenuItem value="flat">Flat Rate</MenuItem>
                                    <MenuItem value="freight">Freight</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                fullWidth
                                label="Item Location"
                                value={formData.location}
                                onChange={handleChange('location')}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>
                                Package Details
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Weight (lbs)"
                                        type="number"
                                        value={formData.weight}
                                        onChange={handleChange('weight')}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Length (in)"
                                        type="number"
                                        value={formData.length}
                                        onChange={handleChange('length')}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Width (in)"
                                        type="number"
                                        value={formData.width}
                                        onChange={handleChange('width')}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Height (in)"
                                        type="number"
                                        value={formData.height}
                                        onChange={handleChange('height')}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                    <Button variant="outlined" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        List Item
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
