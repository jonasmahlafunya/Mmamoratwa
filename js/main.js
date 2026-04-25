/* =========================================
   MWAU – Shared JavaScript
   Auth, Navigation, Modals, Tabs, Utils
   ========================================= */

'use strict';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const _DEFAULT_MWAU_DATA = {
  plans: [
    {
      id: 'comfort',
      name: 'Comfort Plan',
      price: 170,
      cover: 15000,
      waitingPeriod: 6,
      maxDependants: { spouse: 1, child: 4, extended: 0 },
      features: [
        'R15,000 funeral cover',
        'Professional embalming',
        'Standard coffin (choice of 3)',
        'Hearse transport (within 50km)',
        'One night viewing',
        'Administrative assistance',
        '6-month waiting period'
      ]
    },
    {
      id: 'prestige',
      name: 'Prestige Plan',
      price: 210,
      cover: 25000,
      waitingPeriod: 3,
      maxDependants: { spouse: 1, child: 6, extended: 2 },
      features: [
        'R25,000 funeral cover',
        'Professional embalming',
        'Premium coffin (choice of 8)',
        'Hearse transport (within 100km)',
        'Two nights viewing',
        'Catering for 50 guests',
        'Floral arrangements',
        '3-month waiting period'
      ]
    },
    {
      id: 'legacy',
      name: 'Legacy Plan',
      price: 240,
      cover: 35000,
      waitingPeriod: 1,
      maxDependants: { spouse: 1, child: 8, extended: 4 },
      features: [
        'R35,000 funeral cover',
        'Professional embalming',
        'Luxury coffin (choice of 15)',
        'Hearse + 2 family vehicles',
        'Three nights viewing',
        'Catering for 100 guests',
        'Premium floral arrangements',
        'Tombstone contribution (R3,000)',
        '1-month waiting period'
      ]
    }
  ],

  users: [
    {
      id: 'USR001',
      email: 'member@mwau.co.za',
      password: 'member123',
      role: 'member',
      firstName: 'Thabo',
      lastName: 'Mokoena',
      idNumber: '8801015000088',
      phone: '082 123 4567',
      dob: '1988-01-01',
      gender: 'Male',
      address: '15 Kloof Street, Mafikeng, 2745',
      plan: 'prestige',
      status: 'active',
      joinDate: '2024-03-15',
      premiumPaid: true,
      dependants: [
        { id: 'DEP001', firstName: 'Naledi', lastName: 'Mokoena', relationship: 'Spouse', idNumber: '9005120000080', dob: '1990-05-12', gender: 'Female', status: 'active' },
        { id: 'DEP002', firstName: 'Lethabo', lastName: 'Mokoena', relationship: 'Child', idNumber: '1205100000082', dob: '2012-05-10', gender: 'Male', status: 'active' },
        { id: 'DEP003', firstName: 'Bontle', lastName: 'Mokoena', relationship: 'Child', idNumber: '1508220000086', dob: '2015-08-22', gender: 'Female', status: 'active' }
      ],
      claims: ['CLM001']
    },
    {
      id: 'USR002',
      email: 'pending@mwau.co.za',
      password: 'pending123',
      role: 'member',
      firstName: 'Kelebogile',
      lastName: 'Sithole',
      idNumber: '9203084000087',
      phone: '076 987 6543',
      dob: '1992-03-08',
      gender: 'Female',
      address: '8 Main Road, Zeerust, 2865',
      plan: 'comfort',
      status: 'pending',
      joinDate: '2025-01-10',
      premiumPaid: false,
      dependants: [],
      claims: []
    }
  ],

  admins: [
    {
      id: 'ADM001',
      email: 'admin@mwau.co.za',
      password: 'admin123',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'MWAU',
      phone: '083 584 4679'
    }
  ],

  claims: [
    {
      id: 'CLM001',
      memberId: 'USR001',
      memberName: 'Thabo Mokoena',
      memberPlan: 'prestige',
      submittedBy: 'member',
      submitterName: 'Thabo Mokoena',
      dateSubmitted: '2025-01-20',
      deceasedName: 'Samuel Mokoena',
      deceasedIdNumber: '5512031000084',
      deceasedDob: '1955-12-03',
      deceasedDod: '2025-01-18',
      deceasedRelationship: 'Father (Extended)',
      causeOfDeath: 'Natural causes',
      funeralHome: 'Mamoratwa Wa Afrika – Mafikeng',
      funeralDate: '2025-01-25',
      bankName: 'FNB',
      accountNumber: '6201234567',
      branchCode: '250655',
      accountType: 'Cheque',
      claimAmount: 25000,
      status: 'under_review',
      documents: [
        { name: 'Death Certificate', uploaded: true },
        { name: 'ID of Deceased', uploaded: true },
        { name: 'Member ID Copy', uploaded: true },
        { name: 'Funeral Invoice', uploaded: false }
      ],
      notes: 'Awaiting funeral invoice from branch.',
      timeline: [
        { stage: 'Submitted', date: '2025-01-20', done: true },
        { stage: 'Documents Verified', date: '2025-01-21', done: true },
        { stage: 'Under Review', date: '2025-01-22', done: true },
        { stage: 'Approved', date: null, done: false },
        { stage: 'Paid Out', date: null, done: false }
      ]
    }
  ],

  settings: {
    planLimits: {
      comfort: { spouse: 1, child: 4, extended: 0 },
      prestige: { spouse: 1, child: 6, extended: 2 },
      legacy: { spouse: 1, child: 8, extended: 4 }
    },
    suspendAfterMonths: 3
  },

  feedback: [],

  // ── PAYMENT LEDGER (last 12 months per member) ──
  payments: (function () {
    const now = new Date();
    const ledger = {};
    ['USR001', 'USR002'].forEach(uid => {
      ledger[uid] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        let status = 'outstanding';
        // USR001: paid for all months except last 2
        if (uid === 'USR001') {
          status = i >= 2 ? 'paid' : (i === 1 ? 'overdue' : 'outstanding');
        }
        // USR002: only paid first 3 months, rest overdue
        if (uid === 'USR002') {
          status = i >= 9 ? 'paid' : 'overdue';
        }
        ledger[uid].push({ month, year, status, paidDate: status === 'paid' ? `${year}-${String(month).padStart(2, '0')}-05` : null });
      }
    });
    return ledger;
  })()
};

