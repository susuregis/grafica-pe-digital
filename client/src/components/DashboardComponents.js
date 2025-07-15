import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Componente DashboardCard (Cartão do resumo)
export const DashboardCard = ({ title, value, loading, icon, color }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        textAlign: 'center',
        padding: '16px'
      }}>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          gutterBottom 
          align="center"
          sx={{ width: '100%', textAlign: 'center' }}
        >
          {title}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center', 
          mt: 2,
          width: '100%'
        }}>
          <Box sx={{
            backgroundColor: `${color}.light`,
            color: `${color}.dark`,
            borderRadius: '50%',
            p: 1,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </Box>

          {loading ? (
            <CircularProgress size={24} />
          ) : (
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 'bold', 
                color: `${color}.main`,
                width: '100%',
                textAlign: 'center'
              }}
            >
              {value}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

// Componente OrdersChart (Gráfico de barras)
export const OrdersChart = ({ data, loading }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    },
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Pedidos por dia (últimos 7 dias)' }
    }
  };

  return (
    <Card sx={{ height: '100%', minHeight: 300 }}>
      <CardContent sx={{ height: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ height: 250 }}>
            <Bar options={options} data={data} height={250} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
