import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Assignment,
} from '@mui/icons-material';
import api from '../services/api';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get('/reports/dashboard');
      setDashboard(response.data.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Financiero
      </Typography>

      <Grid container spacing={3}>
        {/* Resumen Mensual */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUp color="success" />
                <Typography variant="h6" ml={1}>
                  Ingresos del Mes
                </Typography>
              </Box>
              <Typography variant="h4">
                {formatCurrency(dashboard?.summary?.monthlyRevenue || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingDown color="error" />
                <Typography variant="h6" ml={1}>
                  Gastos del Mes
                </Typography>
              </Box>
              <Typography variant="h4">
                {formatCurrency(dashboard?.summary?.monthlyExpenses || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountBalance color="primary" />
                <Typography variant="h6" ml={1}>
                  Total Activos
                </Typography>
              </Box>
              <Typography variant="h4">
                {formatCurrency(dashboard?.summary?.totalAssets || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Assignment color="warning" />
                <Typography variant="h6" ml={1}>
                  Por Cobrar
                </Typography>
              </Box>
              <Typography variant="h4">
                {formatCurrency(dashboard?.receivables?.total || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboard?.receivables?.count || 0} facturas pendientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráficos y análisis adicionales */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumen Anual
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Ingresos Anuales
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(dashboard?.summary?.yearlyRevenue || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Gastos Anuales
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(dashboard?.summary?.yearlyExpenses || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Utilidad Anual
                  </Typography>
                  <Typography variant="h5" color={dashboard?.summary?.yearlyProfit >= 0 ? 'success.main' : 'error.main'}>
                    {formatCurrency(dashboard?.summary?.yearlyProfit || 0)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
