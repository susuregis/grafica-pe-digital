// Main application JavaScript for PE Digital Print Shop Management System

document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar
    document.getElementById('sidebarCollapse').addEventListener('click', function() {
        document.getElementById('sidebar').classList.toggle('active');
        document.getElementById('content').classList.toggle('active');
    });

    // Navigation between pages
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            
            // Update active link
            document.querySelectorAll('#sidebar li').forEach(item => {
                item.classList.remove('active');
            });
            this.closest('li').classList.add('active');
            
            // Show the selected page and hide others
            document.querySelectorAll('.page-container').forEach(page => {
                page.classList.add('d-none');
            });
            document.getElementById(`${pageId}-page`).classList.remove('d-none');
            
            // Load page content if needed
            switch(pageId) {
                case 'dashboard':
                    loadDashboard();
                    break;
                case 'orders':
                    loadOrders();
                    break;
                case 'clients':
                    loadClients();
                    break;
                case 'products':
                    loadProducts();
                    break;
            }
        });
    });

    // Initialize the dashboard on page load
    loadDashboard();
});

// Show notification
function showNotification(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.classList.add('alert', `alert-${type}`, 'alert-dismissible', 'fade', 'show', 'custom-alert');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertDiv);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
}

// Format date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Show loading indicator
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    element.innerHTML = '<div class="text-center p-5"><div class="loading-spinner"></div><p class="mt-2">Carregando...</p></div>';
}

// Handle API errors
function handleApiError(error) {
    console.error('API Error:', error);
    
    let errorMessage = 'Ocorreu um erro. Tente novamente mais tarde.';
    if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
    } else if (error.message) {
        errorMessage = error.message;
    }
    
    showNotification(errorMessage, 'danger');
}

// Add loading indicator when navigating
function addGlobalNavLoader() {
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page');
            showLoading(`${pageId}-page`);
        });
    });
}

// Call this to add global navigation loading indicators
addGlobalNavLoader();
