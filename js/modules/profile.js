/* === Profile Module === */
const ProfileModule = {
  render(container) {
    const user = DB.getCurrentUser();
    if (!user) return (container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔒</div><div class="empty-state-text">请先登录</div></div>');

    const pets = DB.getPets();
    const posts = DB.getPosts().filter(p => p.userId === user.id);
    const allPosts = DB.getPosts();

    container.innerHTML = `
      <div style="max-width:600px;margin:0 auto;">
        <div class="card" style="text-align:center;padding:32px;">
          <div style="font-size:64px;margin-bottom:12px;">${user.avatar || '🐾'}</div>
          <h2 style="font-size:22px;font-weight:800;">${user.username}</h2>
          <p style="color:var(--text-muted);font-size:13px;margin:4px 0;">🕐 ${new Date(user.createdAt).toLocaleDateString('zh-CN')} 加入</p>
          ${user.bio ? `<p style="color:var(--text-secondary);margin-top:12px;">${user.bio}</p>` : '<p style="color:var(--text-muted);margin-top:12px;font-size:13px;">暂未设置简介</p>'}
        </div>

        <div class="card" style="margin-top:16px;">
          <h3 style="font-size:16px;font-weight:800;margin-bottom:14px;">📊 个人数据</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
            <div class="pet-info-item"><div class="pet-info-label">毛孩子</div><div class="pet-info-value">${pets.length}</div></div>
            <div class="pet-info-item"><div class="pet-info-label">发帖</div><div class="pet-info-value">${posts.length}</div></div>
            <div class="pet-info-item"><div class="pet-info-label">获赞</div><div class="pet-info-value">${allPosts.filter(p => p.userId === user.id).reduce((s,p) => s + (p.likes||0), 0)}</div></div>
          </div>
        </div>

        <div class="card" style="margin-top:16px;">
          <h3 style="font-size:16px;font-weight:800;margin-bottom:14px;">✏️ 编辑资料</h3>
          <div class="form-group">
            <label class="form-label">头像</label>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
              ${['🐱','🐶','🐰','🐹','🦜','🐢','🐟','🦔','🐾','🐕','🐈','🐩','🦮','🐇','🐿️','🦊'].map(e => `<span style="font-size:28px;cursor:pointer;padding:4px;border-radius:8px;${user.avatar===e?'background:var(--pink-light);border:2px solid var(--pink);':''}" onclick="ProfileModule._setAvatar('${e}')">${e}</span>`).join('')}
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">简介</label>
            <textarea class="form-textarea" id="profileBio" placeholder="介绍一下自己和毛孩子吧...">${user.bio || ''}</textarea>
          </div>
          <button class="btn btn-primary" onclick="ProfileModule._saveProfile()">💾 保存</button>
        </div>

        <div class="card" style="margin-top:16px;text-align:center;">
          <button class="btn btn-danger" onclick="ProfileModule._logout()">🚪 退出登录</button>
        </div>
      </div>`;
  },

  getActionButtons() {
    return '';
  },

  _setAvatar(emoji) {
    const user = DB.getCurrentUser();
    if (user) {
      user.avatar = emoji;
      DB.updateProfile(user.id, { avatar: emoji });
      App.refresh();
      showToast('头像已更新 ✅');
    }
  },

  _saveProfile() {
    const user = DB.getCurrentUser();
    if (!user) return;
    const bio = document.getElementById('profileBio').value.trim();
    DB.updateProfile(user.id, { bio });
    App.refresh();
    showToast('资料已保存 ✅');
  },

  _logout() {
    if (confirm('确定要退出登录吗？')) {
      DB.logout();
      location.reload();
    }
  }
};
