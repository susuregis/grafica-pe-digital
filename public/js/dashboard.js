// Dashboard functionality

function loadDashboard() {
    showLoading('dashboard-page');
    loadDailyRevenue();
    loadMonthlyRevenue();
    setupDashboardControls();
}

function setupDashboardControls() {
    const dailyDateInput = document.getElementById('daily-revenue-date');
    const monthlyMonthInput = document.getElementById('monthly-revenue-month');
    
    // Definir valores iniciais para os inputs de data
    const today = new Date();
    dailyDateInput.value = today.toISOString().slice(0, 10);
    monthlyMonthInput.value = today.toISOString().slice(0, 7);

    dailyDateInput.addEventListener('change', (e) => {
        loadDailyRevenue(e.target.value);
    });

    monthlyMonthInput.addEventListener('change', (e) => {
        loadMonthlyRevenue(e.target.value);
    });
}

function loadDailyRevenue(date = new Date().toISOString().slice(0, 10)) {
    const chartContainer = document.getElementById('daily-revenue-chart');
    chartContainer.innerHTML = '<div class="text-center p-5"><div class="loading-spinner"></div><p class="mt-2">Carregando...</p></div>';
    const backendUrl = 'http://localhost:3001';

    fetch(`${backendUrl}/dashboard/daily-revenue?date=${date}`)
        .then(response => response.json())
        .then(data => {
            renderDailyRevenue(data);
        })
        .catch(error => {
            chartContainer.innerHTML = `<div class="alert alert-warning">Não foi possível carregar os dados.</div>`;
            console.error('Error loading daily revenue:', error);
        });
}

function loadMonthlyRevenue(month = new Date().toISOString().slice(0, 7)) {
    const chartContainer = document.getElementById('monthly-revenue-chart');
    chartContainer.innerHTML = '<div class="text-center p-5"><div class="loading-spinner"></div><p class="mt-2">Carregando...</p></div>';
    const backendUrl = 'http://localhost:3001';

    fetch(`${backendUrl}/dashboard/monthly-revenue?month=${month}`)
        .then(response => response.json())
        .then(data => {
            renderMonthlyRevenue(data);
        })
        .catch(error => {
            chartContainer.innerHTML = `<div class="alert alert-warning">Não foi possível carregar os dados.</div>`;
            console.error('Error loading monthly revenue:', error);
        });
}

function renderDailyRevenue(data) {
    const chartContainer = document.getElementById('daily-revenue-chart');
    if (!data || !data.revenue) {
        chartContainer.innerHTML = `<div class="alert alert-info">Nenhum dado de faturamento para o dia selecionado.</div>`;
        return;
    }
    
    // Formatar a data para exibição
    const formattedDate = formatDateBR(data.date);
    
    // Construir o HTML com os dados de faturamento diário
    let html = `
        <div class="revenue-summary mb-3">
            <h3 class="text-primary mb-2">R$ ${data.revenue.toFixed(2)}</h3>
            <p class="text-muted">Total de ${data.ordersCount} pedido(s) em ${formattedDate}</p>
        </div>
    `;
    
    // Adicionar tabela de pedidos se houver dados
    if (data.orders && data.orders.length > 0) {
        html += `
            <div class="table-responsive">
                <table class="table table-sm table-hover">
                    <thead>
                        <tr>
                            <th>Pedido</th>
                            <th>Cliente</th>
                            <th>Status</th>
                            <th class="text-end">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.orders.map(order => `
                            <tr>
                                <td>#${order.id.substring(0, 8)}</td>
                                <td>${order.clientName}</td>
                                <td>
                                    <span class="badge bg-${getStatusColor(order.status)}">
                                        ${order.status}
                                    </span>
                                </td>
                                <td class="text-end">R$ ${order.total.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        html += `<div class="alert alert-info">Nenhum pedido registrado nesta data.</div>`;
    }
    
    chartContainer.innerHTML = html;
}

function renderMonthlyRevenue(data) {
    const chartContainer = document.getElementById('monthly-revenue-chart');
    if (!data || !data.revenue) {
        chartContainer.innerHTML = `<div class="alert alert-info">Nenhum dado de faturamento para o mês selecionado.</div>`;
        return;
    }
    
    // Formatar o mês para exibição
    const formattedMonth = formatMonthBR(data.month);
    
    // Construir o HTML com os dados de faturamento mensal
    let html = `
        <div class="revenue-summary mb-3">
            <h3 class="text-primary mb-2">R$ ${data.revenue.toFixed(2)}</h3>
            <p class="text-muted">Total de ${data.ordersCount} pedido(s) em ${formattedMonth}</p>
        </div>
    `;
    
    // Adicionar gráfico de faturamento diário se houver dados
    if (data.dailyData && data.dailyData.length > 0) {
        // Preparar dados para o gráfico
        const chartLabels = data.dailyData.map(item => formatDateShort(item.date));
        const chartValues = data.dailyData.map(item => item.revenue);
        
        // Criar elemento canvas para o gráfico
        html += `
            <div class="chart-container" style="position: relative; height:250px;">
                <canvas id="monthlyRevenueChart"></canvas>
            </div>
        `;
        
        // Adicionar script para renderizar o gráfico após inserir o HTML
        setTimeout(() => {
            const ctx = document.getElementById('monthlyRevenueChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartLabels,
                    datasets: [{
                        label: 'Faturamento Diário',
                        data: chartValues,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return 'R$ ' + value;
                                }
                            }
                        }
                    }
                }
            });
        }, 100);
    } else {
        html += `<div class="alert alert-info">Nenhum dado diário disponível para este mês.</div>`;
    }
    
    chartContainer.innerHTML = html;
}

