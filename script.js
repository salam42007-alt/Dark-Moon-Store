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
  .catch(err => console.error('خطأ في جلب المنتجات:', err)));

/*========== عرض المنتجات + زر حذف ==========*/
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
            <button onclick="confirmDelete('${p.id}','${p.name}')" class="btn-danger">حذف</button>
          </div>
        </div>
      </div>
    `;
  });
}

/*========== حذف منتج ==========*/
function confirmDelete(id, name) {
  // علبة تأكيد الحذف
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/60 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-gray-800 rounded-xl p-6 w-80 text-center">
      <h3 class="text-red-400 text-xl mb-2">⚠️ تأكيد الحذف</h3>
      <p class="text-gray-300 mb-4">أكتب كلمة المرور لحذف المنتج:<br><strong>${name}</strong></p>
      <input id="delPass" type="password" placeholder="كلمة المرور" class="px-4 py-2 rounded bg-gray-700 text-white w-full mb-4">
      <div class="flex gap-2">
        <button onclick="deleteProduct('${id}')" class="btn-danger w-full">حذف</button>
        <button onclick="this.closest('.fixed').remove()" class="btn-secondary w-full">إلغاء</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function deleteProduct(id) {
  const pass = document.getElementById('delPass').value;
  if (pass !== ADMIN_PASS) {
    alert('❌ كلمة مرور خاطئة!');
    return;
  }
  // حذف من AirTable
  await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${AIRTABLE_KEY}` }
  });

  // علبة نجاح + ريفريش
  const done = document.createElement('div');
  done.className = 'fixed inset-0 bg-black/60 flex items-center justify-center z-50';
  done.innerHTML = `
    <div class="bg-gray-800 rounded-xl p-6 w-72 text-center">
      <h3 class="text-green-400 text-xl mb-2">✅ تم الحذف</h3>
      <p class="text-gray-300 mb-4">سيتم تحديث الصفحة خلال ثوانٍ...</p>
      <div class="w-full bg-gray-700 rounded-full h-1.5">
        <div class="bg-green-500 h-1.5 rounded-full animate-pulse" style="width:100%;animation-duration:2s;"></div>
      </div>
    </div>
  `;
  document.body.appendChild(done);
  setTimeout(() => {
    done.remove();
    location.reload();
  }, 2000);
}

/*========== تواصل معنا + حوّار خياري ==========*/
function openOrder(product) {
  // حوّار داخلي بخيارين
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/60 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-gray-800 rounded-xl p-6 w-80 text-center">
      <h3 class="text-green-400 text-xl mb-4">اختر طريقة التواصل</h3>
      <button onclick="openContact('president','${product}')" class="btn-primary w-full mb-3">التواصل مع الرئيس</button>
      <button onclick="openContact('server','${product}')" class="btn-secondary w-full">التواصل مع السيرفر</button>
      <button onclick="this.closest('.fixed').remove()" class="btn-secondary w-full mt-3">إلغاء</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function openContact(type, product) {
  const msg = `السلام عليكم، أريد شراء: ${product}`;
  const links = {
    president: 'https://discord.com/users/1355566055849852938',
    server: 'https://discord.com/users/1447134114741227575'
  };
  window.open(`${links[type]}?text=${encodeURIComponent(msg)}`, '_blank');
  document.querySelector('.fixed.z-50:last-of-type').remove();
}
