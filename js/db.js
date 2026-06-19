/* === Database Layer (localStorage) === */
const DB = {
  _key(k) { return `pawcare_${k}`; },

  get(k) {
    try { return JSON.parse(localStorage.getItem(this._key(k))); }
    catch { return null; }
  },

  set(k, v) {
    localStorage.setItem(this._key(k), JSON.stringify(v));
  },

  // --- Users ---
  getUsers() { return this.get('users') || []; },
  saveUsers(users) { this.set('users', users); },
  getUser(id) { return this.getUsers().find(u => u.id === id); },
  getUserByUsername(username) { return this.getUsers().find(u => u.username === username); },
  getCurrentUser() { return this.get('currentUser'); },
  setCurrentUser(user) { this.set('currentUser', user); },
  logout() { this.set('currentUser', null); },
  register(username, password) {
    const users = this.getUsers();
    if (users.find(u => u.username === username)) return { error: '用户名已存在' };
    if (username.length < 2) return { error: '用户名至少2个字符' };
    if (password.length < 4) return { error: '密码至少4个字符' };
    const user = {
      id: Date.now().toString(36),
      username,
      password: btoa(password),
      avatar: ['🐱','🐶','🐰','🐹','🦜','🐾'][Math.floor(Math.random()*6)],
      bio: '',
      createdAt: new Date().toISOString()
    };
    users.push(user);
    this.saveUsers(users);
    this.setCurrentUser({ id: user.id, username: user.username, avatar: user.avatar, bio: user.bio, createdAt: user.createdAt });
    return { user: this.getCurrentUser() };
  },
  login(username, password) {
    const user = this.getUsers().find(u => u.username === username && u.password === btoa(password));
    if (!user) return { error: '用户名或密码错误' };
    const cu = { id: user.id, username: user.username, avatar: user.avatar, bio: user.bio || '', createdAt: user.createdAt };
    this.setCurrentUser(cu);
    return { user: cu };
  },
  updateProfile(id, data) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...data };
    this.saveUsers(users);
    const cu = { id: users[idx].id, username: users[idx].username, avatar: users[idx].avatar, bio: users[idx].bio || '', createdAt: users[idx].createdAt };
    this.setCurrentUser(cu);
    return cu;
  },

  // --- Pets ---
  getPets() { return this.get('pets') || []; },
  savePets(pets) { this.set('pets', pets); },
  getPet(id) { return this.getPets().find(p => p.id === id); },
  addPet(pet) {
    const pets = this.getPets();
    pet.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    pet.createdAt = new Date().toISOString();
    pets.unshift(pet);
    this.savePets(pets);
    return pet;
  },
  updatePet(id, data) {
    const pets = this.getPets();
    const idx = pets.findIndex(p => p.id === id);
    if (idx === -1) return null;
    pets[idx] = { ...pets[idx], ...data, updatedAt: new Date().toISOString() };
    this.savePets(pets);
    return pets[idx];
  },
  deletePet(id) {
    let pets = this.getPets();
    pets = pets.filter(p => p.id !== id);
    this.savePets(pets);
    // Also delete related medical records
    let records = this.getRecords();
    records = records.filter(r => r.petId !== id);
    this.saveRecords(records);
  },

  // --- Vaccines (stored per pet) ---
  getVaccines(petId) { return this.getPet(petId)?.vaccines || []; },
  addVaccine(petId, vax) {
    const pet = this.getPet(petId);
    if (!pet) return null;
    if (!pet.vaccines) pet.vaccines = [];
    vax.id = Date.now().toString(36);
    vax.createdAt = new Date().toISOString();
    pet.vaccines.unshift(vax);
    this.updatePet(petId, { vaccines: pet.vaccines });
    return vax;
  },
  updateVaccine(petId, vaxId, data) {
    const pet = this.getPet(petId);
    if (!pet?.vaccines) return null;
    const idx = pet.vaccines.findIndex(v => v.id === vaxId);
    if (idx === -1) return null;
    pet.vaccines[idx] = { ...pet.vaccines[idx], ...data };
    this.updatePet(petId, { vaccines: pet.vaccines });
    return pet.vaccines[idx];
  },
  deleteVaccine(petId, vaxId) {
    const pet = this.getPet(petId);
    if (!pet?.vaccines) return;
    pet.vaccines = pet.vaccines.filter(v => v.id !== vaxId);
    this.updatePet(petId, { vaccines: pet.vaccines });
  },

  // --- Deworming (stored per pet) ---
  getDewormings(petId) { return this.getPet(petId)?.dewormings || []; },
  addDeworming(petId, dw) {
    const pet = this.getPet(petId);
    if (!pet) return null;
    if (!pet.dewormings) pet.dewormings = [];
    dw.id = Date.now().toString(36);
    dw.createdAt = new Date().toISOString();
    pet.dewormings.unshift(dw);
    this.updatePet(petId, { dewormings: pet.dewormings });
    return dw;
  },
  updateDeworming(petId, dwId, data) {
    const pet = this.getPet(petId);
    if (!pet?.dewormings) return null;
    const idx = pet.dewormings.findIndex(d => d.id === dwId);
    if (idx === -1) return null;
    pet.dewormings[idx] = { ...pet.dewormings[idx], ...data };
    this.updatePet(petId, { dewormings: pet.dewormings });
    return pet.dewormings[idx];
  },
  deleteDeworming(petId, dwId) {
    const pet = this.getPet(petId);
    if (!pet?.dewormings) return;
    pet.dewormings = pet.dewormings.filter(d => d.id !== dwId);
    this.updatePet(petId, { dewormings: pet.dewormings });
  },

  // --- Medical Records ---
  getRecords() { return this.get('records') || []; },
  saveRecords(records) { this.set('records', records); },
  addRecord(record) {
    const records = this.getRecords();
    record.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    record.createdAt = new Date().toISOString();
    records.unshift(record);
    this.saveRecords(records);
    return record;
  },
  updateRecord(id, data) {
    const records = this.getRecords();
    const idx = records.findIndex(r => r.id === id);
    if (idx === -1) return null;
    records[idx] = { ...records[idx], ...data, updatedAt: new Date().toISOString() };
    this.saveRecords(records);
    return records[idx];
  },
  deleteRecord(id) {
    let records = this.getRecords();
    records = records.filter(r => r.id !== id);
    this.saveRecords(records);
  },
  getRecordsByPet(petId) {
    return this.getRecords().filter(r => r.petId === petId);
  },

  // --- Community ---
  getPosts() { return this.get('posts') || []; },
  savePosts(posts) { this.set('posts', posts); },
  addPost(post) {
    const posts = this.getPosts();
    post.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    post.createdAt = new Date().toISOString();
    post.likes = 0;
    post.replies = [];
    post.userId = post.userId || (this.getCurrentUser()?.id || null);
    post.images = post.images || [];
    posts.unshift(post);
    this.savePosts(posts);
    return post;
  },
  addReply(postId, reply) {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return null;
    reply.id = Date.now().toString(36);
    reply.createdAt = new Date().toISOString();
    post.replies.push(reply);
    this.savePosts(posts);
    return reply;
  },
  toggleLike(postId) {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    post.likes = (post.likes || 0) + 1;
    this.savePosts(posts);
    return post.likes;
  }
};
