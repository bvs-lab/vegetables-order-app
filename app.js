// Application data
const PRODUCTS = [
    {"id": 1, "name": "Картофель", "price": 60, "unit": "1 кг.", "category": "Овощи"},
    {"id": 2, "name": "Морковь", "price": 60, "unit": "1 кг.", "category": "Овощи"},
    {"id": 3, "name": "Лук репчатый", "price": 60, "unit": "1 кг.", "category": "Овощи"},
    {"id": 4, "name": "Кабачки", "price": 100, "unit": "1 кг.", "category": "Овощи"},
    {"id": 5, "name": "Баклажаны", "price": 80, "unit": "1 кг.", "category": "Овощи"},
    {"id": 6, "name": "Огурцы (пупырчатые твёрдые)", "price": 170, "unit": "1 кг.", "category": "Овощи"},
    {"id": 7, "name": "Помидоры розовые без жилок грубых", "price": 150, "unit": "1 кг.", "category": "Овощи"},
    {"id": 8, "name": "Шампиньоны", "price": 330, "unit": "1 кг.", "category": "Грибы"},
    {"id": 9, "name": "Болгарский перец", "price": 140, "unit": "1 кг.", "category": "Овощи"},
    {"id": 10, "name": "Укроп", "price": 420, "unit": "0,5 кг.", "category": "Зелень"},
    {"id": 11, "name": "Петрушка", "price": 420, "unit": "0,5 кг.", "category": "Зелень"},
    {"id": 12, "name": "Лук зеленый", "price": 470, "unit": "0,5 кг.", "category": "Зелень"},
    {"id": 13, "name": "Кинза", "price": 420, "unit": "0,5 кг.", "category": "Зелень"},
    {"id": 14, "name": "Салат айсберг", "price": 520, "unit": "1 кг.", "category": "Зелень"},
    {"id": 15, "name": "Виноград Киш Миш розовый", "price": 150, "unit": "1 кг.", "category": "Фрукты"},
    {"id": 16, "name": "Виноград Киш Миш черный", "price": 150, "unit": "1 кг.", "category": "Фрукты"},
    {"id": 17, "name": "Виноград Дамские пальчики", "price": 350, "unit": "1 кг.", "category": "Фрукты"},
    {"id": 18, "name": "Инжир зеленый", "price": 350, "unit": "1 кг.", "category": "Фрукты"},
    {"id": 19, "name": "Персик", "price": 170, "unit": "1 кг.", "category": "Фрукты"},
    {"id": 20, "name": "Манго", "price": 330, "unit": "1 кг.", "category": "Фрукты"},
    {"id": 21, "name": "Мандарины", "price": 200, "unit": "1 кг.", "category": "Фрукты"},
    {"id": 22, "name": "Гранат", "price": 170, "unit": "1 кг.", "category": "Фрукты"}
];

const SETTINGS = {
    minOrder: 1200,
    sheetId: "14WPvmY8cIFufe5VKRcvDYP2vCI9bhq9vILUsMbzRZXk",
    gid: "0"
};

// Application state
let cart = {};
let currentCategory = 'all';
let products = [...PRODUCTS]; // Use static data as fallback

// DOM elements
const elements = {
    productsGrid: null,
    categoryButtons: null,
    cartTotal: null,
    minOrderStatus: null,
    proceedToOrderBtn: null,
    successModal: null,
    closeSuccessModal: null,
    successOrderDetails: null
};

// Initialize Telegram WebApp
let tg = null;
if (window.Telegram && window.Telegram.WebApp) {
    tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    bindEvents();
    loadProducts();
    renderProducts();
    updateCartDisplay();
});

function initializeElements() {
    elements.productsGrid = document.getElementById('productsGrid');
    elements.categoryButtons = document.querySelectorAll('.category-btn');
    elements.cartTotal = document.getElementById('cartTotal');
    elements.minOrderStatus = document.getElementById('minOrderStatus');
    elements.proceedToOrderBtn = document.getElementById('proceedToOrderBtn');
    elements.successModal = document.getElementById('successModal');
    elements.closeSuccessModal = document.getElementById('closeSuccessModal');
    elements.successOrderDetails = document.getElementById('successOrderDetails');
}

function bindEvents() {
    // Category navigation
    elements.categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentCategory = btn.dataset.category;
            updateCategoryButtons();
            renderProducts();
        });
    });

    // Proceed to order - send data directly to Salebot
    elements.proceedToOrderBtn.addEventListener('click', handleOrderSubmit);

    // Close success modal
    elements.closeSuccessModal.addEventListener('click', closeSuccessModal);
}

async function loadProducts() {
    try {
        // Try to load from Google Sheets
        const sheetUrl = `https://docs.google.com/spreadsheets/d/${SETTINGS.sheetId}/gviz/tq?tqx=out:json&gid=${SETTINGS.gid}`;
        const response = await fetch(sheetUrl);
        const text = await response.text();
        
        // Parse Google Sheets JSON response
        const jsonData = JSON.parse(text.substr(47).slice(0, -2));
        const rows = jsonData.table.rows;
        
        if (rows && rows.length > 1) {
            // Skip header row, map data to products
            const loadedProducts = rows.slice(1).map((row, index) => {
                const cells = row.c;
                return {
                    id: index + 1,
                    name: cells[0]?.v || '',
                    price: cells[1]?.v || 0,
                    unit: cells[2]?.v || '1 кг.',
                    category: cells[3]?.v || 'Овощи'
                };
            }).filter(product => product.name && product.price > 0);
            
            if (loadedProducts.length > 0) {
                products = loadedProducts;
                renderProducts();
            }
        }
    } catch (error) {
        console.log('Fallback to static data:', error.message);
        // Use static data as fallback (already set)
    }
}

