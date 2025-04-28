// ثابت كود المدير
const ADMIN_CODE = 'HM3080VR';

// دوال واجهة المستخدم
function showLoading() {
  document.getElementById('loading-spinner').style.display = 'flex';
}

function hideLoading() {
  document.getElementById('loading-spinner').style.display = 'none';
}

function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast show bg-${type} text-white`;
  toast.style.marginBottom = '10px';
  
  toast.innerHTML = `
    <div class="toast-header bg-${type} text-white">
      <strong class="me-auto">${type === 'success' ? 'نجاح' : 'خطأ'}</strong>
      <button type="button" class="btn-close btn-close-white" onclick="this.parentElement.parentElement.remove()"></button>
    </div>
    <div class="toast-body">
      ${message}
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

// تسجيل الدخول
document.getElementById("login-btn").onclick = async () => {
  const code = document.getElementById("admin-code").value;
  if (code !== ADMIN_CODE) {
    showToast("رمز غير صحيح", "danger");
    return;
  }
  
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("admin-panel").style.display = "block";
  
  refreshData();
};

function logout() {
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("admin-panel").style.display = "none";
  document.getElementById("admin-code").value = "";
}

// تحديث البيانات
async function refreshData() {
  showLoading();
  try {
    const [licenses, users] = await Promise.all([
      fetch("/api/licenses").then(r => r.json()),
      fetch("/api/users").then(r => r.json())  // تصحيح المسار
    ]);
    
    // تحديث الإحصائيات
    const stats = {
      total: licenses.length,
      used: licenses.filter(l => l.used).length,
      available: licenses.filter(l => !l.used).length
    };
    
    document.getElementById("total-keys").textContent = stats.total;
    document.getElementById("used-keys").textContent = stats.used;
    document.getElementById("available-keys").textContent = stats.available;
    
    // تحديث جدول المفاتيح
    document.getElementById("licenses").innerHTML = licenses.map(license => `
      <tr>
        <td>
          <div class="d-flex align-items-center">
            <span class="me-2">${license.key}</span>
            <button class="btn btn-sm btn-outline-primary" onclick="copyToClipboard('${license.key}')">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </td>
        <td>
          <span class="badge ${license.used ? 'bg-danger' : 'bg-success'}">
            ${license.used ? 'مستخدم' : 'متاح'}
          </span>
        </td>
        <td>${license.userId ? users.find(u => u._id === license.userId)?.phone || '-' : '-'}</td>
        <td>${new Date(license.createdAt).toLocaleDateString('ar')}</td>
        <td>
          ${!license.used ? 
            `<button class="btn btn-sm btn-danger" onclick="deleteLicense('${license._id}')">
              <i class="fas fa-trash"></i>
            </button>` : 
            '-'
          }
        </td>
      </tr>
    `).join("");
    
    // تحديث جدول المستخدمين
    document.getElementById("users").innerHTML = users.map(user => `
      <tr>
        <td>${user.phone}</td>
        <td>${new Date(user.createdAt).toLocaleDateString('ar')}</td>
        <td>
          <span class="badge ${user.isBanned ? 'bg-danger' : 'bg-success'}">
            ${user.isBanned ? 'محظور' : 'نشط'}
          </span>
        </td>
        <td>
          <button class="btn btn-${user.isBanned ? 'success' : 'warning'} btn-sm me-2" 
                  onclick="banUser('${user._id}')">
            <i class="fas fa-${user.isBanned ? 'unlock' : 'ban'}"></i>
            ${user.isBanned ? 'إلغاء الحظر' : 'حظر'}
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteUser('${user._id}')">
            <i class="fas fa-trash"></i>
            حذف
          </button>
        </td>
      </tr>
    `).join("");
  } catch (error) {
    showToast("حدث خطأ في تحديث البيانات", "danger");
    console.error(error);
  } finally {
    hideLoading();
  }
}

// نسخ إلى الحافظة
function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  showToast("تم نسخ المفتاح");
}

// إنشاء مفتاح جديد
// Create licenses
document.getElementById('create-license').addEventListener('click', async function() {
  const count = parseInt(document.getElementById('key-count').value);
  
  if (isNaN(count) || count < 1) {
    showToast('يرجى إدخال عدد صحيح من المفاتيح', 'danger');
    return;
  }
  
  showLoading();
  try {
    const response = await fetch('/api/licenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ count })
    });
    
    if (!response.ok) {
      throw new Error('فشل إنشاء المفاتيح');
    }
    
    const licenses = await response.json();
    showToast(`تم إنشاء ${licenses.length} مفتاح بنجاح`);
    refreshData();
  } catch (error) {
    console.error('Create licenses error:', error);
    showToast('حدث خطأ أثناء إنشاء المفاتيح', 'danger');
  } finally {
    hideLoading();
  }
});

// حذف مفتاح
async function deleteLicense(id) {
  if (!confirm("هل أنت متأكد من حذف هذا المفتاح؟")) return;
  
  showLoading();
  try {
    const response = await fetch(`/api/licenses/${id}`, { method: "DELETE" });
    
    if (!response.ok) {
      throw new Error("فشل حذف المفتاح");
    }
    
    showToast("تم حذف المفتاح بنجاح");
    refreshData();
  } catch (error) {
    showToast("حدث خطأ في حذف المفتاح", "danger");
  } finally {
    hideLoading();
  }
}

// حظر/إلغاء حظر مستخدم
async function banUser(id) {
  if (!confirm("هل أنت متأكد من تغيير حالة هذا المستخدم؟")) return;
  
  showLoading();
  try {
    const response = await fetch(`/api/users/${id}/ban`, { 
      method: "PUT"  // تغيير الطريقة من POST إلى PUT
    });
    
    if (!response.ok) {
      throw new Error("فشل تحديث حالة المستخدم");
    }
    
    showToast("تم تحديث حالة المستخدم بنجاح");
    refreshData();
  } catch (error) {
    showToast("حدث خطأ في تحديث حالة المستخدم", "danger");
  } finally {
    hideLoading();
  }
}

// Add the deleteUser function
async function deleteUser(id) {
  if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع بياناته ومهامه نهائياً.")) return;
  
  showLoading();
  try {
    const response = await fetch(`/api/users/${id}`, { method: "DELETE" });  // تصحيح المسار
    
    if (!response.ok) {
      throw new Error("فشل حذف المستخدم");
    }
    
    showToast("تم حذف المستخدم بنجاح");
    refreshData();
  } catch (error) {
    showToast("حدث خطأ في حذف المستخدم", "danger");
    console.error(error);
  } finally {
    hideLoading();
  }
}