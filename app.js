// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const API_TOKEN = '1e268f0d97ad4edf6da4e032cd041103';
const TABLE_ID = '1';
let products = [];
let cart = {};

const totalEl = () => document.getElementById('total');
const orderBtn = () => document.getElementById('order-btn');
const productList = () => document.getElementById('product-list');
const statusMsg = () => document.getElementById('status-message');
const statusText = () => document.getElementById('status-text');

// Загрузка товаров из Salebot таблицы
async function fetchProducts() {
  showStatus('Загрузка товаров...');
  try {
    const res = await fetch(`https://chatter.salebot.pro/api/${API_TOKEN}/table/${TABLE_ID}/rows`);
    const data = await res.json();
    products = data.rows.map(r => ({
      id: r.ID,
      name: r.Наименование,
      price: parseInt(r.Цена, 10),
      unit: r.Единицы
    }));
    hideStatus();
    renderProducts();
    updateTotal();
  } catch (e) {
    showStatus('Ошибка загрузки товаров');
  }
}

function renderProducts() {
  productList().innerHTML = products.map(p => `
    <div class="product-item">
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-price">${p.price}₽/${p.unit}</div>
      </div>
      <div class="product-controls">
        <button class="btn-control" onclick="changeQty(${p.id}, -1)" ${!cart[p.id]?'disabled':''}>−</button>
        <span class="quantity" id="qty-${p.id}">${cart[p.id]||0}</span>
        <button class="btn-control" onclick="changeQty(${p.id}, 1)">+</button>
      </div>
    </div>
  `).join('');
}

function changeQty(id, delta) {
  cart[id] = Math.max(0, (cart[id]||0) + delta);
  if (!cart[id]) delete cart[id];
  document.getElementById(`qty-${id}`).textContent = cart[id]||0;
  updateTotal();
}

function updateTotal() {
  const total = Object.entries(cart).reduce((sum, [id, q]) => {
    const p = products.find(x => x.id == id);
    return sum + (p.price*q);
  }, 0);
  totalEl().textContent = total;
  if (total >= 1200) {
    orderBtn().disabled = false;
    orderBtn().textContent = `Оформить заказ (${total}₽)`;
  } else {
    orderBtn().disabled = true;
    orderBtn().textContent = 'Мин.1200₽';
  }
}

// Отправка заказа в Salebot
function submitOrder() {
  const total = +totalEl().textContent;
  if (total < 1200) return;
  const items = Object.entries(cart).map(([id,q]) => {
    const p = products.find(x => x.id == id);
    return `${p.name} – ${q} ${p.unit} (${p.price*q}₽)`;
  }).join('\n');
  const user = tg.initDataUnsafe.user || {};
  const orderData = { cart, items, total, orderTime: Date.now(), telegram_user_id: user.id, telegram_username: user.username };
  tg.sendData(JSON.stringify(orderData));
  showStatus('✅ Заказ отправлен!\nОжидайте подтверждения');
  setTimeout(() => { cart={}; renderProducts(); updateTotal(); hideStatus(); }, 2000);
}

function showStatus(txt) { statusText().textContent = txt; statusMsg().classList.remove('hidden'); }
function hideStatus() { statusMsg().classList.add('hidden'); }

window.changeQty = changeQty;
orderBtn().addEventListener('click', submitOrder);
fetchProducts();