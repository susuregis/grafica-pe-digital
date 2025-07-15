import React from 'react';
import { Typography } from '@mui/material';

const Dashboard = () => {
  console.log('Dashboard SIMPLES renderizado!');
  
  return (
    <div>
      <Typography variant="h1">TESTE - Dashboard Funcionando!</Typography>
      <Typography variant="h3">Se você está vendo isso, o React está funcionando!</Typography>
      <p>Hora atual: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default Dashboard;
