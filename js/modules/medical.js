/* === Medical Records Module === */
const MedicalModule = {
  filterPetId: null,

  setFilter(petId) {
    this.filterPetId = petId;
    this.render(document.getElementById('contentArea'));
  },

  render(container) {
    container.innerHTML = '';
    let records = DB.getRecords();
    if (this.filterPetId) {
      records = records.filter(r => r.petId === this.filterPetId);
    }

    // Pet filter bar (show all pets as quick filters)
    if (!this.filterPetId) {
      const bar = document.createElement('div');
      bar.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;';
      const allBtn = document.createElement('button');
      allBtn.className = 'btn btn-sm btn-primary';
      allBtn.textContent = '🐾 全部';
      allBtn.onclick = () => { this.filterPetId = null; this.render(container); };
      bar.appendChild(allBtn);

      DB.getPets().forEach(pet => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-sm btn-secondary';
        btn.textContent = `${getEmoji(pet.species)} ${pet.name}`;
        btn.onclick = () => { this.filterPetId = pet.id; this.render(container); };
        bar.appendChild(btn);
      });
      container.appendChild(bar);
    } else {
      const pet = DB.getPet(this.filterPetId);
      if (pet) {
        const bar = document.createElement('div');
        bar.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:20px;';
        bar.innerHTML = `
          <span style="font-weight:700;color:var(--text-secondary);">筛选：${getEmoji(pet.species)} ${pet.name} 的病例</span>
          <button class="btn btn-sm btn-secondary" onclick="MedicalModule.filterPetId=null;MedicalModule.render(document.getElementById('contentArea'));">✕ 清除筛选</button>`;
        container.appendChild(bar);
      }
    }

    if (records.length === 0) {
      container.innerHTML += `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-text">暂无病例记录</div>
          <div class="empty-state-hint">记录毛孩子的就诊历史，追踪健康变化～</div>
        </div>`;
      return;
    }

    records.forEach(r => container.appendChild(this._createCard(r)));
  },

  _createCard(record) {
    const pet = DB.getPet(record.petId);
    const card = document.createElement('div');
    card.className = 'card record-card';
    card.innerHTML = `
      <div class="record-date">📅 ${new Date(record.date).toLocaleDateString('zh-CN', {year:'numeric',month:'long',day:'numeric'})}</div>
      <div class="record-pet">${pet ? getEmoji(pet.species) + ' ' + pet.name : '未知宠物'}</div>
      <div class="record-reason">🏥 就诊原因：${record.reason}</div>
      ${record.diagnosis ? `<div style="font-size:13px;color:var(--text-secondary);margin-bottom:6px;">🔬 诊断：${record.diagnosis}</div>` : ''}
      ${record.treatment ? `<div style="font-size:13px;color:var(--text-secondary);margin-bottom:6px;">💉 治疗：${record.treatment}</div>` : ''}
      ${record.vet ? `<div style="font-size:13px;color:var(--text-muted);margin-bottom:6px;">👨‍⚕️ ${record.vet}${record.hospital ? ' · ' + record.hospital : ''}</div>` : ''}
      <div class="record-tags">
        ${record.diagnosis ? `<span class="tag tag-diagnosis">诊断</span>` : ''}
        ${record.treatment ? `<span class="tag tag-treatment">治疗</span>` : ''}
        ${record.medications ? `<span class="tag tag-medication">${record.medications}</span>` : ''}
      </div>
      ${record.note ? `<div style="font-size:12px;color:var(--text-muted);margin-top:8px;">📝 ${record.note}</div>` : ''}
      <div style="display:flex;gap:6px;justify-content:flex-end;margin-top:10px;">
        <button class="btn btn-sm btn-secondary" onclick="MedicalModule.edit('${record.id}')">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="MedicalModule.remove('${record.id}')">🗑️</button>
      </div>`;
    return card;
  },

  getActionButtons() {
    return `<button class="btn btn-primary" onclick="MedicalModule.openAdd()">+ 添加记录</button>`;
  },

  openAdd() {
    const pets = DB.getPets();
    if (pets.length === 0) {
      return showToast('请先添加宠物档案 🐾');
    }
    const petOptions = pets.map(p => `<option value="${p.id}">${getEmoji(p.species)} ${p.name}</option>`).join('');

    openModal('添加病例记录', `
      <input type="hidden" id="recPetId" value="${this.filterPetId || pets[0].id}">
      <div class="form-group">
        <label class="form-label">🐾 宠物</label>
        <select class="form-select" id="recPetSelect">
          ${petOptions}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">📅 就诊日期 *</label>
          <input class="form-input" type="date" id="recDate" value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="form-group">
          <label class="form-label">🏥 就诊原因 *</label>
          <input class="form-input" id="recReason" placeholder="如：呕吐、食欲不振">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">🔬 诊断结果</label>
        <input class="form-input" id="recDiagnosis" placeholder="医生的诊断结论">
      </div>
      <div class="form-group">
        <label class="form-label">💉 治疗方案</label>
        <input class="form-input" id="recTreatment" placeholder="治疗措施、手术等">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">💊 用药</label>
          <input class="form-input" id="recMeds" placeholder="药物名称、剂量">
        </div>
        <div class="form-group">
          <label class="form-label">👨‍⚕️ 医生</label>
          <input class="form-input" id="recVet" placeholder="就诊医生">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">🏥 医院</label>
        <input class="form-input" id="recHospital" placeholder="就诊医院">
      </div>
      <div class="form-group">
        <label class="form-label">📝 备注</label>
        <textarea class="form-textarea" id="recNote" placeholder="其他需要记录的信息..."></textarea>
      </div>
      <div class="form-actions">
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="MedicalModule.save()">💾 保存</button>
      </div>`);

    // Set pre-selected pet if filtering
    if (this.filterPetId) {
      document.getElementById('recPetSelect').value = this.filterPetId;
    }
    document.getElementById('recPetSelect').addEventListener('change', function() {
      document.getElementById('recPetId').value = this.value;
    });
  },

  edit(id) {
    const r = DB.getRecords().find(rr => rr.id === id);
    if (!r) return;
    const pets = DB.getPets();
    const petOptions = pets.map(p => `<option value="${p.id}" ${p.id===r.petId?'selected':''}>${getEmoji(p.species)} ${p.name}</option>`).join('');

    openModal('编辑病例记录', `
      <input type="hidden" id="recId" value="${r.id}">
      <div class="form-group">
        <label class="form-label">🐾 宠物</label>
        <select class="form-select" id="recPetSelect">${petOptions}</select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">📅 就诊日期</label>
          <input class="form-input" type="date" id="recDate" value="${r.date}">
        </div>
        <div class="form-group">
          <label class="form-label">🏥 就诊原因</label>
          <input class="form-input" id="recReason" value="${r.reason}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">🔬 诊断结果</label>
        <input class="form-input" id="recDiagnosis" value="${r.diagnosis || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">💉 治疗方案</label>
        <input class="form-input" id="recTreatment" value="${r.treatment || ''}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">💊 用药</label>
          <input class="form-input" id="recMeds" value="${r.medications || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">👨‍⚕️ 医生</label>
          <input class="form-input" id="recVet" value="${r.vet || ''}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">🏥 医院</label>
        <input class="form-input" id="recHospital" value="${r.hospital || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">📝 备注</label>
        <textarea class="form-textarea" id="recNote">${r.note || ''}</textarea>
      </div>
      <div class="form-actions">
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="MedicalModule.update()">💾 保存</button>
      </div>`);
  },

  save() {
    const reason = document.getElementById('recReason').value.trim();
    const date = document.getElementById('recDate').value;
    if (!reason) return showToast('请填写就诊原因 🏥');
    if (!date) return showToast('请选择就诊日期 📅');

    DB.addRecord({
      petId: document.getElementById('recPetSelect').value,
      date,
      reason,
      diagnosis: document.getElementById('recDiagnosis').value.trim(),
      treatment: document.getElementById('recTreatment').value.trim(),
      medications: document.getElementById('recMeds').value.trim(),
      vet: document.getElementById('recVet').value.trim(),
      hospital: document.getElementById('recHospital').value.trim(),
      note: document.getElementById('recNote').value.trim()
    });
    closeModal();
    showToast('病例记录已保存 📋');
    App.refresh();
  },

  update() {
    const id = document.getElementById('recId').value;
    DB.updateRecord(id, {
      petId: document.getElementById('recPetSelect').value,
      date: document.getElementById('recDate').value,
      reason: document.getElementById('recReason').value.trim(),
      diagnosis: document.getElementById('recDiagnosis').value.trim(),
      treatment: document.getElementById('recTreatment').value.trim(),
      medications: document.getElementById('recMeds').value.trim(),
      vet: document.getElementById('recVet').value.trim(),
      hospital: document.getElementById('recHospital').value.trim(),
      note: document.getElementById('recNote').value.trim()
    });
    closeModal();
    showToast('记录已更新 ✅');
    App.refresh();
  },

  remove(id) {
    if (confirm('确定要删除这条病例记录吗？')) {
      DB.deleteRecord(id);
      showToast('已删除');
      App.refresh();
    }
  }
};
