/* === Home Module === */
const HomeModule = {
  render(container) {
    const pets = DB.getPets();
    const records = DB.getRecords();
    const posts = DB.getPosts();

    // Count upcoming vaccines (within 30 days)
    let upcomingVax = 0;
    let overdueVax = 0;
    pets.forEach(p => {
      (p.vaccines || []).forEach(v => {
        if (!v.nextDate) return;
        const days = Math.ceil((new Date(v.nextDate) - new Date()) / 86400000);
        if (days < 0) overdueVax++;
        else if (days <= 30) upcomingVax++;
      });
      (p.dewormings || []).forEach(d => {
        if (!d.nextDate) return;
        const days = Math.ceil((new Date(d.nextDate) - new Date()) / 86400000);
        if (days < 0) overdueVax++;
        else if (days <= 30) upcomingVax++;
      });
    });

    container.innerHTML = `
      <div class="home-container">
        <img class="home-logo" src="listenhub-20260619-172147-o62fkg.png" alt="Pet Care">
        <h1 class="home-title">Pet Care</h1>
        <p class="home-slogan">
          毛孩子，是家人。<br>
          愿每一只都健康、平安、被爱。
        </p>
        <div class="home-stats">
          <div class="home-stat">
            <div class="home-stat-num">${pets.length}</div>
            <div class="home-stat-label">🐾 毛孩子</div>
          </div>
          <div class="home-stat">
            <div class="home-stat-num">${records.length}</div>
            <div class="home-stat-label">📋 病例记录</div>
          </div>
          <div class="home-stat">
            <div class="home-stat-num">${posts.length}</div>
            <div class="home-stat-label">💬 社区帖子</div>
          </div>
          ${overdueVax > 0 ? `
          <div class="home-stat" style="border: 2px solid #FCA5A5;">
            <div class="home-stat-num" style="color:#DC2626;">${overdueVax}</div>
            <div class="home-stat-label" style="color:#DC2626;">⚠️ 已过期</div>
          </div>` : ''}
          ${upcomingVax > 0 ? `
          <div class="home-stat" style="border: 2px solid #FDE68A;">
            <div class="home-stat-num" style="color:#B45309;">${upcomingVax}</div>
            <div class="home-stat-label" style="color:#B45309;">⏰ 即将到期</div>
          </div>` : ''}
        </div>
      </div>`;
  },

  getActionButtons() {
    return '';
  }
};
