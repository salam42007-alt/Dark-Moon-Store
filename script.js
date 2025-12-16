// مؤقت حتى تنتقل لخدمة تدعم المتغيرات البيئية
const ADMIN_PASS = '5s5s';
const AIRTABLE_KEY = 'patgjnyiWudLsnpdT.f222222067b17764c37a758ac0583070af9b84bb92852bdeca221caf6f224553';
const AIRTABLE_BASE = 'appaZviSwbVOHSAfX';
const AIRTABLE_TABLE = 'Products';

console.log('✅ script.js loaded');

/*========== جلب المنتجات ==========*/
fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}`, {
  headers: { Authorization: `Bearer ${AIRTABLE_KEY}` }
})
  .then(res => res.json())
  .then(data => {
    const list = data.records.map(r => ({
      id: r.id,
      name: r.fields.Name,
      price: r.fields.Price,
      image: r.fields.Image,
      desc: r.fields.Description
    }));
    renderProducts(list);
  })
  .catch(err => console.error('خطأ في جلب المنتجات:', err));

/*========== عرض المنتجات ==========*/
function renderProducts(list) {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';
  list.forEach(p => {
    grid.innerHTML += `
      <div class="card">
        <img src="${p.image}" alt="${p.name}" class="rounded-t-xl">
        <div class="p-6">
          <h3 class="text-2xl font-bold mb-2">${p.name}</h3>
          <p class="text-gray-400 mb-4">${p.desc}</p>
          <div class="flex items-center justify-between">
            <span class="text-3xl font-black text-green-400">${p.price}</span>
            <button onclick="openOrder('${p.name} - ${p.price}')" class="btn-secondary">اطلب الآن</button>
          </div>
        </div>
      </div>
    `;
  });
}

/*========== تواصل معنا ==========*/
function openOrder(product) {
  const msg = `السلام عليكم، أريد شراء: ${product}`;
  const discord = 'https://discord.com/users/YOUR_DISCORD_ID';
  const whatsapp = `https://wa.me/YOUR_PHONE?text=${encodeURIComponent(msg)}`;
  if (confirm("اختر طريقة التواصل:\n(OK = واتساب | Cancel = ديسكورد)")) {
    window.open(whatsapp, '_blank');
  } else {
    window.open(discord, '_blank');
  }
}

/*========== لوحة الإدارة ==========*/
function showPassModal() {
  document.getElementById('passModal').classList.remove('hidden');
}
function closePassModal() {
  document.getElementById('passModal').classList.add('hidden');
}
function checkPass() {
  const pass = document.getElementById('passInput').value;
  if (pass === ADMIN_PASS) {
    closePassModal();
    document.getElementById('adminPanel').classList.remove('hidden');
  } else {
    alert('❌ كلمة مرور خاطئة!');
  }
}
function closeAdmin() {
  document.getElementById('adminPanel').classList.add('hidden');
}
function selectImage() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = ev => {
      document.getElementById('image').value = ev.target.result;
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

/*========== إضافة منتج + علبة حوار داخلية + ريفريش تلقائي ==========*/
document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  // علبة حوار داخلية بدلاً من رسالة المتصفح
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/60 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-gray-800 rounded-xl p-6 w-72 text-center">
      <h3 class="text-green-400 text-xl mb-2">✅ تمت الإضافة</h3>
      <p class="text-gray-300 mb-4">سيتم تحديث الصفحة خلال ثوانٍ...</p>
      <div class="w-full bg-gray-700 rounded-full h-1.5">
        <div class="bg-green-500 h-1.5 rounded-full animate-pulse" style="width:100%;animation-duration:2s;"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // إرسال البيانات إلى AirTable
  const product = {
    fields: {
      Name: document.getElementById('name').value.trim(),
      Price: document.getElementById('price').value.trim(),
      Image: document.getElementById('image').value.trim(),
      Description: document.getElementById('desc').value.trim()
    }
  };

  await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ records: [product] })
  });

  // إغلاق لوحة الإدارة + إظهار العلبة + ريفريش بعد 2 ثانية
  closeAdmin();
  setTimeout(() => {
    modal.remove();
    location.reload();
  }, 2000);
});
