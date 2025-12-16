// ===== الكود المضاف والمُحدث =====

/*========== حذف منتج + علبة حوار داخلية ==========*/
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
    // رسالة داخلية بدلاً من alert
    const msg = document.createElement('div');
    msg.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg z-60';
    msg.textContent = '❌ كلمة مرور خاطئة!';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
    return;
  }

  // حذف من AirTable
  await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${AIRTABLE_KEY}` }
  });

  // علبة نجاح داخلية + ريفريش
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

/*========== تواصل معنا + حوّار خياري (بدون alert) ==========*/
function openOrder(product) {
  // حوّار داخلي بخيارين (بدلاً من confirm)
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

/*========== إضافة منتج + علبة حوار داخلية + ريفريش تلقائي (بدون alert) ==========*/
document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  // علبة حوار داخلية بدلاً من alert
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
