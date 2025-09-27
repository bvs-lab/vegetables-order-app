const tg = window.Telegram.WebApp; if(tg){tg.ready();tg.expand();}

const products=[
  {id:1,name:"Картофель",price:60,unit:"1 кг"},
  {id:2,name:"Морковь",price:60,unit:"1 кг"},
  {id:3,name:"Лук репчатый",price:60,unit:"1 кг"},
  {id:4,name:"Кабачки",price:100,unit:"1 кг"},
  {id:5,name:"Баклажаны",price:80,unit:"1 кг"},
  {id:6,name:"Огурцы",price:170,unit:"1 кг"},
  {id:7,name:"Помидоры",price:150,unit:"1 кг"},
  {id:8,name:"Шампиньоны",price:330,unit:"1 кг"},
  {id:9,name:"Перец",price:140,unit:"1 кг"},
  {id:10,name:"Укроп",price:420,unit:"0,5 кг"},
  {id:11,name:"Петрушка",price:420,unit:"0,5 кг"},
  {id:12,name:"Лук зелёный",price:470,unit:"0,5 кг"},
  {id:13,name:"Кинза",price:420,unit:"0,5 кг"},
  {id:14,name:"Салат айсберг",price:520,unit:"1 кг"},
  {id:15,name:"Виноград",price:150,unit:"1 кг"},
  {id:16,name:"Персик",price:170,unit:"1 кг"},
  {id:17,name:"Манго",price:330,unit:"1 кг"},
  {id:18,name:"Мандарины",price:200,unit:"1 кг"},
  {id:19,name:"Гранат",price:170,unit:"1 кг"}
];

let cart={};

const totalEl=()=>document.getElementById("total");
const orderBtn=()=>document.getElementById("order-btn");
const productList=()=>document.getElementById("product-list");
const statusMsg=()=>document.getElementById("status-message");
const statusText=()=>document.getElementById("status-text");

function render(){
  productList().innerHTML=products.map(p=>
    `<div class="product-item">
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-price">${p.price}₽/${p.unit}</div>
      </div>
      <div class="product-controls">
        <button class="btn-control" onclick="chg(${p.id},-1)"${!cart[p.id]?" disabled":""}>−</button>
        <span class="quantity" id="q${p.id}">${cart[p.id]||0}</span>
        <button class="btn-control" onclick="chg(${p.id},1)">+</button>
      </div>
    </div>`
  ).join('');
}

function chg(id,d){cart[id]=Math.max(0,(cart[id]||0)+d);if(!cart[id])delete cart[id];document.getElementById(`q${id}`).textContent=cart[id]||0;update();}

function update(){
  const t=Object.entries(cart).reduce((s,[i,q])=>s+products.find(x=>x.id==i).price*q,0);
  totalEl().textContent=t;
  if(t>=1200){orderBtn().disabled=false;orderBtn().textContent=`Оформить заказ (${t}₽)`;}else{orderBtn().disabled=true;orderBtn().textContent='Мин.1200₽';}
}

function submit(){
  const t=+totalEl().textContent;
  if(t<1200)return;
  const items=Object.entries(cart).map(([i,q])=>`${products.find(x=>x.id==i).name} – ${q} ${products.find(x=>x.id==i).unit} (${products.find(x=>x.id==i).price*q}₽)`).join("\n");
  const u=tg.initDataUnsafe.user||{};
  const d={cart,items,total:t,orderTime:Date.now(),telegram_user_id:u.id,telegram_username:u.username};
  tg.sendData(JSON.stringify(d));
  show("✅ Заказ отправлен!\nОжидайте подтверждения");
  setTimeout(()=>{cart={};render();update();hide();},2000);
}

function show(t){statusText().textContent=t;statusMsg().classList.remove('hidden');}
function hide(){statusMsg().classList.add('hidden');}

window.chg=chg;
document.addEventListener('DOMContentLoaded',()=>{render();update();orderBtn().addEventListener('click',submit);});