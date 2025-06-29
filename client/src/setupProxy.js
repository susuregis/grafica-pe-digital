const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    ['/api/clients', '/api/products', '/api/orders', '/api/dashboard', '/clients', '/products', '/orders', '/dashboard'],
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req) => {
        console.log('Proxying request:', req.method, req.url);
      },
      onProxyRes: (proxyRes, req) => {
        console.log('Received response:', proxyRes.statusCode, req.url);
      }
    })
  );
};