function displayDashboard(data) {
    // If no data is provided, use mock data for display
    const stats = data || {
        totalClients: 0,
        totalOrders: 0,
        totalProducts: 0,
        pendingOrders: 0,
        recentOrders: [],
        lowStockProducts: [],
        monthlySales: [
            { month: 'Jan', value: 0 },
            { month: 'Fev', value: 0 },
            { month: 'Mar', value: 0 },
            { month: 'Abr', value: 0 },
            { month: 'Mai', value: 0 },
            { month: 'Jun', value: 0 }
        ],
        ordersByStatus: {
            'Pendente': 0,
            'Em Produção': 0,
            'Finalizado': 0,
            'Entregue': 0,
            'Cancelado': 0
        },
        dailyRevenue: {
            date: new Date().toISOString().split('T')[0],
            revenue: 0,
            ordersCount: 0,
            orders: []
        },
        monthlyRevenue: {
            month: new Date().toISOString().slice(0, 7),
            revenue: 0,
            ordersCount: 0,
            dailyData: []
        }
    };

    const dashboardHTML = `
        <h1 class="h3 mb-4">Dashboard</h1>
        
        <!-- Summary Cards -->
        <div class="row mb-4">
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card dashboard-card card-blue">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title text-muted mb-1">Total de Pedidos</h6>
                                <h2 class="mb-0">${stats.totalOrders || 0}</h2>
                            </div>
                            <div class="card-icon">
                                <i class="bi bi-cart3"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card dashboard-card card-green">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title text-muted mb-1">Total de Clientes</h6>
                                <h2 class="mb-0">${stats.totalClients || 0}</h2>
                            </div>
                            <div class="card-icon">
                                <i class="bi bi-people"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card dashboard-card card-yellow">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title text-muted mb-1">Total de Produtos</h6>
                                <h2 class="mb-0">${stats.totalProducts || 0}</h2>
                            </div>
                            <div class="card-icon">
                                <i class="bi bi-boxes"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card dashboard-card card-red">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title text-muted mb-1">Pedidos Pendentes</h6>
                                <h2 class="mb-0">${stats.pendingOrders || 0}</h2>
                            </div>
                            <div class="card-icon">
                                <i class="bi bi-hourglass-split"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Revenue Cards -->
        <div class="row mb-4">
            <div class="col-lg-6 mb-4">
                <div class="card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">Faturamento Diário</h5>
                        <div class="input-group date-select" style="width: 200px;">
                            <input type="date" class="form-control" id="dailyRevenueDate" value="${stats.dailyRevenue.date}">
                            <button class="btn btn-outline-secondary" type="button" id="loadDailyRevenueBtn">
                                <i class="bi bi-search"></i>
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="revenue-summary mb-3">
                            <h3 class="text-primary mb-2">R$ ${stats.dailyRevenue.revenue.toFixed(2)}</h3>
                            <p class="text-muted">Total de ${stats.dailyRevenue.ordersCount} pedidos em ${formatDateBR(stats.dailyRevenue.date)}</p>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-sm table-hover">
                                <thead>
                                    <tr>
                                        <th>Pedido</th>
                                        <th>Cliente</th>
                                        <th>Status</th>
                                        <th class="text-end">Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${stats.dailyRevenue.orders && stats.dailyRevenue.orders.length ? 
                                        stats.dailyRevenue.orders.map(order => `
                                            <tr>
                                                <td>#${order.id.substring(0, 8)}</td>
                                                <td>${order.clientName}</td>
                                                <td>
                                                    <span class="status-badge status-${order.status.toLowerCase().replace(' ', '-')}">
                                                        ${order.status}
                                                    </span>
                                                </td>
                                                <td class="text-end">R$ ${order.total.toFixed(2)}</td>
                                            </tr>
                                        `).join('') : 
                                        '<tr><td colspan="4" class="text-center">Nenhum pedido nesta data</td></tr>'
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-6 mb-4">
                <div class="card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">Faturamento Mensal</h5>
                        <div class="input-group month-select" style="width: 200px;">
                            <input type="month" class="form-control" id="monthlyRevenueMonth" value="${stats.monthlyRevenue.month}">
                            <button class="btn btn-outline-secondary" type="button" id="loadMonthlyRevenueBtn">
                                <i class="bi bi-search"></i>
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="revenue-summary mb-3">
                            <h3 class="text-primary mb-2">R$ ${stats.monthlyRevenue.revenue.toFixed(2)}</h3>
                            <p class="text-muted">Total de ${stats.monthlyRevenue.ordersCount} pedidos em ${formatMonthBR(stats.monthlyRevenue.month)}</p>
                        </div>
                        <canvas id="monthlyRevenueChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Charts Row -->
        <div class="row mb-4">
            <div class="col-lg-8 mb-4">
                <div class="card h-100">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Vendas Mensais</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="salesChart"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-4 mb-4">
                <div class="card h-100">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Status dos Pedidos</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="orderStatusChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Recent Orders & Low Stock Products -->
        <div class="row">
            <div class="col-lg-8 mb-4">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">Pedidos Recentes</h5>
                        <a href="#" class="btn btn-sm btn-primary" data-page="orders">Ver Todos</a>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Cliente</th>
                                        <th>Data</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody id="recentOrdersTable">
                                    ${stats.recentOrders && stats.recentOrders.length ? 
                                        stats.recentOrders.map(order => `
                                            <tr data-id="${order.id}">
                                                <td>#${order.id.substring(0, 8)}</td>
                                                <td>${order.clientName}</td>
                                                <td>${formatDate(order.dataPedido)}</td>
                                                <td>
                                                    <span class="status-badge status-${order.status.toLowerCase().replace(' ', '-')}">
                                                        ${order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        `).join('') : 
                                        '<tr><td colspan="4" class="text-center">Nenhum pedido recente</td></tr>'
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-4 mb-4">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">Produtos com Pouco Estoque</h5>
                        <a href="#" class="btn btn-sm btn-primary" data-page="products">Ver Todos</a>
                    </div>
                    <div class="card-body">
                        <ul class="list-group" id="lowStockList">
                            ${stats.lowStockProducts && stats.lowStockProducts.length ? 
                                stats.lowStockProducts.map(product => `
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        <div>${product.nome}</div>
                                        <span class="badge bg-danger rounded-pill">${product.estoque} un.</span>
                                    </li>
                                `).join('') : 
                                '<li class="list-group-item text-center">Nenhum produto com estoque baixo</li>'
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('dashboard-page').innerHTML = dashboardHTML;
    
    // Initialize charts
    if (document.getElementById('salesChart')) {
        initSalesChart(stats.monthlySales || []);
    }
    
    if (document.getElementById('orderStatusChart')) {
        initOrderStatusChart(stats.ordersByStatus || {});
    }
    
    if (document.getElementById('monthlyRevenueChart')) {
        initMonthlyRevenueChart(stats.monthlyRevenue.dailyData || []);
    }
    
    // Event listeners for date/month selectors
    document.getElementById('loadDailyRevenueBtn').addEventListener('click', function() {
        const selectedDate = document.getElementById('dailyRevenueDate').value;
        loadDailyRevenue(selectedDate);
    });
    
    document.getElementById('loadMonthlyRevenueBtn').addEventListener('click', function() {
        const selectedMonth = document.getElementById('monthlyRevenueMonth').value;
        loadMonthlyRevenue(selectedMonth);
    });
}

function initSalesChart(monthlySales) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthlySales.map(item => item.month),
            datasets: [{
                label: 'Vendas (R$)',
                data: monthlySales.map(item => item.value),
                backgroundColor: 'rgba(0, 123, 255, 0.5)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$' + value;
                        }
                    }
                }
            }
        }
    });
}

function initOrderStatusChart(ordersByStatus) {
    const ctx = document.getElementById('orderStatusChart').getContext('2d');
    
    const statusColors = {
        'Pendente': '#ffc107',
        'Em Produção': '#0d6efd',
        'Finalizado': '#198754',
        'Entregue': '#20c997',
        'Cancelado': '#dc3545'
    };
    
    const labels = Object.keys(ordersByStatus);
    const data = Object.values(ordersByStatus);
    const backgroundColor = labels.map(label => statusColors[label] || '#6c757d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function initMonthlyRevenueChart(dailyData) {
    const ctx = document.getElementById('monthlyRevenueChart').getContext('2d');
    
    // Destruir o gráfico anterior se existir
    if (window.monthlyRevenueChart) {
        window.monthlyRevenueChart.destroy();
    }
    
    window.monthlyRevenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dailyData.map(item => formatDateShort(item.date)),
            datasets: [{
                label: 'Faturamento (R$)',
                data: dailyData.map(item => item.revenue),
                backgroundColor: 'rgba(13, 110, 253, 0.5)',
                borderColor: 'rgba(13, 110, 253, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$' + value;
                        }
                    }
                }
            }
        }
    });
}

// Função para formatar data no formato brasileiro (DD/MM/YYYY)
function formatDateBR(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
}

// Função para formatar data curta (DD/MM)
function formatDateShort(dateStr) {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

// Função para formatar mês no formato brasileiro (Mês/Ano)
function formatMonthBR(monthStr) {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const [year, month] = monthStr.split('-');
    return `${months[parseInt(month) - 1]} de ${year}`;
}

// Função para obter a cor do status do pedido
function getStatusColor(status) {
    const statusColors = {
        'Pendente': 'warning',
        'Em Produção': 'info',
        'Finalizado': 'success',
        'Entregue': 'primary',
        'Cancelado': 'danger'
    };
    
    return statusColors[status] || 'secondary';
}

// Função para carregar dados de faturamento diário para uma data específica
function loadDailyRevenue(date) {
    const dailyRevenueCard = document.querySelector('.card:has(#dailyRevenueDate)');
    const cardBody = dailyRevenueCard.querySelector('.card-body');
    
    // Mostrar indicador de carregamento
    cardBody.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Carregando dados...</p></div>';
    
    // URL base do backend
    const backendUrl = 'http://localhost:3001';
    
    // Buscar dados de faturamento diário para a data selecionada
    fetch(`${backendUrl}/dashboard/daily-revenue?date=${date}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Falha ao carregar dados de faturamento diário');
            }
            return response.json();
        })
        .then(data => {
            // Atualizar o conteúdo do card
            cardBody.innerHTML = `
                <div class="revenue-summary mb-3">
                    <h3 class="text-primary mb-2">R$ ${data.revenue.toFixed(2)}</h3>
                    <p class="text-muted">Total de ${data.ordersCount} pedidos em ${formatDateBR(data.date)}</p>
                </div>
                <div class="table-responsive">
                    <table class="table table-sm table-hover">
                        <thead>
                            <tr>
                                <th>Pedido</th>
                                <th>Cliente</th>
                                <th>Status</th>
                                <th class="text-end">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.orders && data.orders.length ? 
                                data.orders.map(order => `
                                    <tr>
                                        <td>#${order.id.substring(0, 8)}</td>
                                        <td>${order.clientName}</td>
                                        <td>
                                            <span class="status-badge status-${order.status.toLowerCase().replace(' ', '-')}">
                                                ${order.status}
                                            </span>
                                        </td>
                                        <td class="text-end">R$ ${order.total.toFixed(2)}</td>
                                    </tr>
                                `).join('') : 
                                '<tr><td colspan="4" class="text-center">Nenhum pedido nesta data</td></tr>'
                            }
                        </tbody>
                    </table>
                </div>
            `;
        })
        .catch(error => {
            cardBody.innerHTML = `
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle"></i> 
                    Não foi possível carregar os dados de faturamento. Tente novamente mais tarde.
                </div>
            `;
            console.error('Error loading daily revenue:', error);
        });
}

