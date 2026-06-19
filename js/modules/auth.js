/* === Auth Module === */
const Auth = {
  init() {
    const user = DB.getCurrentUser();
    if (user) {
      document.getElementById('authOverlay').style.display = 'none';
      App.init();
    } else {
      document.getElementById('authOverlay').style.display = 'flex';
      this.showLogin();
    }
  },

  showLogin() {
    document.getElementById('authBox').innerHTML = `
      <div class="auth-logo">
        <img src="listenhub-20260619-172147-o62fkg.png" alt="Pet Care" style="width:80px;height:80px;border-radius:50%;object-fit:cover;">
      </div>
      <h1 class="auth-title">Pet Care</h1>
      <p class="auth-subtitle">毛孩子，是家人。</p>
      <div class="form-group">
        <label class="form-label">👤 用户名</label>
        <input class="form-input" id="loginUser" placeholder="输入用户名" onkeydown="if(event.key==='Enter')Auth.doLogin()">
      </div>
      <div class="form-group">
        <label class="form-label">🔒 密码</label>
        <input class="form-input" type="password" id="loginPass" placeholder="输入密码" onkeydown="if(event.key==='Enter')Auth.doLogin()">
      </div>
      <div id="authError" style="color:#DC2626;font-size:13px;font-weight:700;margin-bottom:14px;display:none;"></div>
      <button class="btn btn-primary" style="width:100%;margin-bottom:10px;" onclick="Auth.doLogin()">登录</button>
      <button class="btn btn-secondary" style="width:100%;" onclick="Auth.showRegister()">还没有账号？注册</button>`;
  },

  showRegister() {
    document.getElementById('authBox').innerHTML = `
      <div class="auth-logo">
        <img src="listenhub-20260619-172147-o62fkg.png" alt="Pet Care" style="width:80px;height:80px;border-radius:50%;object-fit:cover;">
      </div>
      <h1 class="auth-title">创建账号</h1>
      <p class="auth-subtitle">加入 Pet Care，守护毛孩子 🐾</p>
      <div class="form-group">
        <label class="form-label">👤 用户名</label>
        <input class="form-input" id="regUser" placeholder="给自己取个名字">
      </div>
      <div class="form-group">
        <label class="form-label">🔒 密码</label>
        <input class="form-input" type="password" id="regPass" placeholder="至少4个字符">
      </div>
      <div class="form-group">
        <label class="form-label">🔒 确认密码</label>
        <input class="form-input" type="password" id="regPass2" placeholder="再次输入密码" onkeydown="if(event.key==='Enter')Auth.doRegister()">
      </div>
      <div id="authError" style="color:#DC2626;font-size:13px;font-weight:700;margin-bottom:14px;display:none;"></div>
      <button class="btn btn-primary" style="width:100%;margin-bottom:10px;" onclick="Auth.doRegister()">注册</button>
      <button class="btn btn-secondary" style="width:100%;" onclick="Auth.showLogin()">← 返回登录</button>`;
  },

  showError(msg) {
    const el = document.getElementById('authError');
    el.textContent = msg;
    el.style.display = 'block';
  },

  doLogin() {
    const username = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPass').value;
    if (!username || !password) return this.showError('请填写用户名和密码');
    const result = DB.login(username, password);
    if (result.error) return this.showError(result.error);
    document.getElementById('authOverlay').style.display = 'none';
    App.init();
    showToast(`欢迎回来，${username}！🐾`);
  },

  doRegister() {
    const username = document.getElementById('regUser').value.trim();
    const password = document.getElementById('regPass').value;
    const pass2 = document.getElementById('regPass2').value;
    if (!username || !password) return this.showError('请填写所有字段');
    if (password !== pass2) return this.showError('两次密码不一致');
    const result = DB.register(username, password);
    if (result.error) return this.showError(result.error);
    document.getElementById('authOverlay').style.display = 'none';
    App.init();
    showToast(`🎉 欢迎加入 Pet Care，${username}！`);
  }
};
