// Telegram Web App initialization
let tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

// Статические данные товаров
const products = [
    {"id": 1, "name": "Картофель", "price": 60, "unit": "1 кг"},
    {"id": 2, "name": "Морковь", "price": 60, "unit": "1 кг"},
    {"id": 3, "name": "Лук репчатый", "price": 60, "unit": "1 кг"},
    {"id": 4, "name": "Кабачки", "price": 100, "unit": "1 кг"},
    {"id": 5, "name": "Баклажаны", "price": 80, "unit": "1 кг"},
    {"id": 6, "name": "Огурцы (пупырчатые)", "price": 170, "unit": "1 кг"},
    {"id": 7, "name": "Помидоры (без жилок)", "price": 150, "unit": "1 кг"},
    {"id": 8, "name": "Шампиньоны", "price": 330, "unit": "1 кг"},
    {"id": 9, "name": "Болгарский перец", "price": 140, "unit": "1 кг"},
    {"id": 10, "name": "Укроп", "price": 420, "unit": "0,5 кг"},
    {"id": 11, "name": "Петрушка", "price": 420, "unit": "0,5 кг"},
    {"id": 12, "name": "Лук зеленый", "price": 470, "unit": "0,5 кг"},
    {"id": 13, "name": "Кинза", "price": 420, "unit": "0,5 кг"},
    {"id": 14, "name": "Салат айсберг", "price": 520, "unit": "1 кг"},
    {"id": 15, "name": "Виноград розовый", "price": 150, "unit": "1 кг"},
    {"id": 16, "name": "Виноград черный", "price": 150, "unit": "1 кг"},
    {"id": 17, "name": "Виноград элитный", "price": 350, "unit": "1 кг"},
    {"id": 18, "name": "Инжир зеленый", "price": 350, "unit": "1 кг"},
    {"id": 19, "name": "Персик", "price": 170, "unit": "1 кг"},
    {"id": 20, "name": "Манго", "price": 330, "unit": "1 кг"},
    {"id": 21, "name": "Мандарины", "price": 200, "unit": "1 кг"},
    {"id": 22, "name": "Гранат", "price": 170, "unit": "1 кг"}
];

// Корзина
let cart = {};
let totalAmount = 0;

// Элементы DOM
let totalElement;
let orderBtn;
let conditionsMessage;
let statusMessage;
let statusText;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    totalElement = document.getElementById('total');
    orderBtn = document.getElementById('order-btn');
    conditionsMessage = document.getElementById('conditions-message');
    statusMessage = document.getElementById('status-message');
    statusText = document.getElementById('status-text');

    // Показываем сообщение с условиями
    if (conditionsMessage) {
        conditionsMessage.style.display = 'block';
    }

    renderProducts();
    updateTotal();

    // Обработчик кнопки заказа
    orderBtn.addEventListener('click', function() {
        if (totalAmount >= 1200) {
            submitOrder();
        }
    });
});

// Отрисовка товаров
function renderProducts() {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-item';
        productDiv.innerHTML = `
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">${product.price} ₽ / ${product.unit}</div>
            </div>
            <div class="product-controls">
                <button class="btn-control" onclick="changeQuantity(${product.id}, -1)" ${(cart[product.id] || 0) === 0 ? 'disabled' : ''}>−</button>
                <span class="quantity" id="qty-${product.id}">${cart[product.id] || 0}</span>
                <button class="btn-control" onclick="changeQuantity(${product.id}, 1)">+</button>
            </div>
        `;
        productList.appendChild(productDiv);
    });
}

// Изменение количества товара
function changeQuantity(productId, delta) {
    const currentQty = cart[productId] || 0;
    const newQty = Math.max(0, currentQty + delta);
    
    if (newQty === 0) {
        delete cart[productId];
    } else {
        cart[productId] = newQty;
    }
    
    // Обновляем отображение количества
    document.getElementById(`qty-${productId}`).textContent = newQty;
    
    // Обновляем кнопку минус
    const minusBtn = document.querySelector(`[onclick="changeQuantity(${productId}, -1)"]`);
    minusBtn.disabled = newQty === 0;
    
    updateTotal();
}

// Обновление общей суммы
function updateTotal() {
    totalAmount = 0;
    
    for (const [productId, quantity] of Object.entries(cart)) {
        const product = products.find(p => p.id === parseInt(productId));
        if (product) {
            totalAmount += product.price * quantity;
        }
    }
    
    totalElement.textContent = totalAmount;
    
    // Обновляем кнопку заказа
    if (totalAmount >= 1200) {
        orderBtn.disabled = false;
        orderBtn.textContent = `Оформить заказ (${totalAmount} ₽)`;
        orderBtn.style.background = '#2563eb';
    } else {
        orderBtn.disabled = true;
        orderBtn.textContent = `Минимум 1200 ₽ (не хватает ${1200 - totalAmount} ₽)`;
        orderBtn.style.background = '#9ca3af';
    }
}

// Отправка заказа
function submitOrder() {
    if (totalAmount < 1200) return;
    
    // Показываем индикатор загрузки
    showStatusMessage('Отправляем заказ...');
    
    // Формируем список товаров для отправки
    const items = Object.entries(cart)
        .map(([productId, quantity]) => {
            const product = products.find(p => p.id === parseInt(productId));
            return `${product.name} – ${quantity} ${product.unit} (${product.price * quantity} ₽)`;
        })
        .join('\n');
    
    // Получаем данные пользователя из Telegram
    const tgUser = tg?.initDataUnsafe?.user || {};
    
    // Формируем объект заказа
    const orderData = {
        cart: cart,
        items: items,
        total: totalAmount,
        orderTime: Date.now(),
        telegram_user_id: tgUser.id,
        telegram_username: tgUser.username,
        telegram_first_name: tgUser.first_name
    };
    
    try {
        // Отправляем данные в Salebot через Telegram Web App
        if (tg && tg.sendData) {
            tg.sendData(JSON.stringify(orderData));
            
            // Показываем успешное сообщение
            showStatusMessage('✅ Заказ отправлен!\nОжидайте подтверждения в чате');
            
            // Очищаем корзину через 2 секунды
            setTimeout(() => {
                cart = {};
                totalAmount = 0;
                renderProducts();
                updateTotal();
                hideStatusMessage();
            }, 2000);
            
        } else {
            throw new Error('Telegram Web App недоступен');
        }
        
    } catch (error) {
        console.error('Ошибка отправки заказа:', error);
        showStatusMessage('❌ Ошибка отправки заказа\nПопробуйте еще раз');
        
        setTimeout(() => {
            hideStatusMessage();
        }, 3000);
    }
}

// Показать сообщение о статусе
function showStatusMessage(text) {
    if (statusMessage && statusText) {
        statusText.textContent = text;
        statusMessage.classList.remove('hidden');
    }
}

// Скрыть сообщение о статусе  
function hideStatusMessage() {
    if (statusMessage) {
        statusMessage.classList.add('hidden');
    }
}

// Глобальная функция для кнопок
window.changeQuantity = changeQuantity;