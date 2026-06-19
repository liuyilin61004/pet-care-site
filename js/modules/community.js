/* === Community Module === */
const CommunityModule = {
  render(container) {
    container.innerHTML = '';
    const posts = DB.getPosts();
    const pets = DB.getPets();

    const layout = document.createElement('div');
    layout.className = 'community-layout';

    // Main feed
    const feed = document.createElement('div');
    feed.className = 'community-feed';

    if (posts.length === 0) {
      feed.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">💬</div>
          <div class="empty-state-text">还没有帖子</div>
          <div class="empty-state-hint">成为第一个发言的宠友吧～分享经验、提问求助、晒晒毛孩子！</div>
        </div>`;
    } else {
      posts.forEach(post => feed.appendChild(this._createPostCard(post)));
    }

    layout.appendChild(feed);

    // Side panel
    const side = document.createElement('div');
    side.className = 'side-panel';
    side.innerHTML = `
      <div class="card">
        <h3>📊 社区统计</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div class="pet-info-item">
            <div class="pet-info-label">帖子</div>
            <div class="pet-info-value">${posts.length}</div>
          </div>
          <div class="pet-info-item">
            <div class="pet-info-label">回复</div>
            <div class="pet-info-value">${posts.reduce((s,p) => s + p.replies.length, 0)}</div>
          </div>
        </div>
      </div>
      <div class="card">
        <h3>📋 话题分类</h3>
        <div style="display:flex;flex-direction:column;gap:6px;">
          <span class="tag cat-health" style="display:block;padding:6px 12px;">🏥 疾病求助</span>
          <span class="tag cat-nutrition" style="display:block;padding:6px 12px;">🍖 饮食营养</span>
          <span class="tag cat-behavior" style="display:block;padding:6px 12px;">🐾 行为训练</span>
          <span class="tag cat-general" style="display:block;padding:6px 12px;">💡 经验分享</span>
          <span class="tag cat-emergency" style="display:block;padding:6px 12px;">🚨 紧急求助</span>
        </div>
      </div>
      ${this._commerceHTML()}
    `;
    layout.appendChild(side);
    container.appendChild(layout);
  },

  _createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'card post-card';
    const catClass = post.category === '疾病求助' ? 'cat-health' :
                     post.category === '饮食营养' ? 'cat-nutrition' :
                     post.category === '行为训练' ? 'cat-behavior' :
                     post.category === '紧急求助' ? 'cat-emergency' : 'cat-general';

    card.innerHTML = `
      <div class="post-card-header">
        <div class="post-avatar">${post.authorAvatar || '🐾'}</div>
        <div>
          <div class="post-author">${post.author || '匿名宠友'}</div>
          <div class="post-time">${formatDate(post.createdAt)}</div>
        </div>
        <span class="post-category ${catClass}">${post.category || '综合讨论'}</span>
      </div>
      <div class="post-title">${post.title}</div>
      <div class="post-preview">${post.content}</div>
      ${post.images && post.images.length ? `<div class="post-images">${post.images.map(img => `<img src="${img}" class="post-thumb" onclick="event.stopPropagation();CommunityModule._viewImage('${img}')">`).join('')}</div>` : ''}
      <div class="post-meta">
        <span onclick="CommunityModule.likePost('${post.id}')" style="cursor:pointer;">❤️ ${post.likes || 0}</span>
        <span>💬 ${post.replies.length} 回复</span>
      </div>
      <div style="margin-top:10px;">
        <button class="btn btn-sm btn-secondary" onclick="CommunityModule.viewPost('${post.id}')">查看详情 →</button>
      </div>`;
    return card;
  },

  getActionButtons() {
    return `<button class="btn btn-primary" onclick="CommunityModule.openNewPost()">+ 发帖</button>`;
  },

  openNewPost() {
    const user = DB.getCurrentUser();
    openModal('发布新帖', `
      <div class="form-group">
        <label class="form-label">📋 分类</label>
        <select class="form-select" id="postCategory">
          <option value="综合讨论">💡 综合讨论</option>
          <option value="疾病求助">🏥 疾病求助</option>
          <option value="饮食营养">🍖 饮食营养</option>
          <option value="行为训练">🐾 行为训练</option>
          <option value="紧急求助">🚨 紧急求助</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">📝 标题 *</label>
        <input class="form-input" id="postTitle" placeholder="一句话概括你想说的...">
      </div>
      <div class="form-group">
        <label class="form-label">📄 内容</label>
        <textarea class="form-textarea" id="postContent" placeholder="详细描述你的问题、经验或想法..." style="min-height:120px;"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">📷 图片（可选，最多3张）</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;" id="postImagePreview"></div>
        <input type="file" id="postImageInput" accept="image/*" style="display:none;" onchange="CommunityModule._handleImages()" multiple>
        <button class="btn btn-sm btn-secondary" onclick="document.getElementById('postImageInput').click();return false;">+ 选择图片</button>
        <span style="font-size:11px;color:var(--text-muted);margin-left:8px;" id="imageCount">未选择</span>
      </div>
      <div class="form-actions">
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="CommunityModule.submitPost()">📤 发布</button>
      </div>`);
  },

  _pendingImages: [],

  _handleImages() {
    const input = document.getElementById('postImageInput');
    const files = Array.from(input.files);
    if (files.length > 3) { showToast('最多上传3张图片 📷'); return; }
    const preview = document.getElementById('postImagePreview');
    preview.innerHTML = '';
    this._pendingImages = [];
    let loaded = 0;
    files.forEach((file, i) => {
      if (file.size > 2 * 1024 * 1024) { showToast('图片不能超过2MB'); return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        this._pendingImages.push(e.target.result);
        preview.innerHTML += `<div style="position:relative;display:inline-block;"><img src="${e.target.result}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;"><button onclick="this.parentElement.remove();CommunityModule._pendingImages.splice(${i},1);" style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;border:none;background:#FEE2E2;color:#DC2626;cursor:pointer;font-size:12px;line-height:20px;">✕</button></div>`;
        loaded++;
        document.getElementById('imageCount').textContent = `已选 ${loaded} 张`;
      };
      reader.readAsDataURL(file);
    });
  },

  submitPost() {
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    if (!title) return showToast('请填写标题 📝');
    if (!content) return showToast('请填写内容 📄');

    const user = DB.getCurrentUser();
    DB.addPost({
      title,
      content,
      category: document.getElementById('postCategory').value,
      author: user?.username || '匿名宠友',
      authorAvatar: user?.avatar || '🐾',
      userId: user?.id || null,
      images: [...this._pendingImages]
    });
    this._pendingImages = [];
    closeModal();
    showToast('发帖成功！📤');
    App.refresh();
  },

  viewPost(postId) {
    const posts = DB.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const repliesHTML = post.replies.map(r => `
      <div style="background:var(--bg);border-radius:var(--radius-sm);padding:12px 14px;margin-bottom:8px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <span style="font-weight:800;font-size:13px;">${r.authorAvatar || '🐾'} ${r.author || '匿名'}</span>
          <span style="font-size:11px;color:var(--text-muted);">${formatDate(r.createdAt)}</span>
        </div>
        <div style="font-size:14px;">${r.content}</div>
      </div>
    `).join('') || '<div style="color:var(--text-muted);text-align:center;padding:20px;">还没有回复，来第一个回复吧 💬</div>';

    const imagesHTML = post.images && post.images.length ? `<div class="post-images">${post.images.map(img => `<img src="${img}" class="post-detail-img" onclick="CommunityModule._viewImage('${img.replace(/'/g, "\\'")}')">`).join('')}</div>` : '';

    openModal(post.title, `
      <div style="margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="font-weight:800;">${post.authorAvatar || '🐾'} ${post.author || '匿名'}</span>
          <span style="font-size:12px;color:var(--text-muted);">${formatDate(post.createdAt)}</span>
          <span class="post-category cat-${post.category === '疾病求助' ? 'health' : post.category === '饮食营养' ? 'nutrition' : post.category === '行为训练' ? 'behavior' : post.category === '紧急求助' ? 'emergency' : 'general'}" style="margin-left:auto;">${post.category}</span>
        </div>
        <div style="font-size:15px;line-height:1.8;white-space:pre-wrap;">${post.content}</div>
        ${imagesHTML}
        <div style="margin-top:10px;font-size:13px;color:var(--text-muted);">❤️ ${post.likes || 0} · 💬 ${post.replies.length} 回复</div>
      </div>
      <div style="border-top:1px solid var(--border);padding-top:14px;">
        <h4 style="font-weight:800;margin-bottom:10px;">回复 (${post.replies.length})</h4>
        <div style="margin-bottom:14px;">${repliesHTML}</div>
        <div style="display:flex;gap:8px;">
          <input class="form-input" id="replyContent" placeholder="写下你的回复..." style="flex:1;">
          <button class="btn btn-primary btn-sm" onclick="CommunityModule.submitReply('${post.id}')">回复</button>
        </div>
      </div>`);
  },

  _viewImage(src) {
    openModal('📷 查看图片', `<div style="text-align:center;"><img src="${src}" style="max-width:100%;max-height:60vh;border-radius:8px;"></div>`);
  },

  submitReply(postId) {
    const content = document.getElementById('replyContent').value.trim();
    if (!content) return showToast('请填写回复内容 💬');
    const user = DB.getCurrentUser();
    DB.addReply(postId, {
      content,
      author: user?.username || '匿名宠友',
      authorAvatar: user?.avatar || '🐾'
    });
    closeModal();
    showToast('回复成功！💬');
    App.refresh();
  },

  likePost(postId) {
    const likes = DB.toggleLike(postId);
    showToast(`❤️ ${likes} 个赞`);
    App.refresh();
  },

  // --- Commerce Section ---
  _commerceHTML() {
    return `
      <div class="card commerce-card">
        <div class="commerce-header">🛡️ 宠物医保</div>
        <div class="commerce-desc">给毛孩子一份安心保障</div>
        <div class="commerce-products">
          <div class="commerce-item insurance-item">
            <div class="commerce-item-icon">🏥</div>
            <div class="commerce-item-info">
              <div class="commerce-item-name">基础医疗保障</div>
              <div class="commerce-item-price">¥29/月起</div>
              <div class="commerce-item-desc">常见疾病 · 意外伤害</div>
            </div>
            <button class="btn btn-sm btn-primary" onclick="CommunityModule._commerceTip('基础医疗保障')">了解</button>
          </div>
          <div class="commerce-item insurance-item">
            <div class="commerce-item-icon">🏩</div>
            <div class="commerce-item-info">
              <div class="commerce-item-name">全面守护计划</div>
              <div class="commerce-item-price">¥59/月起</div>
              <div class="commerce-item-desc">手术 · 住院 · 慢性病</div>
            </div>
            <button class="btn btn-sm btn-primary" onclick="CommunityModule._commerceTip('全面守护计划')">了解</button>
          </div>
          <div class="commerce-item insurance-item">
            <div class="commerce-item-icon">🩺</div>
            <div class="commerce-item-info">
              <div class="commerce-item-name">年度体检套餐</div>
              <div class="commerce-item-price">¥199/年起</div>
              <div class="commerce-item-desc">血常规 · 生化 · B超</div>
            </div>
            <button class="btn btn-sm btn-primary" onclick="CommunityModule._commerceTip('年度体检套餐')">了解</button>
          </div>
        </div>
      </div>
      <div class="card commerce-card">
        <div class="commerce-header">💊 宠物保健品</div>
        <div class="commerce-desc">科学养护 · 正品保障</div>
        <div class="commerce-products">
          <div class="commerce-item">
            <div class="commerce-item-icon">🦴</div>
            <div class="commerce-item-info">
              <div class="commerce-item-name">关节护理颗粒</div>
              <div class="commerce-item-price">¥89</div>
              <div class="commerce-item-desc">葡萄糖胺 · 软骨素</div>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="CommunityModule._commerceTip('关节护理颗粒')">查看</button>
          </div>
          <div class="commerce-item">
            <div class="commerce-item-icon">🐟</div>
            <div class="commerce-item-info">
              <div class="commerce-item-name">深海鱼油</div>
              <div class="commerce-item-price">¥69</div>
              <div class="commerce-item-desc">美毛护心 · Omega-3</div>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="CommunityModule._commerceTip('深海鱼油')">查看</button>
          </div>
          <div class="commerce-item">
            <div class="commerce-item-icon">🦷</div>
            <div class="commerce-item-info">
              <div class="commerce-item-name">洁齿骨套装</div>
              <div class="commerce-item-price">¥39</div>
              <div class="commerce-item-desc">清新口气 · 磨牙洁齿</div>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="CommunityModule._commerceTip('洁齿骨套装')">查看</button>
          </div>
          <div class="commerce-item">
            <div class="commerce-item-icon">🌿</div>
            <div class="commerce-item-info">
              <div class="commerce-item-name">益生菌粉</div>
              <div class="commerce-item-price">¥59</div>
              <div class="commerce-item-desc">调理肠胃 · 增强免疫</div>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="CommunityModule._commerceTip('益生菌粉')">查看</button>
          </div>
        </div>
      </div>
    `;
  },

  _commerceTip(product) {
    showToast(`🐾 「${product}」—— 即将接入商城，敬请期待！`);
  }
};
