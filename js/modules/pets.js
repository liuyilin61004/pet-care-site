/* === Pets Module === */
const PetsModule = {
  render(container) {
    container.innerHTML = '';
    const pets = DB.getPets();

    if (pets.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🐣</div>
          <div class="empty-state-text">还没有添加小可爱</div>
          <div class="empty-state-hint">点击右上角按钮，为你的毛孩子创建第一份档案吧～</div>
        </div>`;
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'card-grid';
    pets.forEach(pet => grid.appendChild(this._createCard(pet)));
    container.appendChild(grid);
  },

  _getVaxStatus(pet) {
    const vaxes = pet.vaccines || [];
    if (!vaxes.length) return { text: '💉 未记录', cls: 'status-warn' };
    const latest = vaxes[0];
    if (!latest.nextDate) return { text: '💉 已接种', cls: 'status-ok' };
    const next = new Date(latest.nextDate);
    const now = new Date();
    const daysLeft = Math.ceil((next - now) / 86400000);
    if (daysLeft < 0) return { text: '💉 已过期', cls: 'status-danger' };
    if (daysLeft <= 30) return { text: `💉 ${daysLeft}天后到期`, cls: 'status-warn' };
    return { text: '💉 已接种', cls: 'status-ok' };
  },

  _getDewormStatus(pet) {
    const dws = pet.dewormings || [];
    if (!dws.length) return { text: '🪱 未记录', cls: 'status-warn' };
    const latest = dws[0];
    if (!latest.nextDate) return { text: '🪱 已驱虫', cls: 'status-ok' };
    const next = new Date(latest.nextDate);
    const now = new Date();
    const daysLeft = Math.ceil((next - now) / 86400000);
    if (daysLeft < 0) return { text: '🪱 已过期', cls: 'status-danger' };
    if (daysLeft <= 30) return { text: `🪱 ${daysLeft}天后到期`, cls: 'status-warn' };
    return { text: '🪱 已驱虫', cls: 'status-ok' };
  },

  _createCard(pet) {
    const card = document.createElement('div');
    card.className = 'card pet-card';
    const age = pet.birthday ? this._calcAge(pet.birthday) : pet.age || '?';
    const ageUnit = pet.birthday ? '岁' : (pet.age ? '岁' : '');
    card.innerHTML = `
      <div class="pet-card-header">
        <div class="pet-card-avatar" style="${getAvatarStyle(pet.species)}">${getEmoji(pet.species)}</div>
        <div>
          <div class="pet-card-name">${pet.name}</div>
          <div class="pet-card-breed">${pet.species} · ${pet.breed || '未知品种'}</div>
        </div>
      </div>
      <div class="pet-card-info">
        <div class="pet-info-item">
          <div class="pet-info-label">年龄</div>
          <div class="pet-info-value">${age}${ageUnit}</div>
        </div>
        <div class="pet-info-item">
          <div class="pet-info-label">体重</div>
          <div class="pet-info-value">${pet.weight ? pet.weight + 'kg' : '未知'}</div>
        </div>
        <div class="pet-info-item">
          <div class="pet-info-label">性别</div>
          <div class="pet-info-value">${pet.gender || '未知'}</div>
        </div>
        <div class="pet-info-item">
          <div class="pet-info-label">绝育</div>
          <div class="pet-info-value">${pet.neutered ? '✅' : '❌'}</div>
        </div>
      </div>
      <div class="pet-card-actions">
        <button class="btn btn-sm btn-secondary" onclick="PetsModule.showDetail('${pet.id}')">📋 详情</button>
        <button class="btn btn-sm btn-secondary" onclick="PetsModule.showRecords('${pet.id}')">📋 病例</button>
        <button class="btn btn-sm btn-secondary" onclick="PetsModule.edit('${pet.id}')">✏️ 编辑</button>
        <button class="btn btn-sm btn-danger" onclick="PetsModule.remove('${pet.id}')">🗑️</button>
      </div>`;
    return card;
  },

  _calcAge(birthday) {
    const diff = Date.now() - new Date(birthday).getTime();
    const years = diff / (365.25 * 24 * 3600 * 1000);
    return years < 1 ? (Math.floor(years * 12) + '个月') : years.toFixed(1);
  },

  getActionButtons() {
    return `<button class="btn btn-primary" onclick="PetsModule.openAdd()">+ 添加宠物</button>`;
  },

  openAdd() {
    openModal('添加新宠物', `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">🐾 名字 *</label>
          <input class="form-input" id="petName" placeholder="毛孩子的名字">
        </div>
        <div class="form-group">
          <label class="form-label">种类 *</label>
          <select class="form-select" id="petSpecies">
            <option value="">请选择</option>
            <option>猫</option><option>狗</option><option>兔</option>
            <option>仓鼠</option><option>龙猫</option><option>鹦鹉</option>
            <option>乌龟</option><option>鱼</option><option>刺猬</option><option>其他</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">品种</label>
          <input class="form-input" id="petBreed" placeholder="如：英短、金毛">
        </div>
        <div class="form-group">
          <label class="form-label">生日</label>
          <input class="form-input" type="date" id="petBirthday">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">体重 (kg)</label>
          <input class="form-input" type="number" id="petWeight" placeholder="0.0" step="0.1">
        </div>
        <div class="form-group">
          <label class="form-label">性别</label>
          <select class="form-select" id="petGender">
            <option value="">未知</option>
            <option>公</option><option>母</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px;font-weight:600;">
          <input type="checkbox" id="petNeutered"> 已绝育
        </label>
      </div>
      <div class="form-group">
        <label class="form-label">备注</label>
        <textarea class="form-textarea" id="petNote" placeholder="性格、特殊需求、过敏史等..."></textarea>
      </div>
      <div class="form-actions">
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="PetsModule.save()">💾 保存</button>
      </div>`);
  },

  edit(id) {
    const pet = DB.getPet(id);
    if (!pet) return;
    openModal('编辑宠物信息', `
      <input type="hidden" id="editPetId" value="${pet.id}">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">🐾 名字</label>
          <input class="form-input" id="petName" value="${pet.name}">
        </div>
        <div class="form-group">
          <label class="form-label">种类</label>
          <select class="form-select" id="petSpecies">
            ${['猫','狗','兔','仓鼠','龙猫','鹦鹉','乌龟','鱼','刺猬','其他'].map(s => `<option ${pet.species===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">品种</label>
          <input class="form-input" id="petBreed" value="${pet.breed || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">生日</label>
          <input class="form-input" type="date" id="petBirthday" value="${pet.birthday || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">体重 (kg)</label>
          <input class="form-input" type="number" id="petWeight" value="${pet.weight || ''}" step="0.1">
        </div>
        <div class="form-group">
          <label class="form-label">性别</label>
          <select class="form-select" id="petGender">
            <option value="">未知</option>
            <option ${pet.gender==='公'?'selected':''}>公</option>
            <option ${pet.gender==='母'?'selected':''}>母</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px;font-weight:600;">
          <input type="checkbox" id="petNeutered" ${pet.neutered?'checked':''}> 已绝育
        </label>
      </div>
      <div class="form-group">
        <label class="form-label">备注</label>
        <textarea class="form-textarea" id="petNote">${pet.note || ''}</textarea>
      </div>
      <div class="form-actions">
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="PetsModule.update()">💾 保存</button>
      </div>`);
  },

  save() {
    const name = document.getElementById('petName').value.trim();
    const species = document.getElementById('petSpecies').value;
    if (!name) return showToast('请输入宠物名字 🐾');
    if (!species) return showToast('请选择宠物种类 🐾');

    DB.addPet({
      name,
      species,
      breed: document.getElementById('petBreed').value.trim(),
      birthday: document.getElementById('petBirthday').value,
      weight: parseFloat(document.getElementById('petWeight').value) || null,
      gender: document.getElementById('petGender').value,
      neutered: document.getElementById('petNeutered').checked,
      note: document.getElementById('petNote').value.trim(),
      vaccines: [],
      dewormings: []
    });
    closeModal();
    showToast(`${name} 加入大家庭啦 🎉`);
    App.refresh();
  },

  update() {
    const id = document.getElementById('editPetId').value;
    const name = document.getElementById('petName').value.trim();
    if (!name) return showToast('请输入宠物名字 🐾');
    DB.updatePet(id, {
      name,
      species: document.getElementById('petSpecies').value,
      breed: document.getElementById('petBreed').value.trim(),
      birthday: document.getElementById('petBirthday').value,
      weight: parseFloat(document.getElementById('petWeight').value) || null,
      gender: document.getElementById('petGender').value,
      neutered: document.getElementById('petNeutered').checked,
      note: document.getElementById('petNote').value.trim()
    });
    closeModal();
    showToast('档案已更新 ✅');
    App.refresh();
  },

  remove(id) {
    const pet = DB.getPet(id);
    if (!pet) return;
    if (confirm(`确定要删除「${pet.name}」的档案吗？相关的病例记录也会一并删除。`)) {
      DB.deletePet(id);
      showToast('已删除');
      App.refresh();
    }
  },

  showRecords(petId) {
    App.navigate('medical');
    setTimeout(() => MedicalModule.setFilter(petId), 100);
  },

  showDetail(petId) {
    const pet = DB.getPet(petId);
    if (!pet) return;
    const age = pet.birthday ? this._calcAge(pet.birthday) : (pet.age || '?');
    openModal(`${getEmoji(pet.species)} ${pet.name} · 基本信息`, `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div class="pet-info-item"><div class="pet-info-label">种类</div><div class="pet-info-value">${getEmoji(pet.species)} ${pet.species}</div></div>
        <div class="pet-info-item"><div class="pet-info-label">品种</div><div class="pet-info-value">${pet.breed || '未知'}</div></div>
        <div class="pet-info-item"><div class="pet-info-label">年龄</div><div class="pet-info-value">${age}</div></div>
        <div class="pet-info-item"><div class="pet-info-label">体重</div><div class="pet-info-value">${pet.weight ? pet.weight + 'kg' : '未知'}</div></div>
        <div class="pet-info-item"><div class="pet-info-label">性别</div><div class="pet-info-value">${pet.gender || '未知'}</div></div>
        <div class="pet-info-item"><div class="pet-info-label">绝育</div><div class="pet-info-value">${pet.neutered ? '✅ 已绝育' : '❌ 未绝育'}</div></div>
        ${pet.birthday ? `<div class="pet-info-item" style="grid-column:1/-1;"><div class="pet-info-label">生日</div><div class="pet-info-value">${pet.birthday}</div></div>` : ''}
        ${pet.note ? `<div class="pet-info-item" style="grid-column:1/-1;"><div class="pet-info-label">备注</div><div class="pet-info-value" style="font-size:13px;">${pet.note}</div></div>` : ''}
      </div>`);
  }
};
