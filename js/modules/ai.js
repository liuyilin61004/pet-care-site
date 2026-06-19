/* === AI Pet Health Analyst === */
const AIModule = {
  render(container) {
    container.innerHTML = `
      <div class="ai-chat-container">
        <div class="ai-chat-messages" id="aiMessages">
          <div class="ai-message bot">
            👋 你好！我是 <strong>PawCare AI 健康分析师</strong> 🐾<br><br>
            我可以帮你分析宠物的健康状况。你可以：<br>
            · 描述宠物的异常症状，我会评估风险等级<br>
            · 询问日常护理和预防建议<br>
            · 了解常见疾病的早期征兆<br><br>
            <em style="color:var(--text-muted);font-size:12px;">⚠️ 本分析仅供参考，不能替代专业兽医诊断。紧急情况请立即就医。</em>
          </div>
        </div>
        <div class="ai-quick-qs" id="aiQuickQs">
          <button class="ai-quick-q" onclick="AIModule.quickAsk('我家猫咪最近频繁呕吐，怎么回事？')">🐱 猫咪频繁呕吐</button>
          <button class="ai-quick-q" onclick="AIModule.quickAsk('狗狗突然不吃东西了，怎么办？')">🐶 狗狗不吃东西</button>
          <button class="ai-quick-q" onclick="AIModule.quickAsk('宠物出现皮肤红肿、脱毛是什么问题？')">🔴 皮肤红肿脱毛</button>
          <button class="ai-quick-q" onclick="AIModule.quickAsk('猫咪一天应该喝多少水？')">💧 猫咪饮水量</button>
        </div>
        <div class="ai-chat-input-area">
          <input class="form-input" id="aiInput" placeholder="描述宠物的症状或健康问题..." onkeydown="if(event.key==='Enter')AIModule.ask()">
          <button class="btn btn-primary" onclick="AIModule.ask()">发送 ✨</button>
        </div>
      </div>`;
  },

  getActionButtons() {
    return `<button class="btn btn-sm btn-secondary" onclick="AIModule.clearChat()">🗑️ 清空对话</button>`;
  },

  ask() {
    const input = document.getElementById('aiInput');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    const msgContainer = document.getElementById('aiMessages');
    this._addMessage(msgContainer, 'user', text);

    // Simulate AI thinking
    setTimeout(() => {
      const response = this._analyze(text);
      this._addMessage(msgContainer, 'bot', response);
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }, 800 + Math.random() * 1200);
  },

  quickAsk(text) {
    document.getElementById('aiInput').value = text;
    this.ask();
  },

  clearChat() {
    const msgContainer = document.getElementById('aiMessages');
    msgContainer.innerHTML = `
      <div class="ai-message bot">
        👋 对话已清空。有什么关于宠物健康的问题想问吗？ 🐾
      </div>`;
  },

  _addMessage(container, role, text) {
    const div = document.createElement('div');
    div.className = `ai-message ${role}`;
    div.innerHTML = text.replace(/\n/g, '<br>');
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  },

  _analyze(input) {
    const q = input.toLowerCase();

    // Emergency red flags
    const emergencies = [
      { kw: ['抽搐', '癫痫', '中毒', '呼吸困难', '喘不上气', '心脏骤停', '倒地不起', '大量出血', '流血不止', '体温过低'],
        resp: `🚨 <strong>【紧急警告 · 立即就医】</strong><br><br>
你描述的症状属于<strong>高危紧急情况</strong>，请立即带宠物去最近的宠物医院急诊！<br><br>
途中注意事项：<br>
· 保持宠物安静，减少移动<br>
· 如果宠物失去意识但仍有心跳，保持呼吸道通畅<br>
· 如果是中毒，尽量记住毒物种类告诉医生<br>
· 拨打附近宠物医院的急诊电话提前通知<br><br>
<em style="color:#DC2626;">⚠️ 每耽误一分钟，风险都会成倍增加。</em>`
      },
      { kw: ['车祸', '被车撞', '摔伤', '高处坠落', '骨折', '站不起来', '瘫痪'],
        resp: `🚨 <strong>【紧急警告 · 可能骨折/内伤】</strong><br><br>
这类外伤可能导致内脏出血或脊柱损伤，<strong>请立即送医</strong>。<br><br>
移动时请注意：<br>
· 使用硬质平面（木板、硬纸板）作为担架<br>
· 不要随意翻动宠物身体<br>
· 如果有明显骨折，不要尝试复位<br>
· 用毛巾或毯子固定身体，避免晃动`
      },
      { kw: ['尿闭', '尿不出来', '排尿困难', '频繁蹲猫砂但没尿'],
        resp: `🚨 <strong>【紧急警告 · 疑似尿闭】</strong><br><br>
猫（尤其公猫）尿闭是<strong>致命的急症</strong>！膀胱可能破裂，24-48小时内可致死。<br><br>
<strong>请立即就医，不要等待！</strong><br><br>
这是兽医急诊中最常见的危重情况之一，越早处理预后越好。`
      },
      { kw: ['胃扭转', '肚子胀大', '干呕不出', '腹部膨胀'],
        resp: `🚨 <strong>【紧急警告 · 疑似胃扭转/腹脹】</strong><br><br>
大型犬（尤其深胸犬如大丹、德牧）胃扭转是<strong>极高致死率急症</strong>！<br><br>
症状：腹部迅速膨胀 → 干呕但吐不出 → 呼吸困难 → 休克<br><br>
<strong>立即送急诊手术，每分每秒都关乎生死。</strong>`
      }
    ];

    for (const e of emergencies) {
      if (e.kw.some(k => q.includes(k))) return e.resp;
    }

    // Digestive issues (common)
    if (q.includes('呕吐') || q.includes('吐了') || q.includes('吐黄水')) {
      if (q.includes('频繁') || q.includes('一直') || q.includes('多次') || q.includes('连续')) {
        return `🩺 <strong>频繁呕吐 · 风险等级：⚠️ 中高风险</strong><br><br>
频繁呕吐可能的原因：<br>
· <strong>异物阻塞</strong>：吃了不该吃的东西（线、玩具、塑料等）→ 需X光检查<br>
· <strong>胰腺炎</strong>：中老年犬猫常见，需血检确认<br>
· <strong>肠胃炎</strong>：细菌/病毒感染<br>
· <strong>肾病</strong>：老年猫常见<br><br>
<strong>建议：</strong><br>
1️⃣ 暂时禁食4-6小时（不禁水）<br>
2️⃣ 观察呕吐物颜色：黄色=胆汁（胃空），红色/咖啡色=出血（立即就医）<br>
3️⃣ 如果24小时内仍频繁呕吐，精神萎靡，<strong>尽快就医</strong><br>
4️⃣ 幼犬猫呕吐+腹泻 → 警惕细小/猫瘟，立即就医`;
    }
      return `🩺 <strong>偶尔呕吐 · 风险等级：🟡 低-中风险</strong><br><br>
宠物偶尔呕吐可能是：
· <strong>毛球</strong>（猫）：呕吐物中有毛发 → 正常，可给化毛膏
· <strong>吃太快</strong>：吃完马上吐未消化食物 → 少量多餐
· <strong>换粮过快</strong>：突然换粮 → 遵循7天过渡法
· <strong>轻微消化不良</strong><br><br>
<strong>建议：</strong><br>
· 禁食2-4小时观察<br>
· 如果精神/食欲正常，通常问题不大<br>
· 持续超过24小时或精神变差 → 就医`;
  }

    if (q.includes('拉稀') || q.includes('腹泻') || q.includes('软便') || q.includes('拉肚子')) {
      if (q.includes('血') || q.includes('带血') || q.includes('黑色')) {
        return `🩺 <strong>血便 · 风险等级：🔴 高风险</strong><br><br>
便血需要区分：<br>
· <strong>鲜红色</strong>：大肠/肛门出血 → 结肠炎、寄生虫、肛裂可能<br>
· <strong>黑色/柏油样</strong>：上消化道出血 → 更严重！<br><br>
<strong>建议：</strong><br>
立即就医检查！可能是细小病毒、寄生虫、肠套叠等需要紧急处理的疾病。`;
    }
      if (q.includes('呕吐') || q.includes('精神') || q.includes('不吃')) {
        return `🩺 <strong>呕吐+腹泻 · 风险等级：🔴 高风险</strong><br><br>
同时呕吐和腹泻容易导致<strong>严重脱水</strong>，尤其对幼犬猫。<br><br>
可能原因：细小病毒、猫瘟、严重肠胃炎、中毒。<br><br>
<strong>建议立即就医，不要在家观察。</strong>`;
    }
      return `🩺 <strong>腹泻 · 风险等级：🟡 中风险</strong><br><br>
常见原因：<br>
· <strong>饮食问题</strong>：吃了不该吃的、换粮太快、食物不耐受<br>
· <strong>寄生虫</strong>：蛔虫、球虫、贾第鞭毛虫<br>
· <strong>应激</strong>：环境变化、惊吓<br>
· <strong>细菌/病毒感染</strong><br><br>
<strong>建议：</strong><br>
1️⃣ 暂禁食12小时，少量多次给水<br>
2️⃣ 如果精神好、不吐，可以给益生菌<br>
3️⃣ 持续超过48小时或精神变差 → 就医做粪检`;
  }

    // Skin issues
    if (q.includes('皮肤') || q.includes('痒') || q.includes('挠') || q.includes('脱毛') || q.includes('掉毛') || q.includes('红肿') || q.includes('红点') || q.includes('疙瘩')) {
      return `🩺 <strong>皮肤问题 · 风险等级：🟡 中风险</strong><br><br>
宠物皮肤问题常见类型：<br><br>
· <strong>真菌感染（猫癣/狗癣）</strong>：圆形脱毛斑、皮屑 → 需抗真菌药浴/药膏，有传染人风险
· <strong>螨虫（疥螨/蠕形螨）</strong>：剧烈瘙痒、红斑 → 需兽医镜检确诊
· <strong>过敏性皮炎</strong>：食物/环境过敏 → 排查过敏原，可能需要处方粮
· <strong>跳蚤叮咬</strong>：腰背部瘙痒 → 做体外驱虫<br><br>
<strong>建议：</strong><br>
1️⃣ 拍照记录皮肤病变位置和形态<br>
2️⃣ 不要自行涂人用药膏（很多对宠物有毒！）<br>
3️⃣ 带去兽医做皮肤刮片检查确定病因<br>
4️⃣ 保持环境清洁，定期驱虫`;
  }

    // Appetite issues
    if (q.includes('不吃') || q.includes('食欲不振') || q.includes('没胃口') || q.includes('绝食')) {
      return `🩺 <strong>食欲不振 · 风险等级：根据伴随症状</strong><br><br>
猫狗不吃东西的常见原因：<br><br>
<strong>生理性：</strong><br>
· 天气太热（夏季常见）<br>
· 发情期（猫尤其明显）<br>
· 挑食/对食物厌倦<br>
· 刚打完疫苗（1-2天内正常）<br><br>
<strong>病理性（需警惕）：</strong><br>
· 口腔问题：牙结石、牙龈炎、口炎（口气重、流口水）<br>
· 消化系统：肠胃炎、胰腺炎<br>
· 肝肾问题：老年犬猫常见<br>
· 肿瘤：中老年动物<br><br>
<strong>判断标准：</strong><br>
· 24小时内不吃但精神好 → 可观察，尝试换食物/加热增加香味<br>
· 超过48小时不吃 → <strong>必须就医</strong><br>
· 猫超过72小时不进食 → 有脂肪肝风险，<strong>非常危险</strong><br>
· 不吃+精神萎靡/呕吐 → 立即就医`;
  }

    // Water/drinking
    if (q.includes('喝水') || q.includes('饮水') || q.includes('饮水量')) {
      return `💧 <strong>宠物饮水指南</strong><br><br>
<strong>每日建议饮水量：</strong><br>
· 犬：50-70ml / 每公斤体重<br>
· 猫：40-60ml / 每公斤体重<br><br>
例如：5kg的猫每天需要200-300ml水（约一碗半）<br><br>
<strong>喝太多（多饮）可能是：</strong>糖尿病、肾病、甲亢、子宫蓄脓 → 建议检查<br>
<strong>喝太少：</strong>猫常见，可以尝试：<br>
· 使用流动饮水机（猫喜欢活水）<br>
· 多处放置水碗<br>
· 湿粮掺水增加水分摄入<br>
· 注意：长期饮水量不足容易导致尿结石/肾病`;
  }

    // Eye issues
    if (q.includes('眼睛') || q.includes('眼屎') || q.includes('流泪') || q.includes('眼红')) {
      return `🩺 <strong>眼部问题 · 风险等级：⚠️ 中高风险</strong><br><br>
眼部问题不要拖延，可能迅速恶化导致失明。<br><br>
常见情况：<br>
· <strong>结膜炎</strong>：眼睛红肿、流泪 → 兽用眼药水治疗<br>
· <strong>角膜溃疡</strong>：眯眼、流泪、畏光 → <strong>需立即就医</strong><br>
· <strong>青光眼</strong>：眼球突出、瞳孔散大 → <strong>急诊！</strong><br>
· <strong>泪痕</strong>：浅色犬猫常见，多为鼻泪管堵塞或饮食问题<br><br>
<strong>建议：</strong>不要自行滴人用眼药水！带去兽医做荧光染色检查。`;
  }

    // Ear issues
    if (q.includes('耳朵') || q.includes('耳螨') || q.includes('甩头') || q.includes('耳臭')) {
      return `🩺 <strong>耳部问题 · 风险等级：🟡 中风险</strong><br><br>
· <strong>耳螨</strong>：黑褐色咖啡渣样分泌物，剧烈瘙痒甩头 → 需耳螨药+清洁
· <strong>马拉色菌（酵母菌）感染</strong>：油腻褐色分泌物，酸臭味 → 需抗真菌耳药
· <strong>细菌性外耳炎</strong>：脓性分泌物，疼痛 → 需抗生素耳药<br><br>
<strong>建议：</strong><br>
· 去兽医做耳道镜检查确定病因（耳螨/真菌/细菌用药完全不同）<br>
· 不要用棉签深掏耳朵！会损伤耳道<br>
· 垂耳犬种（金毛、可卡、贵宾等）需定期清洁耳道`;
  }

    // Dental
    if (q.includes('牙') || q.includes('口臭') || q.includes('牙结石') || q.includes('牙龈')) {
      return `🦷 <strong>口腔健康 · 风险等级：🟡 中风险</strong><br><br>
<strong>牙周病</strong>是犬猫最常见的疾病之一，3岁以上犬猫超80%有牙周问题。<br><br>
危害不只是口臭：细菌可通过牙龈进入血液，损害<strong>心脏、肾脏、肝脏</strong>。<br><br>
<strong>预防与护理：</strong><br>
· 每周至少刷2-3次牙（使用宠物专用牙膏）<br>
· 洁齿骨、洁牙零食作为辅助<br>
· 定期（1-2年）带去做专业洁牙<br>
· 如果牙龈红肿、牙结石严重 → 需要兽医超声洁牙`;
  }

    // Vaccination / preventive
    if (q.includes('疫苗') || q.includes('打针') || q.includes('驱虫')) {
      return `💉 <strong>疫苗与驱虫指南</strong><br><br>
<strong>核心疫苗（必打）：</strong><br>
· 犬：犬瘟、细小、腺病毒、狂犬（法律要求）<br>
· 猫：猫瘟、疱疹病毒、杯状病毒、狂犬<br>
· 幼犬猫：6-8周开始首免，间隔3-4周加强，共3次<br>
· 成年后：每年或每3年加强一次<br><br>
<strong>驱虫计划：</strong><br>
· <strong>体内驱虫</strong>：幼宠每月一次，成年宠每3个月一次<br>
· <strong>体外驱虫</strong>：每月一次（跳蚤/蜱虫活跃季节尤其重要）<br>
· 心丝虫预防：犬建议每月用药（通过蚊子传播，致死率高）<br><br>
<strong>建议</strong>：建立疫苗/驱虫日程表，不要漏掉！`;
  }

    // Neutering
    if (q.includes('绝育') || q.includes('阉割') || q.includes('节育')) {
      return `✂️ <strong>绝育建议</strong><br><br>
<strong>优点：</strong><br>
· 母犬猫：预防子宫蓄脓（中老年未绝育母犬发病率高达25%）、乳腺肿瘤<br>
· 公犬猫：减少攻击性、标记行为、前列腺问题、睾丸肿瘤<br>
· 控制流浪动物数量<br><br>
<strong>建议时间：</strong><br>
· 猫：5-6个月<br>
· 小型犬：6-8个月<br>
· 大型犬：12-18个月（骨骼发育完全后）<br><br>
<strong>术前检查：</strong>血常规、生化、心脏检查（确保麻醉安全）<br>
绝育是常规手术，技术成熟，不必过度担心。`;
  }

    // Weight / obesity
    if (q.includes('胖') || q.includes('体重') || q.includes('超重') || q.includes('减肥')) {
      return `⚖️ <strong>体重管理</strong><br><br>
宠物肥胖是常见健康杀手，会导致：糖尿病、关节炎、心脏病、寿命缩短。<br><br>
<strong>评估方法：</strong>触摸肋骨——轻松摸到=正常，摸不到=超重，看不到腰线=肥胖。<br><br>
<strong>减重建议：</strong><br>
· 精确计算每日喂食量（看包装上的建议克数，不是凭感觉）<br>
· 使用厨房秤称量，不要"估摸着倒"<br>
· 减少零食，零食热量不超过总摄入10%<br>
· 增加运动：犬每天30-60分钟，猫每天互动玩耍15-20分钟<br>
· 可考虑处方减肥粮<br>
· 目标：每周减重1-2%为宜，过快的体重下降可能伤害肝脏`;
  }

    // Senior pet care
    if (q.includes('老年') || q.includes('年纪大') || q.includes('老了') || q.includes('高龄')) {
      return `👴 <strong>老年宠物护理</strong><br><br>
犬猫进入老年期：小型犬10岁+、中大型犬7-8岁+、猫10岁+。<br><br>
<strong>老年常见问题与护理：</strong><br>
· <strong>关节炎</strong>：关节补充剂（葡萄糖胺、软骨素），软垫床，台阶辅助<br>
· <strong>认知障碍</strong>：夜间叫唤、迷路、作息混乱 → 保持规律作息<br>
· <strong>视/听力下降</strong>：家具位置不要频繁变动<br>
· <strong>慢性肾病</strong>：老年猫最常见 → 定期查肾功能，处方肾粮<br>
· <strong>牙齿问题</strong>：影响进食 → 考虑湿粮或软食<br><br>
<strong>建议：</strong>老年宠物每年至少体检2次（血常规+生化+B超）。`;
  }

    // General catch-all with helpful response
    return `🩺 <strong>PawCare 健康分析</strong><br><br>
根据你的描述，我建议你补充以下信息，这样我能给出更准确的分析：<br><br>
· 🐾 <strong>宠物种类、年龄、品种？</strong><br>
· 📅 <strong>症状从什么时候开始的？</strong><br>
· 🍖 <strong>食欲和精神状态如何？</strong><br>
· 💩 <strong>大小便是否正常？</strong><br>
· 💊 <strong>最近有没有吃过什么特别的东西或用过什么药？</strong><br><br>
<em style="color:var(--text-muted);font-size:12px;">⚠️ 任何持续超过24小时的异常症状，或伴随精神萎靡、拒食的情况，都建议尽快就医。</em>`;
  }
};