let MWAU_DATA = JSON.parse(localStorage.getItem('mwau_app_data'));
if (!MWAU_DATA) {
  MWAU_DATA = _DEFAULT_MWAU_DATA;
  localStorage.setItem('mwau_app_data', JSON.stringify(MWAU_DATA));
}

function saveData() {
  localStorage.setItem('mwau_app_data', JSON.stringify(MWAU_DATA));
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

const Auth = {
  SESSION_KEY: 'mwau_session',

  login(email, password) {
    // Check admins
    const admin = MWAU_DATA.admins.find(a => a.email === email && a.password === password);
    if (admin) {
      const session = { ...admin };
      delete session.password;
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      return { success: true, user: session };
    }
    // Check members
    const member = MWAU_DATA.users.find(u => u.email === email && u.password === password);
    if (member) {
      const session = { ...member };
      delete session.password;
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      return { success: true, user: session };
    }
    return { success: false, error: 'Invalid email or password.' };
  },

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
    window.location.href = '../index.html';
  },

  getSession() {
    try {
      return JSON.parse(localStorage.getItem(this.SESSION_KEY));
    } catch { return null; }
  },

  requireAuth(role) {
    const session = this.getSession();
    if (!session) { window.location.href = '../pages/login.html'; return null; }
    if (role && session.role !== role) {
      if (session.role === 'admin') window.location.href = '../pages/admin-dashboard.html';
      else window.location.href = '../pages/member-dashboard.html';
      return null;
    }
    return session;
  },

  isLoggedIn() { return !!this.getSession(); }
};

// ─── NAVIGATION ───────────────────────────────────────────────────────────────

function initNavbar() {
  // Hamburger toggle
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
  }

  // Active link highlight
  const currentPath = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') && link.getAttribute('href').includes(currentPath)) {
      link.classList.add('active');
    }
  });

  // Update nav auth buttons
  const session = Auth.getSession();
  const navActions = document.querySelector('.nav-actions');
  if (navActions && session) {
    navActions.innerHTML = `
      <a href="${session.role === 'admin' ? 'pages/admin-dashboard.html' : 'pages/member-dashboard.html'}" class="btn btn-outline btn-sm">Dashboard</a>
      <button class="btn btn-gold btn-sm" onclick="Auth.logout()">Logout</button>
    `;
  }
}

// ─── MODALS ───────────────────────────────────────────────────────────────────

function openModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) { overlay.classList.remove('open'); document.body.style.overflow = ''; }
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  document.body.style.overflow = '';
}

// Close on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) closeAllModals();
});

// Close buttons
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) {
    closeAllModals();
  }
});

// ─── TABS ─────────────────────────────────────────────────────────────────────

function initTabs(containerId) {
  const container = containerId ? document.getElementById(containerId) : document;
  if (!container) return;
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      const tabGroup = btn.closest('[data-tab-group]') || btn.closest('.tabs').parentElement;
      tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      tabGroup.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const pane = tabGroup.querySelector(`.tab-pane[data-tab="${target}"]`);
      if (pane) pane.classList.add('active');
    });
  });
}

// ─── TOAST NOTIFICATIONS ─────────────────────────────────────────────────────

