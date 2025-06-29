import React, { useState, useEffect } from 'react';
import { Typography, Grid, Box, Alert, CircularProgress } from '@mui/material';
import { AssignmentOutlined, ShoppingCartOutlined, PersonOutlineOutlined, InventoryOutlined } from '@mui/icons-material';
import { DashboardCard, OrdersChart } from '../components/DashboardComponents';  // named import, sem default
import { Bar } from 'react-chartjs-2';  // importe Bar aqui!
import { dashboardService } from '../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState({
    totalOrders: 0,
    totalClients: 0,
    totalProducts: 0,
    pendingOrders: 0
  });
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [dailyRevenueChart, setDailyRevenueChart] = useState(null);
  const [monthlyRevenueChart, setMonthlyRevenueChart] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const today = new Date().toISOString().split('T')[0];
        const currentMonth = new Date().toISOString().slice(0, 7);

        const [summaryRes, ordersPerDayRes, dailyRevRes, monthlyRevRes] = await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getOrdersPerDay(),
          dashboardService.getDailyRevenue(today),
          dashboardService.getMonthlyRevenue(currentMonth)
        ]);

        setSummaryData(summaryRes.data);

        setChartData({
          labels: ordersPerDayRes.data.map(item => item.date),
          datasets: [{
            label: 'Pedidos',
            data: ordersPerDayRes.data.map(item => item.count),
            backgroundColor: 'rgba(25, 118, 210, 0.6)'
          }]
        });

        setDailyRevenueChart({
          labels: dailyRevRes.data.orders.map(order => order.clientName),
          datasets: [{
            label: 'Total por Pedido',
            data: dailyRevRes.data.orders.map(order => order.total),
            backgroundColor: 'rgba(40, 167, 69, 0.6)'
          }]
        });

        setMonthlyRevenueChart({
          labels: monthlyRevRes.data.dailyData.map(day => day.date),
          datasets: [{
            label: 'Faturamento por Dia',
            data: monthlyRevRes.data.dailyData.map(day => day.revenue),
            backgroundColor: 'rgba(255, 193, 7, 0.6)'
          }]
        });

      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError('Não foi possível carregar os dados do dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const renderBarChart = (data, title) => (
    <Box sx={{ height: 300 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Bar
          data={data}
          options={{
            responsive: true,
            plugins: {
              title: { display: true, text: title },
              legend: { display: false }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }}
        />
      )}
    </Box>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard title="Total de Pedidos" value={summaryData.totalOrders} loading={loading} icon={<ShoppingCartOutlined />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard title="Pedidos Pendentes" value={summaryData.pendingOrders} loading={loading} icon={<AssignmentOutlined />} color="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard title="Clientes Cadastrados" value={summaryData.totalClients} loading={loading} icon={<PersonOutlineOutlined />} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard title="Produtos Cadastrados" value={summaryData.totalProducts} loading={loading} icon={<InventoryOutlined />} color="info" />
        </Grid>

        {/* Gráficos */}
        <Grid item xs={12} md={6}>
          <OrdersChart data={chartData} loading={loading} />
        </Grid>

        <Grid item xs={12} md={6}>
          {renderBarChart(dailyRevenueChart, 'Faturamento Diário')}
        </Grid>

        <Grid item xs={12}>
          {renderBarChart(monthlyRevenueChart, 'Faturamento Mensal')}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
