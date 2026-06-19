/* === Utility Helpers === */

// Pet species emoji map
const SPECIES_EMOJI = {
  '猫': '🐱', '狗': '🐶', '兔': '🐰', '仓鼠': '🐹', '龙猫': '🐭',
  '鹦鹉': '🦜', '乌龟': '🐢', '鱼': '🐟', '刺猬': '🦔', '其他': '🐾'
};

// Pet species avatar background colors
const SPECIES_COLORS = {
  '猫': '#FCE7F3', '狗': '#EFF6FF', '兔': '#FFF7ED',
  '仓鼠': '#FEF3C7', '龙猫': '#F3E8FF', '鹦鹉': '#ECFDF5',
  '乌龟': '#F0FDF4', '鱼': '#E0F2FE', '刺猬': '#FFF1F2', '其他': '#F5F5F4'
};

function getAvatarStyle(species) {
  return `background: ${SPECIES_COLORS[species] || '#F5F5F4'}`;
}

function getEmoji(species) {
  return SPECIES_EMOJI[species] || '🐾';
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// Modal helpers
function openModal(title, bodyHTML) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHTML;
  document.getElementById('modalOverlay').classList.add('show');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
  document.getElementById('modalBody').innerHTML = '';
}

document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});
