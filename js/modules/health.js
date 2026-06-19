/* === Health Module (Vaccine & Deworming) === */
const HealthModule = {
  selectedPetId: null,

  render(container) {
    container.innerHTML = '';
    const pets = DB.getPets();

    if (pets.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">💉</div>
          <div class="empty-state-text">请先添加宠物档案</div>
          <div class="empty-state-hint">在「宠物档案」中添加毛孩子后，再来管理疫苗和驱虫～</div>
        </div>`;
      return;
    }

    // Auto-select first pet if none selected
    if (!this.selectedPetId || !DB.getPet(this.selectedPetId)) {
      this.selectedPetId = pets[0].id;
    }

    const pet = DB.getPet(this.selectedPetId);
    if (!pet) return;

    // Pet selector bar
    const bar = document.createElement('div');
    bar.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;';
    pets.forEach(p => {
      const btn = document.createElement('button');
      btn.className = `btn btn-sm ${p.id === this.selectedPetId ? 'btn-primary' : 'btn-secondary'}`;
      btn.textContent = `${getEmoji(p.species)} ${p.name}`;
      btn.onclick = () => { this.selectedPetId = p.id; this.render(container); };
      bar.appendChild(btn);
    });
    container.appendChild(bar);

    // Main layout: records + commercial side
    const layout = document.createElement('div');
    layout.className = 'health-layout';

    // Left: Records
    const left = document.createElement('div');
    left.className = 'health-records';
    left.appendChild(this._vaxSection(pet));
    left.appendChild(this._dwSection(pet));

    // Right: Commercial
    const right = document.createElement('div');
    right.className = 'health-commerce';
    right.innerHTML = this._hospitalRecs() + this._productRecs();

    layout.appendChild(left);
    layout.appendChild(right);
    container.appendChild(layout);
  },

  getActionButtons() {
    const pet = DB.getPet(this.selectedPetId);
    if (!pet) return '';
    return `
      <button class="btn btn-primary btn-sm" onclick="HealthModule._openVaxForm()">+ 疫苗</button>
      <button class="btn btn-secondary btn-sm" onclick="HealthModule._openDwForm()">+ 驱虫</button>`;
  },

  // --- Vaccine Section ---
  _vaxSection(pet) {
    const vaxes = pet.vaccines || [];
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `<h3 style="margin-bottom:14px;">💉 疫苗记录</h3>`;

    if (!vaxes.length) {
      div.innerHTML += `<div class="empty-state" style="padding:24px;"><div class="empty-state-icon" style="font-size:36px;">💉</div><div class="empty-state-text" style="font-size:14px;">暂无疫苗记录</div></div>`;
    } else {
      vaxes.forEach(v => {
        const expired = v.nextDate && new Date(v.nextDate) < new Date();
        const soon = v.nextDate && !expired && (new Date(v.nextDate) - new Date()) < 30*86400000;
        const row = document.createElement('div');
        row.className = `record-item ${expired ? 'record-expired' : soon ? 'record-soon' : ''}`;
        row.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:start;">
            <div>
              <div style="font-weight:800;font-size:14px;">💉 ${v.name || '疫苗'}</div>
              <div style="font-size:12px;color:var(--text-muted);">📅 ${v.date}${v.nextDate ? ` · 下次：<strong>${v.nextDate}</strong>` : ''}</div>
              ${v.vet ? `<div style="font-size:12px;color:var(--text-muted);">👨‍⚕️ ${v.vet}</div>` : ''}
              ${v.note ? `<div style="font-size:12px;color:var(--text-secondary);margin-top:4px;">📝 ${v.note}</div>` : ''}
            </div>
            <div style="display:flex;gap:4px;">
              <button class="btn btn-sm btn-secondary" onclick="HealthModule._openVaxForm('${v.id}')">✏️</button>
              <button class="btn btn-sm btn-danger" onclick="HealthModule._deleteVax('${v.id}')">🗑️</button>
            </div>
          </div>`;
        div.appendChild(row);
      });
    }
    return div;
  },

  // --- Deworming Section ---
  _dwSection(pet) {
    const dws = pet.dewormings || [];
    const div = document.createElement('div');
    div.className = 'card';
    div.style.marginTop = '16px';
    div.innerHTML = `<h3 style="margin-bottom:14px;">🪱 驱虫记录</h3>`;

    if (!dws.length) {
      div.innerHTML += `<div class="empty-state" style="padding:24px;"><div class="empty-state-icon" style="font-size:36px;">🪱</div><div class="empty-state-text" style="font-size:14px;">暂无驱虫记录</div></div>`;
    } else {
      dws.forEach(d => {
        const expired = d.nextDate && new Date(d.nextDate) < new Date();
        const soon = d.nextDate && !expired && (new Date(d.nextDate) - new Date()) < 30*86400000;
        const row = document.createElement('div');
        row.className = `record-item ${expired ? 'record-expired' : soon ? 'record-soon' : ''}`;
        row.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:start;">
            <div>
              <div style="font-weight:800;font-size:14px;">🪱 ${d.type || '驱虫'} ${d.product ? '· ' + d.product : ''}</div>
              <div style="font-size:12px;color:var(--text-muted);">📅 ${d.date}${d.nextDate ? ` · 下次：<strong>${d.nextDate}</strong>` : ''}</div>
              ${d.note ? `<div style="font-size:12px;color:var(--text-secondary);margin-top:4px;">📝 ${d.note}</div>` : ''}
            </div>
            <div style="display:flex;gap:4px;">
              <button class="btn btn-sm btn-secondary" onclick="HealthModule._openDwForm('${d.id}')">✏️</button>
              <button class="btn btn-sm btn-danger" onclick="HealthModule._deleteDw('${d.id}')">🗑️</button>
            </div>
          </div>`;
        div.appendChild(row);
      });
    }
    return div;
  },

  // --- Commercial: Nearby Hospitals ---
  _hospitalRecs() {
    return `
      <div class="card commerce-card">
        <div class="commerce-header">🏥 附近宠物医院</div>
        <div class="commerce-desc">推荐接种 & 体检机构</div>
        <div class="commerce-products">
          <div class="commerce-item">
            <div class="commerce-item-icon">🏩</div>
            <div class="commerce-item-info">
              <div class="commerce-item-name">瑞鹏宠物医院</div>
              <div class="commerce-item-desc">⭐ 4.8 · 24小时急诊 · 1.2km</div>
            </div>
            <button class="btn btn-sm btn-primary" onclick="HealthModule._commerceTip('瑞鹏宠物医院')">预约</button>
          </div>
          <div class="commerce-item">
            <div class="commerce-item-icon">🏥</div>
            <div class="commerce-item-info">
              <div class="commerce-item-name">芭比堂动物医院</div>
              <div class="commerce-item-desc">⭐ 4.7 · 专科诊疗 · 2.5km</div>
            </div>
            <button class="btn btn-sm btn-primary" onclick="HealthModule._commerceTip('芭比堂动物医院')">预约</button>
          </div>
          <div class="commerce-item">
            <div class="commerce-item-icon">🩺</div>
            <div class="commerce-item-info">
              <div class="commerce-item-name">宠爱国际动物医院</div>
              <div class="commerce-item-desc">⭐ 4.9 · 免疫套餐 · 3.1km</div>
            </div>
            <button class="btn btn-sm btn-primary" onclick="HealthModule._commerceTip('宠爱国际动物医院')">预约</button>
          </div>
        </div>
      </div>`;
  },

  // --- Commercial: Deworming Products ---
  _productRecs() {
    return `
      <div class="card commerce-card" style="margin-top:12px;">
        <div class="commerce-header">💊 驱虫药品推荐</div>
        <div class="commerce-desc">正品保障 · 兽医推荐</div>
        <div class="commerce-products">
          <div class="commerce-item">
            <div class="commerce-item-icon">💧</div>
            <div class="commerce-item-info">
              <div class="commerce-item-name">大宠爱 (Selamectin)</div>
              <div class="commerce-item-price">¥89起</div>
              <div class="commerce-item-desc">体内外同驱 · 猫犬通用</div>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="HealthModule._commerceTip('大宠爱')">购买</button>
          </div>
          <div class="commerce-item">
            <div class="commerce-item-icon">💊</div>
            <div class="commerce-item-info">
              <div class="commerce-item-name">拜耳 (拜宠清)</div>
              <div class="commerce-item-price">¥59起</div>
              <div class="commerce-item-desc">体内驱虫 · 绦虫蛔虫钩虫</div>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="HealthModule._commerceTip('拜耳拜宠清')">购买</button>
          </div>
          <div class="commerce-item">
            <div class="commerce-item-icon">💧</div>
            <div class="commerce-item-info">
              <div class="commerce-item-name">福来恩 (Frontline)</div>
              <div class="commerce-item-price">¥69起</div>
              <div class="commerce-item-desc">体外驱虫 · 跳蚤蜱虫</div>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="HealthModule._commerceTip('福来恩')">购买</button>
          </div>
          <div class="commerce-item">
            <div class="commerce-item-icon">🌿</div>
            <div class="commerce-item-info">
              <div class="commerce-item-name">超可信 (NexGard)</div>
              <div class="commerce-item-price">¥129起</div>
              <div class="commerce-item-desc">体内外同驱 · 牛肉味咀嚼片</div>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="HealthModule._commerceTip('超可信')">购买</button>
          </div>
        </div>
      </div>`;
  },

  _commerceTip(name) {
    showToast(`🐾 「${name}」—— 即将接入商城，敬请期待！`);
  },

  // --- Vaccine Form ---
  _openVaxForm(vaxId) {
    const pet = DB.getPet(this.selectedPetId);
    if (!pet) return;
    let vax = null;
    if (vaxId) vax = (pet.vaccines || []).find(v => v.id === vaxId);

    openModal(vax ? '编辑疫苗记录' : '添加疫苗记录', `
      <input type="hidden" id="vaxPetId" value="${pet.id}">
      ${vax ? `<input type="hidden" id="vaxId" value="${vax.id}">` : ''}
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">💉 疫苗名称 *</label>
          <select class="form-select" id="vaxName">
            <option value="">请选择</option>
            <option ${vax?.name==='狂犬疫苗'?'selected':''}>狂犬疫苗</option>
            <option ${vax?.name==='猫三联'?'selected':''}>猫三联</option>
            <option ${vax?.name==='犬六联'?'selected':''}>犬六联</option>
            <option ${vax?.name==='犬八联'?'selected':''}>犬八联</option>
            <option ${vax?.name==='钩端螺旋体'?'selected':''}>钩端螺旋体</option>
            <option ${vax?.name==='犬窝咳'?'selected':''}>犬窝咳</option>
            <option ${vax?.name==='猫白血病'?'selected':''}>猫白血病</option>
            <option ${vax?.name==='其他疫苗'?'selected':''}>其他疫苗</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">📅 接种日期 *</label>
          <input class="form-input" type="date" id="vaxDate" value="${vax?.date || new Date().toISOString().split('T')[0]}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">📅 下次接种日期</label>
          <input class="form-input" type="date" id="vaxNextDate" value="${vax?.nextDate || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">👨‍⚕️ 接种医院/医生</label>
          <input class="form-input" id="vaxVet" value="${vax?.vet || ''}" placeholder="宠物医院名称">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">📝 备注</label>
        <input class="form-input" id="vaxNote" value="${vax?.note || ''}" placeholder="批号、反应等...">
      </div>
      <div class="form-actions">
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="HealthModule._saveVax()">💾 保存</button>
      </div>`);
  },

  _saveVax() {
    const petId = document.getElementById('vaxPetId').value;
    const vaxId = document.getElementById('vaxId')?.value;
    const name = document.getElementById('vaxName').value;
    const date = document.getElementById('vaxDate').value;
    if (!name) return showToast('请选择疫苗名称 💉');
    if (!date) return showToast('请选择接种日期 📅');

    const data = { name, date, nextDate: document.getElementById('vaxNextDate').value, vet: document.getElementById('vaxVet').value.trim(), note: document.getElementById('vaxNote').value.trim() };
    if (vaxId) { DB.updateVaccine(petId, vaxId, data); }
    else { DB.addVaccine(petId, data); }
    closeModal();
    showToast('疫苗记录已保存 💉');
    App.refresh();
  },

  _deleteVax(vaxId) {
    if (confirm('确定删除这条疫苗记录吗？')) {
      DB.deleteVaccine(this.selectedPetId, vaxId);
      showToast('已删除');
      App.refresh();
    }
  },

  // --- Deworming Form ---
  _openDwForm(dwId) {
    const pet = DB.getPet(this.selectedPetId);
    if (!pet) return;
    let dw = null;
    if (dwId) dw = (pet.dewormings || []).find(d => d.id === dwId);

    openModal(dw ? '编辑驱虫记录' : '添加驱虫记录', `
      <input type="hidden" id="dwPetId" value="${pet.id}">
      ${dw ? `<input type="hidden" id="dwId" value="${dw.id}">` : ''}
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">🪱 驱虫类型 *</label>
          <select class="form-select" id="dwType">
            <option value="">请选择</option>
            <option ${dw?.type==='体内驱虫'?'selected':''}>体内驱虫</option>
            <option ${dw?.type==='体外驱虫'?'selected':''}>体外驱虫</option>
            <option ${dw?.type==='体内外同驱'?'selected':''}>体内外同驱</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">💊 药品名称</label>
          <input class="form-input" id="dwProduct" value="${dw?.product || ''}" placeholder="如：大宠爱、拜耳...">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">📅 驱虫日期 *</label>
          <input class="form-input" type="date" id="dwDate" value="${dw?.date || new Date().toISOString().split('T')[0]}">
        </div>
        <div class="form-group">
          <label class="form-label">📅 下次驱虫日期</label>
          <input class="form-input" type="date" id="dwNextDate" value="${dw?.nextDate || ''}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">📝 备注</label>
        <input class="form-input" id="dwNote" value="${dw?.note || ''}" placeholder="剂量、反应等...">
      </div>
      <div class="form-actions">
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="HealthModule._saveDw()">💾 保存</button>
      </div>`);
  },

  _saveDw() {
    const petId = document.getElementById('dwPetId').value;
    const dwId = document.getElementById('dwId')?.value;
    const type = document.getElementById('dwType').value;
    const date = document.getElementById('dwDate').value;
    if (!type) return showToast('请选择驱虫类型 🪱');
    if (!date) return showToast('请选择驱虫日期 📅');

    const data = { type, product: document.getElementById('dwProduct').value.trim(), date, nextDate: document.getElementById('dwNextDate').value, note: document.getElementById('dwNote').value.trim() };
    if (dwId) { DB.updateDeworming(petId, dwId, data); }
    else { DB.addDeworming(petId, data); }
    closeModal();
    showToast('驱虫记录已保存 🪱');
    App.refresh();
  },

  _deleteDw(dwId) {
    if (confirm('确定删除这条驱虫记录吗？')) {
      DB.deleteDeworming(this.selectedPetId, dwId);
      showToast('已删除');
      App.refresh();
    }
  }
};
