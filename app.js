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

// Настройки Salebot API
const SALEBOT_CONFIG = {
    apiUrl: 'https://chatter.salebot.pro/api',
    token: 'ВАШТОКЕН', // Замените на ваш токен
    messageBlockId: 0
};

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
    
    // Инициализация Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
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
    
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-item';
        productDiv.innerHTML = `
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">${product.price}₽ / ${product.unit}</div>
            </div>
            <div class="product-controls">
                <button class="btn-control" onclick="changeQuantity(${product.id}, -1)">-</button>
                <span class="quantity" id="qty-${product.id}">0</span>
                <button class="btn-control" onclick="changeQuantity(${product.id}, 1)">+</button>
            </div>
        `;
        productList.appendChild(productDiv);
    });
}

// Изменение количества товара
function changeQuantity(productId, delta) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    if (!cart[productId]) {
        cart[productId] = { product: product, quantity: 0 };
    }
    
    cart[productId].quantity += delta;
    
    if (cart[productId].quantity <= 0) {
        cart[productId].quantity = 0;
    }
    
    // Обновляем отображение количества
    const qtyElement = document.getElementById(`qty-${productId}`);
    qtyElement.textContent = cart[productId].quantity;
    
    updateTotal();
}

// Обновление общей суммы
function updateTotal() {
    totalAmount = 0;
    
    for (let productId in cart) {
        const item = cart[productId];
        totalAmount += item.product.price * item.quantity;
    }
    
    totalElement.textContent = totalAmount;
    
    // Управление кнопкой заказа
    if (totalAmount >= 1200) {
        orderBtn.disabled = false;
        orderBtn.textContent = `Оформить заказ (${totalAmount}₽)`;
        // Скрываем сообщение с условиями когда можно заказать
        if (conditionsMessage) {
            conditionsMessage.style.display = 'none';
        }
    } else {
        orderBtn.disabled = true;
        orderBtn.textContent = `Оформить заказ (мин. 1200₽)`;
        // Показываем сообщение с условиями
        if (conditionsMessage) {
            conditionsMessage.style.display = 'block';
        }
    }
}

// Форматирование сообщения заказа
function formatOrderMessage() {
    const orderDate = new Date().toLocaleString('ru-RU');
    let message = `🛒 НОВЫЙ ЗАКАЗ\n\n`;
    message += `📅 Дата: ${orderDate}\n\n`;
    message += `📦 СОСТАВ ЗАКАЗА:\n`;
    
    let itemCount = 0;
    for (let productId in cart) {
        const item = cart[productId];
        if (item.quantity > 0) {
            itemCount++;
            const itemTotal = item.product.price * item.quantity;
            message += `${itemCount}. ${item.product.name}\n`;
            message += `   Количество: ${item.quantity} × ${item.product.unit}\n`;
            message += `   Цена: ${item.product.price}₽ за ${item.product.unit}\n`;
            message += `   Сумма: ${itemTotal}₽\n\n`;
        }
    }
    
    message += `💰 ОБЩАЯ СУММА: ${totalAmount}₽\n\n`;
    
    // Добавляем информацию о пользователе Telegram если доступна
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        if (user) {
            message += `👤 КЛИЕНТ:\n`;
            message += `ID: ${user.id}\n`;
            if (user.username) message += `Username: @${user.username}\n`;
            if (user.first_name) message += `Имя: ${user.first_name}\n`;
            if (user.last_name) message += `Фамилия: ${user.last_name}\n`;
        }
    }
    
    return message;
}

// Показать статус отправки
function showStatus(text, isSuccess = false, isError = false) {
    if (statusMessage && statusText) {
        statusText.textContent = text;
        statusText.className = isSuccess ? 'success' : (isError ? 'error' : '');
        statusMessage.classList.remove('hidden');
        
        // Скрыть спиннер если это финальное состояние
        const spinner = statusMessage.querySelector('.loading-spinner');
        if (spinner && (isSuccess || isError)) {
            spinner.style.display = 'none';
        }
    }
}

// Скрыть статус
function hideStatus() {
    if (statusMessage) {
        statusMessage.classList.add('hidden');
        // Показать спиннер обратно
        const spinner = statusMessage.querySelector('.loading-spinner');
        if (spinner) {
            spinner.style.display = 'block';
        }
    }
}

// Отправка заказа через Salebot API
async function sendToSalebot(orderMessage) {
    const telegramUserId = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe 
        ? window.Telegram.WebApp.initDataUnsafe.user?.id || 0
        : 0;
    
    const orderData = {
        message_id: SALEBOT_CONFIG.messageBlockId,
        client_id: telegramUserId,
        message: orderMessage
    };
    
    const response = await fetch(`${SALEBOT_CONFIG.apiUrl}/${SALEBOT_CONFIG.token}/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

// Fallback через Telegram WebApp
function sendViaTelegramWebApp() {
    const orderItems = [];
    
    for (let productId in cart) {
        const item = cart[productId];
        if (item.quantity > 0) {
            orderItems.push({
                name: item.product.name,
                price: item.product.price,
                unit: item.product.unit,
                quantity: item.quantity,
                total: item.product.price * item.quantity
            });
        }
    }
    
    const orderData = {
        items: orderItems,
        total: totalAmount,
        timestamp: new Date().toISOString(),
        message: formatOrderMessage()
    };
    
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.sendData(JSON.stringify(orderData));
        return true;
    }
    
    return false;
}

// Очистка корзины
function clearCart() {
    cart = {};
    
    // Обновляем отображение количества для всех товаров
    products.forEach(product => {
        const qtyElement = document.getElementById(`qty-${product.id}`);
        if (qtyElement) {
            qtyElement.textContent = '0';
        }
    });
    
    updateTotal();
}

// Основная функция отправки заказа
async function submitOrder() {
    if (totalAmount < 1200) {
        return;
    }
    
    // Показываем индикатор загрузки
    showStatus('Отправляем заказ...');
    
    // Блокируем кнопку заказа
    orderBtn.disabled = true;
    
    try {
        const orderMessage = formatOrderMessage();
        
        // Пробуем отправить через Salebot API
        await sendToSalebot(orderMessage);
        
        // Успешная отправка
        showStatus('✅ Заказ успешно отправлен!', true);
        
        // Очищаем корзину
        clearCart();
        
        // Скрываем статус через 3 секунды
        setTimeout(hideStatus, 3000);
        
    } catch (error) {
        console.error('Ошибка отправки через Salebot:', error);
        
        // Пробуем fallback через Telegram WebApp
        const telegramSent = sendViaTelegramWebApp();
        
        if (telegramSent) {
            showStatus('✅ Заказ отправлен через Telegram!', true);
            clearCart();
            setTimeout(hideStatus, 3000);
        } else {
            // Показываем ошибку
            showStatus('❌ Ошибка отправки заказа', false, true);
            console.log('Заказ (для отладки):', formatOrderMessage());
            
            setTimeout(() => {
                hideStatus();
                orderBtn.disabled = false; // Разблокируем кнопку
            }, 3000);
        }
    }
}