// Função para carregar dados de faturamento mensal para um mês específico
function loadMonthlyRevenue(month) {
    const monthlyRevenueCard = document.querySelector('.card:has(#monthlyRevenueMonth)');
    const cardBody = monthlyRevenueCard.querySelector('.card-body');
    const summaryDiv = cardBody.querySelector('.revenue-summary');
    
    // Mostrar indicador de carregamento
    summaryDiv.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Carregando dados...</p></div>';
    
    // URL base do backend
    const backendUrl = 'http://localhost:3001';
    
    // Buscar dados de faturamento mensal para o mês selecionado
    fetch(`${backendUrl}/dashboard/monthly-revenue?month=${month}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Falha ao carregar dados de faturamento mensal');
            }
            return response.json();
        })
        .then(data => {
            // Atualizar o resumo
            summaryDiv.innerHTML = `
                <h3 class="text-primary mb-2">R$ ${data.revenue.toFixed(2)}</h3>
                <p class="text-muted">Total de ${data.ordersCount} pedidos em ${formatMonthBR(data.month)}</p>
            `;
            
            // Atualizar o gráfico
            initMonthlyRevenueChart(data.dailyData || []);
        })
        .catch(error => {
            cardBody.innerHTML = `
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle"></i> 
                    Não foi possível carregar os dados de faturamento. Tente novamente mais tarde.
                </div>
            `;
            console.error('Error loading monthly revenue:', error);
        });
}
