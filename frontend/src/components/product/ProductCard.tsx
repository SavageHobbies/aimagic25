import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  CardActionArea,
  Menu,
  MenuItem,
  Chip
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ProductDetailDialog from '../ProductDetailDialog';

interface ProductCardProps {
  product: {
    title: string;
    images?: string[];
    description?: string;
    upc?: string;
    brand?: string;
    price?: number;
    condition?: string;
    status?: string;
    [key: string]: any;
  };
  onAction?: (action: string, product: any) => void;
}

export default function ProductCard({ product, onAction }: ProductCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenDetails = (event: React.MouseEvent) => {
    event.stopPropagation();
    setDetailOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailOpen(false);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event: React.MouseEvent) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const handleAction = (action: string) => {
    handleMenuClose;
    if (onAction) {
      onAction(action, product);
    }
  };

  if (!product) {
    return null;
  }

  return (
    <>
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'relative',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}>
        {product.status && (
          <Chip
            label={product.status}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              color: 'primary.main'
            }}
          />
        )}
        
        <CardActionArea 
          onClick={handleOpenDetails}
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column',
            height: '100%'
          }}
        >
          <CardMedia
            component="img"
            height="200"
            image={product.images?.[0] || '/placeholder.png'}
            alt={product.title}
            sx={{ objectFit: 'contain', p: 1 }}
          />
          
          <CardContent sx={{ flexGrow: 1, pb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography
                gutterBottom
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  lineHeight: 1.2,
                  mb: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {product.title}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              {product.price !== undefined && (
                <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                  ${product.price.toFixed(2)}
                </Typography>
              )}
              {product.condition && (
                <Chip
                  label={product.condition}
                  size="small"
                  sx={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'primary.main' }}
                />
              )}
            </Box>
          </CardContent>
        </CardActionArea>

        <IconButton
          size="small"
          onClick={handleMenuOpen}
          sx={{ 
            position: 'absolute', 
            top: 8, 
            left: 8, 
            zIndex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)'
            }
          }}
        >
          <MoreVertIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem onClick={() => handleAction('edit')}>Edit</MenuItem>
          <MenuItem onClick={() => handleAction('delete')}>Delete</MenuItem>
          <MenuItem onClick={() => handleAction('duplicate')}>Duplicate</MenuItem>
        </Menu>
      </Card>

      <ProductDetailDialog
        open={detailOpen}
        onClose={handleCloseDetails}
        product={product}
      />
    </>
  );
}
