import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
}> = ({ title, value, icon, trend, color = 'primary.main' }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            backgroundColor: `${color}15`,
            borderRadius: '12px',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        {trend && (
          <Typography
            variant="body2"
            sx={{
              ml: 'auto',
              color: trend.startsWith('+') ? 'success.main' : 'error.main',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {trend}
            <TrendingUpIcon
              sx={{
                ml: 0.5,
                fontSize: '1rem',
                transform: trend.startsWith('+')
                  ? 'none'
                  : 'rotate(180deg)',
              }}
            />
          </Typography>
        )}
      </Box>
      <Typography variant="h4" component="div" sx={{ fontWeight: 600, mb: 1 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [recentDrafts] = React.useState([
    {
      id: '1',
      title: 'Vintage Camera Lens',
      price: 299.99,
      condition: 'Used',
      images: ['https://via.placeholder.com/300'],
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Gaming Console Bundle',
      price: 499.99,
      condition: 'New',
      images: ['https://via.placeholder.com/300'],
      status: 'published' as const,
      createdAt: new Date().toISOString(),
    },
  ]);

  const handleNewListing = () => {
    navigate('/new-listing');
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewListing}
          sx={{
            background: 'linear-gradient(45deg, #2563eb 30%, #3b82f6 90%)',
            color: 'white',
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
          }}
        >
          New Listing
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Listings"
            value="24"
            icon={<InventoryIcon sx={{ color: 'primary.main' }} />}
            trend="+12%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Sales"
            value="$4,295"
            icon={<AttachMoneyIcon sx={{ color: 'success.main' }} />}
            trend="+8%"
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Drafts"
            value="7"
            icon={<InventoryIcon sx={{ color: 'warning.main' }} />}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Success Rate"
            value="92%"
            icon={<TrendingUpIcon sx={{ color: 'info.main' }} />}
            trend="+5%"
            color="#3b82f6"
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Listing Progress
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Monthly Goal</Typography>
            <Typography variant="body2" color="primary">
              24/30 Listings
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={80}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: 'linear-gradient(45deg, #2563eb 30%, #3b82f6 90%)',
              },
            }}
          />
        </Box>
      </Paper>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Recent Drafts
        </Typography>
        <Grid container spacing={3}>
          {recentDrafts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <ProductCard
                product={product}
                onEdit={(id) => navigate(`/drafts/${id}/edit`)}
                onDelete={(id) => console.log('Delete', id)}
                onPublish={(id) => console.log('Publish', id)}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