function updateCategoryButtons() {
    elements.categoryButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === currentCategory);
    });
}

function renderProducts() {
    const filteredProducts = currentCategory === 'all' 
        ? products 
        : products.filter(product => product.category === currentCategory);

    elements.productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card fade-in">
            <div class="product-card__header">
                <h3 class="product-card__name">${product.name}</h3>
                <div class="product-card__price">
                    ${product.price} ₽<span class="product-card__unit">/${product.unit}</span>
                </div>
            </div>
            <div class="product-card__actions">
                <div class="quantity-controls">
                    <button class="btn quantity-btn quantity-btn--minus" 
                            onclick="updateQuantity(${product.id}, -1)"
                            ${!cart[product.id] ? 'disabled' : ''}>
                        −
                    </button>
                    <span class="quantity-display">${cart[product.id] || 0}</span>
                    <button class="btn quantity-btn quantity-btn--plus" 
                            onclick="updateQuantity(${product.id}, 1)">
                        +
                    </button>
                </div>
                ${cart[product.id] ? `
                    <div class="product-total">
                        ${calculateProductTotal(product)} ₽
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function updateQuantity(productId, delta) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Handle special logic for greens (0.5kg packages)
    let step = 1;
    if (product.unit === '0,5 кг.') {
        step = 0.5;
    }

    if (!cart[productId]) {
        cart[productId] = 0;
    }

    cart[productId] += delta * step;

    // Remove from cart if quantity is 0 or negative
    if (cart[productId] <= 0) {
        delete cart[productId];
    }

    renderProducts();
    updateCartDisplay();
}

function calculateProductTotal(product) {
    const quantity = cart[product.id] || 0;
    return Math.round(product.price * quantity);
}

function calculateCartTotal() {
    return products.reduce((total, product) => {
        if (cart[product.id]) {
            return total + calculateProductTotal(product);
        }
        return total;
    }, 0);
}

function updateCartDisplay() {
    const total = calculateCartTotal();
    elements.cartTotal.textContent = `${total} ₽`;
    
    const isMinimumMet = total >= SETTINGS.minOrder;
    elements.proceedToOrderBtn.disabled = !isMinimumMet;
    
    if (isMinimumMet) {
        elements.minOrderStatus.textContent = '✓ Минимальная сумма достигнута';
        elements.minOrderStatus.className = 'cart-min-order cart-status--ready';
    } else {
        const remaining = SETTINGS.minOrder - total;
        elements.minOrderStatus.textContent = `Осталось до минимума: ${remaining} ₽`;
        elements.minOrderStatus.className = 'cart-min-order cart-status--insufficient';
    }
}

function handleOrderSubmit() {
    const total = calculateCartTotal();
    
    if (total < SETTINGS.minOrder) {
        return;
    }

    // Prepare cart data for Salebot
    const cartItems = {};
    const itemsList = [];
    
    products.forEach(product => {
        if (cart[product.id]) {
            const quantity = cart[product.id];
            const productTotal = calculateProductTotal(product);
            
            cartItems[product.name] = quantity;
            itemsList.push(`${product.name}: ${quantity} ${product.unit} - ${productTotal} ₽`);
        }
    });

    const orderData = {
        cart: cartItems,
        items: itemsList.join('\n'),
        total: total,
        orderTime: new Date().toISOString()
    };

    // Send data to Salebot via Telegram WebApp
    if (tg && tg.sendData) {
        try {
            tg.sendData(JSON.stringify(orderData));
            
            // Show success modal
            showSuccessModal(orderData);
            
            // Reset cart
            cart = {};
            updateCartDisplay();
            renderProducts();
            
        } catch (error) {
            console.error('Error sending data to Telegram:', error);
            // Still show success modal as fallback
            showSuccessModal(orderData);
        }
    } else {
        // Fallback - show success modal without sending
        console.log('Order data (fallback):', orderData);
        showSuccessModal(orderData);
        
        // Reset cart
        cart = {};
        updateCartDisplay();
        renderProducts();
    }
}

function showSuccessModal(orderData) {
    const orderDetails = `
        <strong>Ваш заказ:</strong><br>
        ${orderData.items.replace(/\n/g, '<br>')}<br><br>
        <strong>Итого: ${orderData.total} ₽</strong><br><br>
        Время заказа: ${new Date(orderData.orderTime).toLocaleString('ru-RU')}
    `;
    
    elements.successOrderDetails.innerHTML = orderDetails;
    elements.successModal.classList.remove('hidden');
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        if (!elements.successModal.classList.contains('hidden')) {
            closeSuccessModal();
        }
    }, 5000);
}

function closeSuccessModal() {
    elements.successModal.classList.add('hidden');
}

// Global functions for onclick handlers
window.updateQuantity = updateQuantity;