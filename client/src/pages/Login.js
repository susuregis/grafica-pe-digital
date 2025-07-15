import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Container,
  Snackbar,
  Alert,
  InputAdornment,
  IconButton,
  Avatar,
  useTheme
} from '@mui/material';
import { Visibility, VisibilityOff, Lock as LockIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('copiadorapernambucodigital@hotmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  
  // Verificar se o usuário já está autenticado
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Se o usuário já estiver autenticado, redirecionar
      const destination = location.state?.from?.pathname || '/';
      navigate(destination);
    }
  }, [navigate, location]);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Verificação simplificada de credenciais
      if (email === 'copiadorapernambucodigital@hotmail.com' && password === 'graficarapida250') {
        // Login bem-sucedido, armazena token simulado
        localStorage.setItem('authToken', 'simulado-token-auth-123');
        localStorage.setItem('userEmail', email);
        
        // Redireciona para a dashboard ou página original
        const destination = location.state?.from?.pathname || '/';
        navigate(destination);
      } else {
        // Credenciais inválidas
        throw new Error('invalid-credentials');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error.message);
      let errorMessage = 'E-mail ou senha incorretos.';
      
      setError(errorMessage);
      setOpenAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenAlert(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const theme = useTheme();
  
  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.main} 100%)`,
    }}>
      <Container maxWidth="xs">
        <Paper 
          elevation={6} 
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          {/* Logo da empresa */}
          <Box sx={{ mb: 4, textAlign: 'center', width: '100%' }}>
            <Avatar
              src={process.env.PUBLIC_URL + '/logo.png'} 
              alt="Copiadora Pernambuco"
              sx={{
                width: 120,
                height: 120,
                margin: '0 auto 16px',
                padding: 2,
                backgroundColor: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }}
            />
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                color: theme.palette.primary.main, 
                fontWeight: 600,
                mt: 2,
                mb: 0.5,
                letterSpacing: '-0.5px'
              }}
            >
              COPIADORA PERNAMBUCO
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'text.secondary',
              fontSize: '0.95rem'
            }}>
              Acesse sua conta para continuar
            </Typography>
          </Box>

          {/* Formulário de login */}
          <Box component="form" noValidate onSubmit={handleLogin} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-mail"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2,
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              sx={{
                mt: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2,
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      sx={{ color: showPassword ? theme.palette.primary.main : 'text.secondary' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 4, 
                mb: 3, 
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
                backgroundColor: theme.palette.primary.main,
                transition: 'all 0.3s',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  boxShadow: '0 6px 15px rgba(46, 125, 50, 0.25)',
                  transform: 'translateY(-2px)',
                } 
              }}
              disabled={isLoading}
              startIcon={<LockIcon />}
            >
              {isLoading ? 'Entrando...' : 'Entrar no Sistema'}
            </Button>
            
            <Box sx={{ 
              mt: 3,
              pt: 3, 
              borderTop: '1px solid rgba(0, 0, 0, 0.06)' 
            }}>
              <Typography 
                variant="body2" 
                align="center" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '0.8rem' 
                }}
              >
                © {new Date().getFullYear()} Copiadora Pernambuco - Todos os direitos reservados
              </Typography>
            </Box>
          </Box>

          {/* Mensagens de erro */}
          <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
            <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;