function showToast(message, type = 'success', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
    document.body.appendChild(container);
  }
  const colors = { success: '#2D7A4F', error: '#B91C1C', warning: '#92710A', info: '#1D4ED8' };
  const toast = document.createElement('div');
  toast.style.cssText = `background:${colors[type] || colors.info};color:#fff;padding:12px 18px;border-radius:6px;font-family:'Jost',sans-serif;font-size:14px;box-shadow:0 4px 20px rgba(0,0,0,0.2);max-width:320px;animation:slideIn 0.3s ease;`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.style.animation = 'slideOut 0.3s ease forwards'; setTimeout(() => toast.remove(), 300); }, duration);
}

// Add toast animations
const toastStyle = document.createElement('style');
toastStyle.textContent = `@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes slideOut{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}`;
document.head.appendChild(toastStyle);

// ─── SIDEBAR (portal) ─────────────────────────────────────────────────────────

function initSidebar() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));
  }

  // Active link
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.sidebar-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href.includes(currentPage)) link.classList.add('active');
  });
}

// ─── FORM VALIDATION ─────────────────────────────────────────────────────────

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateSAID(id) {
  return /^\d{13}$/.test(id);
}

function validatePhone(phone) {
  return /^[\d\s\+\-\(\)]{10,15}$/.test(phone);
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.style.borderColor = '#B91C1C';
  let err = field.nextElementSibling;
  if (!err || !err.classList.contains('form-error')) {
    err = document.createElement('div');
    err.className = 'form-error';
    field.parentNode.insertBefore(err, field.nextSibling);
  }
  err.textContent = message;
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.style.borderColor = '';
  const err = field.nextElementSibling;
  if (err && err.classList.contains('form-error')) err.remove();
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatCurrency(amount) {
  return 'R ' + Number(amount).toLocaleString('en-ZA', { minimumFractionDigits: 0 });
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getPlanById(id) {
  return MWAU_DATA.plans.find(p => p.id === id) || null;
}

function getUserById(id) {
  return MWAU_DATA.users.find(u => u.id === id) || null;
}

function getClaimById(id) {
  return MWAU_DATA.claims.find(c => c.id === id) || null;
}

function statusBadge(status) {
  const map = {
    active: 'badge-active', pending: 'badge-pending', inactive: 'badge-inactive',
    rejected: 'badge-rejected', under_review: 'badge-review', approved: 'badge-approved',
    paid: 'badge-paid', unpaid: 'badge-unpaid', submitted: 'badge-pending',
    paid_out: 'badge-active', suspended: 'badge-suspended', overdue: 'badge-rejected',
    verified: 'badge-approved', outstanding: 'badge-pending', deceased: 'badge-inactive'
  };
  const labels = {
    active: 'Active', pending: 'Pending', inactive: 'Inactive',
    rejected: 'Rejected', under_review: 'Under Review', approved: 'Approved',
    paid: 'Paid', unpaid: 'Unpaid', submitted: 'Submitted', paid_out: 'Paid Out',
    suspended: 'Suspended', overdue: 'Overdue', verified: 'Verified',
    outstanding: 'Outstanding', deceased: 'Deceased'
  };
  return `<span class="badge ${map[status] || 'badge-inactive'}">${labels[status] || status}</span>`;
}

// ── PAYMENT HELPERS ───────────────────────────────────────────────────────────

function getMonthName(m) {
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1];
}

function countConsecutiveOverdue(userId) {
  const ledger = (MWAU_DATA.payments[userId] || []).slice().reverse();
  let count = 0;
  for (const entry of ledger) {
    if (entry.status === 'overdue') count++;
    else break;
  }
  return count;
}

function checkAndAutoSuspend() {
  const threshold = MWAU_DATA.settings.suspendAfterMonths;
  MWAU_DATA.users.forEach(u => {
    if (u.status === 'active') {
      const overdue = countConsecutiveOverdue(u.id);
      if (overdue >= threshold) {
        u.status = 'suspended';
      }
    }
  });
}

// Run auto-suspend check on load
checkAndAutoSuspend();

// ── AGE HELPERS ───────────────────────────────────────────────────────────────

function calcAge(dob) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}

function getAgeGroup(age) {
  if (age === null) return 'Unknown';
  if (age <= 17) return '0–17';
  if (age <= 35) return '18–35';
  if (age <= 50) return '36–50';
  if (age <= 65) return '51–65';
  return '65+';
}

function initFileUploads() {
  document.querySelectorAll('.file-upload-area').forEach(area => {
    const input = area.querySelector('input[type="file"]');
    if (!input) return;
    input.addEventListener('change', () => {
      const label = area.querySelector('.file-upload-text');
      if (label && input.files.length) {
        label.textContent = input.files[0].name;
        area.style.borderColor = 'var(--status-active)';
      }
    });
  });
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initTabs();
  initSidebar();
  initFileUploads();
});
