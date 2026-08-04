function filterProducts(type) {
  const products = document.querySelectorAll('.product');
  products.forEach(p => {
    if (type === 'all') {
      p.style.display = 'block';
    } else if (p.classList.contains(type)) {
      p.style.display = 'block';
    } else {
      p.style.display = 'none';
    }
  });
}

const PRODUCTS = [
  { code: 'QT-DR-001', name: '👗 دريس قطوف 1', img: 'img/tshirt1.jpg' },
  { code: 'QT-DR-002', name: '👗 دريس قطوف 2', img: 'img/tshirt2.jpg' },
  { code: 'QT-DR-003', name: '👗 دريس قطوف 3', img: 'img/tshirt3.jpg' },
  { code: 'QT-DR-004', name: '👗 دريس قطوف 4', img: 'img/tshirt4.jpg' },
  { code: 'QT-DR-005', name: '👗 دريس قطوف 5', img: 'img/tshirt5.jpg' },
  { code: 'QT-DR-006', name: '👗 دريس قطوف 6', img: 'img/tshirt6.jpg' },
  { code: 'QT-DR-007', name: '👗 دريس قطوف 7', img: 'img/tshirt4.jpg' },
  { code: 'QT-PN-010', name: '👖 بنطلون قطوف 1', img: 'img/pants1.jpg' },
  { code: 'QT-PN-011', name: '👖 بنطلون قطوف 2', img: 'img/pants2.jpg' },
  { code: 'QT-PN-012', name: '👖 بنطلون قطوف 3', img: 'img/pants3.jpg' },
  { code: 'QT-PN-013', name: '👖 بنطلون قطوف 4', img: 'img/pants4.jpg' },
  { code: 'QT-PN-014', name: '👖 بنطلون قطوف 5', img: 'img/pants5.jpg' },
  { code: 'QT-ST-100', name: '🧥 طقم قطوف 1', img: 'img/set1.jpg' }
];

function getSavedCodes() {
  return JSON.parse(localStorage.getItem('qotoof_saved') || '[]');
}

function renderSavedPage() {
  const container = document.getElementById('savedContent');
  if (!container) return;

  if (!isLoggedIn()) {
    container.innerHTML = `
      <p style="margin-bottom:14px;">سجّل دخولك الأول عشان تقدر تشوف منتجاتك المحفوظة</p>
      <button class="auth-option-btn" style="max-width:220px;margin:0 auto;" onclick="openAuthModal()">تسجيل الدخول</button>
    `;
    return;
  }

  const currentUser = localStorage.getItem('qotoof_current_user') || '';
  const accounts = getAccounts();
  const account = accounts[currentUser];

  let profileHtml = '';
  if (account) {
    const genderLabel = account.gender === 'female' ? 'أنثى' : 'ذكر';
    profileHtml = `
      <div style="text-align:center;margin-bottom:25px;">
        ${account.photo ? `<img src="${account.photo}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;">` : ''}
        <h3 style="margin:10px 0 4px;">مرحبًا ${currentUser}</h3>
        <p style="margin:2px 0;font-weight:normal;">${account.email}</p>
        <p style="margin:2px 0;font-weight:normal;">${genderLabel}</p>
      </div>
    `;
  }

  const savedCodes = getSavedCodes();
  const savedProducts = PRODUCTS.filter(p => savedCodes.includes(p.code));

  if (savedProducts.length === 0) {
    container.innerHTML = profileHtml + `<p>لا يوجد منتجات محفوظة بعد</p>`;
    return;
  }

  const cardsHtml = savedProducts.map(p => `
    <div class="product">
      <img src="${p.img}">
      <h3>${p.name}</h3>
      <p>🆔 الكود: ${p.code}</p>
      <select id="saved-${p.code}"><option>Oversized</option><option>Slim</option></select>
      <button class="save-btn" onclick="removeFromSaved('${p.code}')">❤️</button>
      <button class="order-btn" onclick="order('${p.code}','${p.name}','saved-${p.code}')">اطلب الآن</button>
    </div>
  `).join('');

  container.innerHTML = profileHtml + `<div class="products" style="padding:0;">${cardsHtml}</div>`;
}

function removeFromSaved(code) {
  let saved = getSavedCodes();
  saved = saved.filter(c => c !== code);
  localStorage.setItem('qotoof_saved', JSON.stringify(saved));
  renderSavedPage();
}

function getAccounts() {
  return JSON.parse(localStorage.getItem('qotoof_accounts') || '{}');
}

