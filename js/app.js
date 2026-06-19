/* === App Controller === */
const App = {
  currentModule: 'home',

  modules: {
    home:     { title: '🏠 首页',       icon: '🏠', renderer: HomeModule },
    pets:     { title: '🐱 宠物档案',   icon: '🐱', renderer: PetsModule },
    health:   { title: '💉 疫苗驱虫',   icon: '💉', renderer: HealthModule },
    medical:  { title: '💊 病例记录',   icon: '💊', renderer: MedicalModule },
    ai:       { title: '🤖 AI 健康分析', icon: '🤖', renderer: AIModule },
    community:{ title: '💬 宠友社区',   icon: '💬', renderer: CommunityModule },
    profile:  { title: '👤 个人中心',   icon: '👤', renderer: ProfileModule }
  },

  init() {
    document.getElementById('appContainer').style.display = 'flex';
    this._updateSidebarProfile();
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const module = item.dataset.module;
        if (module) this.navigate(module);
      });
    });
    this.navigate('home');
  },

  navigate(module) {
    if (!this.modules[module]) return;
    this.currentModule = module;
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.module === module);
    });
    document.getElementById('pageTitle').textContent = this.modules[module].title;
    const actionBar = document.getElementById('topBarActions');
    const renderer = this.modules[module].renderer;
    if (renderer.getActionButtons) {
      actionBar.innerHTML = renderer.getActionButtons();
    } else {
      actionBar.innerHTML = '';
    }
    const content = document.getElementById('contentArea');
    content.scrollTop = 0;
    renderer.render(content);
    this._updateSidebarProfile();
    this.updatePetCount();
  },

  refresh() {
    this.navigate(this.currentModule);
  },

  _updateSidebarProfile() {
    const user = DB.getCurrentUser();
    const el = document.getElementById('sidebarProfile');
    if (user) {
      el.style.display = 'flex';
      document.getElementById('sidebarAvatar').textContent = user.avatar || '🐾';
      document.getElementById('sidebarName').textContent = user.username;
    } else {
      el.style.display = 'none';
    }
  },

  updatePetCount() {
    const count = DB.getPets().length;
    document.getElementById('petCount').textContent = `🐾 ${count} 只小可爱`;
  }
};
