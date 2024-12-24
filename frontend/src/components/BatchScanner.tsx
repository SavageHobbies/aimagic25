import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import useSound from 'use-sound';

// Sound effects
const successSound = '/sounds/success.mp3';
const errorSound = '/sounds/error.mp3';
const warningSound = '/sounds/warning.mp3';

interface InventoryItem {
  upc: string;
  quantity: number;
  product_info: {
    title: string;
    brand: string;
    images: string[];
    description: string;
    category: string;
  };
  market_data: {
    price_analysis?: {
      median: number;
      min: number;
      max: number;
    };
  };
  suggested_price: number;
  transaction_history?: any[];
  price_trends?: any;
}

interface DetailDialogProps {
  item: InventoryItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (updatedItem: InventoryItem) => void;
}

const DetailDialog: React.FC<DetailDialogProps> = ({ item, open, onClose, onSave }) => {
  const [editedItem, setEditedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    setEditedItem(item);
  }, [item]);

  if (!editedItem) return null;

  const handleSave = () => {
    if (editedItem) {
      onSave(editedItem);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Product Details
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            {editedItem.product_info.images?.[0] && (
              <img
                src={editedItem.product_info.images[0]}
                alt={editedItem.product_info.title}
                style={{ width: '100%', height: 'auto' }}
              />
            )}
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Title"
              value={editedItem.product_info.title}
              onChange={(e) =>
                setEditedItem({
                  ...editedItem,
                  product_info: {
                    ...editedItem.product_info,
                    title: e.target.value,
                  },
                })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Brand"
              value={editedItem.product_info.brand}
              onChange={(e) =>
                setEditedItem({
                  ...editedItem,
                  product_info: {
                    ...editedItem.product_info,
                    brand: e.target.value,
                  },
                })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Category"
              value={editedItem.product_info.category}
              onChange={(e) =>
                setEditedItem({
                  ...editedItem,
                  product_info: {
                    ...editedItem.product_info,
                    category: e.target.value,
                  },
                })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={editedItem.product_info.description}
              onChange={(e) =>
                setEditedItem({
                  ...editedItem,
                  product_info: {
                    ...editedItem.product_info,
                    description: e.target.value,
                  },
                })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Price"
              type="number"
              value={editedItem.suggested_price}
              onChange={(e) =>
                setEditedItem({
                  ...editedItem,
                  suggested_price: parseFloat(e.target.value),
                })
              }
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {editedItem.market_data?.price_analysis && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Market Analysis
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2">Median Price</Typography>
                    <Typography variant="h6">
                      ${editedItem.market_data.price_analysis.median.toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2">Minimum Price</Typography>
                    <Typography variant="h6">
                      ${editedItem.market_data.price_analysis.min.toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2">Maximum Price</Typography>
                    <Typography variant="h6">
                      ${editedItem.market_data.price_analysis.max.toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleSave} fullWidth>
              Save Changes
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

const BatchScanner: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanner, setScanner] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [manualUPC, setManualUPC] = useState('');
  const [offlineMode, setOfflineMode] = useState(false);
  
  // Sound effects
  const [playSuccess] = useSound(successSound);
  const [playError] = useSound(errorSound);
  const [playWarning] = useSound(warningSound);

  useEffect(() => {
    // Load inventory from local storage
    const savedInventory = localStorage.getItem('inventory');
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    }
  }, []);

  useEffect(() => {
    // Save inventory to local storage
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  const startScanner = () => {
    setIsScanning(true);
    const newScanner = new Html5QrcodeScanner(
      'reader',
      {
        qrbox: {
          width: 250,
          height: 150,
        },
        fps: 5,
      },
      false
    );

    newScanner.render(onScanSuccess, onScanError);
    setScanner(newScanner);
  };

  const stopScanner = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
    setIsScanning(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    await processUPC(decodedText);
  };

  const onScanError = (error: any) => {
    console.warn(`Code scan error = ${error}`);
  };

  const processUPC = async (upc: string) => {
    setLoading(true);
    setError(null);

    try {
      // Check if item already exists in inventory
      const existingItem = inventory.find((item) => item.upc === upc);
      if (existingItem) {
        // Increment quantity
        const updatedInventory = inventory.map((item) =>
          item.upc === upc
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        setInventory(updatedInventory);
        playSuccess();
        return;
      }

      if (offlineMode) {
        playWarning();
        setError('Cannot lookup new items in offline mode');
        return;
      }

      const response = await fetch('http://localhost:8000/api/upc/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ upc, quantity: 1 }),
      });

      if (!response.ok) {
        throw new Error('Failed to look up UPC');
      }

      const data = await response.json();
      setInventory([...inventory, data]);
      playSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to look up UPC');
      playError();
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUPC) {
      await processUPC(manualUPC);
      setManualUPC('');
    }
  };

  const handleQuantityChange = (upc: string, delta: number) => {
    const updatedInventory = inventory.map((item) => {
      if (item.upc === upc) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setInventory(updatedInventory.filter((item) => item.quantity > 0));
  };

  const handleDeleteItem = (upc: string) => {
    setInventory(inventory.filter((item) => item.upc !== upc));
  };

  const handleItemClick = async (item: InventoryItem) => {
    if (!offlineMode) {
      // Fetch latest data
      try {
        const response = await fetch(`http://localhost:8000/api/upc/inventory/${item.upc}`);
        if (response.ok) {
          const updatedItem = await response.json();
          setSelectedItem(updatedItem);
        }
      } catch (error) {
        console.error('Failed to fetch latest item data:', error);
        setSelectedItem(item);
      }
    } else {
      setSelectedItem(item);
    }
  };

  const handleSaveItem = (updatedItem: InventoryItem) => {
    const updatedInventory = inventory.map((item) =>
      item.upc === updatedItem.upc ? updatedItem : item
    );
    setInventory(updatedInventory);
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={startScanner}
                disabled={isScanning}
                fullWidth
              >
                Start Barcode Scanner
              </Button>
            </Grid>
            <Grid item xs={12}>
              <form onSubmit={handleManualSubmit}>
                <Grid container spacing={1}>
                  <Grid item xs={9}>
                    <TextField
                      fullWidth
                      label="Enter UPC Manually"
                      value={manualUPC}
                      onChange={(e) => setManualUPC(e.target.value)}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={!manualUPC || loading}
                      sx={{ height: '56px' }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Add'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                onClick={() => setOfflineMode(!offlineMode)}
                color={offlineMode ? 'warning' : 'primary'}
                startIcon={offlineMode ? <WarningIcon /> : null}
              >
                {offlineMode ? 'Offline Mode' : 'Online Mode'}
              </Button>
            </Grid>
          </Grid>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="center">Quantity</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.upc} hover>
                <TableCell>
                  {item.product_info.images?.[0] && (
                    <img
                      src={item.product_info.images[0]}
                      alt={item.product_info.title}
                      style={{ width: 50, height: 50, objectFit: 'contain' }}
                    />
                  )}
                </TableCell>
                <TableCell>{item.product_info.title}</TableCell>
                <TableCell>{item.product_info.brand}</TableCell>
                <TableCell align="right">
                  ${item.suggested_price?.toFixed(2)}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleQuantityChange(item.upc, -1)}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography component="span" sx={{ mx: 1 }}>
                    {item.quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleQuantityChange(item.upc, 1)}
                  >
                    <AddIcon />
                  </IconButton>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleItemClick(item)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteItem(item.upc)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={isScanning}
        onClose={stopScanner}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Scan Barcode
          <IconButton
            onClick={stopScanner}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box id="reader" sx={{ width: '100%' }} />
        </DialogContent>
      </Dialog>

      <DetailDialog
        item={selectedItem}
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        onSave={handleSaveItem}
      />
    </Box>
  );
};

export default BatchScanner;