function saveAccounts(accounts) {
  localStorage.setItem('qotoof_accounts', JSON.stringify(accounts));
}

function handleSignup(event) {
  event.preventDefault();

  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const gender = document.getElementById('signupGender').value;
  const photoInput = document.getElementById('signupPhoto');
  const errorEl = document.getElementById('signupError');

  if (!name || !email || !password) {
    errorEl.textContent = 'برجاء ملء كل الحقول';
    errorEl.style.display = 'block';
    return;
  }

  const accounts = getAccounts();

  if (accounts[name]) {
    errorEl.textContent = 'الاسم ده متسجل قبل كده، جرب اسم تاني أو سجّل دخول';
    errorEl.style.display = 'block';
    return;
  }

  function finishSignup(photoData) {
    accounts[name] = { email, password, gender, photo: photoData || '' };
    saveAccounts(accounts);

    localStorage.setItem('qotoof_logged_in', 'true');
    localStorage.setItem('qotoof_current_user', name);

    location.href = 'index.html';
  }

  const file = photoInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      finishSignup(e.target.result);
    };
    reader.readAsDataURL(file);
  } else {
    finishSignup('');
  }
}

function handleLogin(event) {
  event.preventDefault();

  const name = document.getElementById('loginName').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');

  const accounts = getAccounts();

  if (!accounts[name] || accounts[name].password !== password) {
    errorEl.textContent = 'الاسم أو كلمة السر غلط';
    errorEl.style.display = 'block';
    return;
  }

  localStorage.setItem('qotoof_logged_in', 'true');
  localStorage.setItem('qotoof_current_user', name);

  location.href = 'index.html';
}

function toggleMenu() {
  document.getElementById('topButtons').classList.toggle('active');
}

function updateAuthButton() {
  const btn = document.getElementById('authNavBtn');
  if (!btn) return;

  if (isLoggedIn()) {
    btn.textContent = 'تسجيل خروج';
    btn.onclick = logout;
  } else {
    btn.textContent = 'تسجيل الدخول';
    btn.onclick = openAuthModal;
  }
}

function logout() {
  localStorage.removeItem('qotoof_logged_in');
  localStorage.removeItem('qotoof_current_user');
  location.href = 'index.html';
}

function isLoggedIn() {
  return localStorage.getItem('qotoof_logged_in') === 'true';
}

function syncSavedHearts() {
  const saved = getSavedCodes();
  document.querySelectorAll('.product').forEach(product => {
    const codeText = product.querySelector('p').textContent.replace('🆔 الكود:', '').trim();
    const btn = product.querySelector('.save-btn');
    if (btn) {
      btn.textContent = saved.includes(codeText) ? '❤️' : '🤍';
    }
  });
}

function toggleSave(btn) {
  if (!isLoggedIn()) {
    return;
  }

  const product = btn.closest('.product');
  const code = product.querySelector('p').textContent.replace('🆔 الكود:', '').trim();

  let saved = JSON.parse(localStorage.getItem('qotoof_saved') || '[]');

  if (saved.includes(code)) {
    saved = saved.filter(c => c !== code);
    btn.textContent = '🤍';
  } else {
    saved.push(code);
    btn.textContent = '❤️';
  }

  localStorage.setItem('qotoof_saved', JSON.stringify(saved));
}

function openAuthModal() {
  document.getElementById('authModal').classList.add('active');
}

function closeAuthModal() {
  document.getElementById('authModal').classList.remove('active');
}

function showDetails(btn) {
  const product = btn.closest('.product');
  const img = product.querySelector('img').getAttribute('src');
  const title = product.querySelector('h3').textContent;
  const code = product.querySelector('p').textContent;
  const desc = product.getAttribute('data-details') || 'لا يوجد وصف إضافي لهذا المنتج.';

  document.getElementById('modalImg').setAttribute('src', img);
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalCode').textContent = code;
  document.getElementById('modalDesc').textContent = desc;

  document.getElementById('detailsModal').classList.add('active');
}

function closeDetails() {
  document.getElementById('detailsModal').classList.remove('active');
}

function order(code, type, sizeId) {
  const size = document.getElementById(sizeId).value;

  const msg = `😍 طلب جديد ل قطوف 👗
--------------------
الكود: ${code}
النوع: ${type}
المقاس: ${size}
--------------------
برجاء تأكيد السعر وموعد التسليم`;

  window.open("https://wa.me/201145587547?text=" + encodeURIComponent(msg), "_blank");
}