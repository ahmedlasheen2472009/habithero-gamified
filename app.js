// HabitHero — main app logic
// Ahmed Lasheen

// --- SOUND FX ---
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.3;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, duration, type = 'sine', gainVal = 0.3, delay = 0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const startTime = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(gainVal * this.volume, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // Harmonic chord arpeggio for habit completion
  playComplete() {
    if (!this.enabled) return;
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      this.playTone(freq, 0.25, 'triangle', 0.25, idx * 0.06);
    });
  }

  // Triumphant multi-chord fanfare for Level Up
  playLevelUp() {
    if (!this.enabled) return;
    this.init();
    const notes = [
      { f: 523.25, d: 0.15, t: 0.0 },  // C5
      { f: 659.25, d: 0.15, t: 0.12 }, // E5
      { f: 783.99, d: 0.15, t: 0.24 }, // G5
      { f: 1046.50, d: 0.5, t: 0.36 }, // C6
      { f: 1318.51, d: 0.6, t: 0.48 }  // E6
    ];
    notes.forEach(n => {
      this.playTone(n.f, n.d, 'triangle', 0.35, n.t);
      this.playTone(n.f * 0.5, n.d, 'sine', 0.25, n.t); // Bass harmonic
    });
  }

  // Laser punch impact for boss hit
  playBossHit() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const startTime = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(350, startTime);
    osc.frequency.exponentialRampToValueAtTime(60, startTime + 0.18);

    gainNode.gain.setValueAtTime(0.35 * this.volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.2);
  }

  // Epic boss defeat victory fanfare
  playBossDefeat() {
    if (!this.enabled) return;
    this.init();
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 0.4, 'sawtooth', 0.2, idx * 0.12);
      this.playTone(freq * 0.5, 0.4, 'triangle', 0.25, idx * 0.12);
    });
  }

  // Ascending pitch combo tone based on multiplier
  playCombo(multiplier) {
    if (!this.enabled) return;
    this.init();
    const baseFreq = 587.33 * multiplier; // D5 scaled
    this.playTone(baseFreq, 0.15, 'sine', 0.25);
    this.playTone(baseFreq * 1.25, 0.2, 'triangle', 0.2, 0.05);
  }

  // Sparkly chime for badge unlock
  playBadgeUnlock() {
    if (!this.enabled) return;
    this.init();
    const notes = [784, 988, 1175, 1568];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 0.35, 'sine', 0.25, idx * 0.08);
    });
  }

  // Descending tone for undo
  playUndo() {
    if (!this.enabled) return;
    this.init();
    this.playTone(600, 0.1, 'sine', 0.2, 0);
    this.playTone(400, 0.15, 'sine', 0.2, 0.08);
  }

  // Crisp subtle UI click
  playClick() {
    if (!this.enabled) return;
    this.init();
    this.playTone(800, 0.04, 'sine', 0.1);
  }
}

// --- PARTICLE FX ---
class ParticleFX {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.floatingTexts = [];
    this.isRunning = false;
    this.colors = ['#6C63FF', '#FF6584', '#43E97B', '#FFD166', '#00d2ff', '#9d50bb', '#FFFFFF'];

    if (this.canvas) {
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }
  }

  resize() {
    if (!this.canvas) return;
    this.dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    if (this.ctx) {
      this.ctx.scale(this.dpr, this.dpr);
    }
  }

  burst(x, y, count = 40) {
    if (!this.canvas) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      this.particles.push({
        x: x || this.width / 2,
        y: y || this.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: Math.random() * 7 + 4,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        decay: Math.random() * 0.02 + 0.012,
        shape: Math.random() > 0.4 ? 'rect' : 'circle'
      });
    }
    if (!this.isRunning) this.startLoop();
  }

  fullscreenCelebration() {
    if (!this.canvas) return;
    // Launch bursts across multiple screen coordinates
    this.burst(this.width * 0.25, this.height * 0.4, 50);
    this.burst(this.width * 0.5, this.height * 0.3, 70);
    this.burst(this.width * 0.75, this.height * 0.4, 50);
  }

  spawnFloatingText(text, x, y, color = '#FFD166') {
    this.floatingTexts.push({
      text,
      x: x || this.width / 2,
      y: y || this.height / 2,
      vy: -2,
      opacity: 1,
      decay: 0.02,
      color
    });
    if (!this.isRunning) this.startLoop();
  }

  startLoop() {
    this.isRunning = true;
    const animate = () => {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Render & update particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // Gravity
        p.vx *= 0.98; // Air drag
        p.rotation += p.rotationSpeed;
        p.opacity -= p.decay;

        if (p.opacity <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, p.opacity);
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
        } else {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          this.ctx.fill();
        }
        this.ctx.restore();
      }

      // Render & update floating combat/XP text
      for (let j = this.floatingTexts.length - 1; j >= 0; j--) {
        const ft = this.floatingTexts[j];
        ft.y += ft.vy;
        ft.opacity -= ft.decay;

        if (ft.opacity <= 0) {
          this.floatingTexts.splice(j, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, ft.opacity);
        this.ctx.font = 'bold 18px Outfit, sans-serif';
        this.ctx.fillStyle = ft.color;
        this.ctx.shadowColor = 'rgba(0,0,0,0.8)';
        this.ctx.shadowBlur = 6;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(ft.text, ft.x, ft.y);
        this.ctx.restore();
      }

      if (this.particles.length > 0 || this.floatingTexts.length > 0) {
        requestAnimationFrame(animate);
      } else {
        this.isRunning = false;
      }
    };
    requestAnimationFrame(animate);
  }
}

// --- STORAGE & DATA MANAGEMENT ---
const STORAGE_KEY = 'habithero_game_data_v1';

const DEFAULT_HABITS = [
  {
    id: 'habit_1',
    name: 'Drink 8 glasses of water',
    icon: '💧',
    category: 'Health',
    difficulty: 2,
    frequency: 'daily',
    color: '#38ef7d',
    createdAt: new Date().toISOString(),
    history: {} // 'YYYY-MM-DD': true
  },
  {
    id: 'habit_2',
    name: 'Exercise 30 min',
    icon: '🏃',
    category: 'Fitness',
    difficulty: 4,
    frequency: 'daily',
    color: '#FF6584',
    createdAt: new Date().toISOString(),
    history: {}
  },
  {
    id: 'habit_3',
    name: 'Read 20 pages',
    icon: '📚',
    category: 'Learning',
    difficulty: 3,
    frequency: 'daily',
    color: '#6C63FF',
    createdAt: new Date().toISOString(),
    history: {}
  },
  {
    id: 'habit_4',
    name: 'Meditate 10 min',
    icon: '🧘',
    category: 'Mindfulness',
    difficulty: 2,
    frequency: 'daily',
    color: '#00d2ff',
    createdAt: new Date().toISOString(),
    history: {}
  },
  {
    id: 'habit_5',
    name: 'Sleep by 11pm',
    icon: '😴',
    category: 'Health',
    difficulty: 3,
    frequency: 'daily',
    color: '#9d50bb',
    createdAt: new Date().toISOString(),
    history: {}
  }
];

const BADGES_SPEC = [
  { id: 'first_step', name: 'First Step', desc: 'Complete your first habit quest', icon: '🌱', rarity: 'common' },
  { id: 'high_five', name: 'High Five', desc: 'Complete 5 habit quests', icon: '🖐️', rarity: 'common' },
  { id: 'century', name: 'Century Club', desc: 'Complete 100 total habit quests', icon: '💯', rarity: 'rare' },
  { id: 'grandmaster', name: 'Habit Grandmaster', desc: 'Complete 500 total habit quests', icon: '👑', rarity: 'legendary' },
  { id: 'on_fire', name: 'On Fire', desc: 'Reach a 7-day streak on any habit', icon: '🔥', rarity: 'rare' },
  { id: 'unstoppable', name: 'Unstoppable', desc: 'Reach a 14-day streak on any habit', icon: '⚡', rarity: 'rare' },
  { id: 'legendary_streak', name: 'Legendary', desc: 'Reach a 30-day streak on any habit', icon: '🌟', rarity: 'epic' },
  { id: 'titan_will', name: 'Titan of Will', desc: 'Reach a 60-day streak on any habit', icon: '🛡️', rarity: 'legendary' },
  { id: 'perfectionist', name: 'Perfectionist', desc: 'Complete 100% of habits scheduled for a day', icon: '🎯', rarity: 'rare' },
  { id: 'triple_perfect', name: 'Triple Perfection', desc: 'Achieve 100% completion 3 days in a row', icon: '💎', rarity: 'epic' },
  { id: 'flawless_week', name: 'Flawless Week', desc: 'Maintain a 7-day Hero Streak', icon: '🌈', rarity: 'epic' },
  { id: 'boss_slayer', name: 'Boss Slayer', desc: 'Defeat your first weekly Boss Monster', icon: '⚔️', rarity: 'epic' },
  { id: 'boss_dominator', name: 'Boss Dominator', desc: 'Defeat 3 weekly Boss Monsters', icon: '🐉', rarity: 'legendary' },
  { id: 'dragon_tamer', name: 'Dragon Tamer', desc: 'Evolve your companion Aero to Adult form', icon: '🐲', rarity: 'legendary' },
  { id: 'combo_king', name: 'Combo King', desc: 'Reach the maximum 3.0x Combo Multiplier', icon: '⚡', rarity: 'rare' },
  { id: 'early_bird', name: 'Early Bird', desc: 'Complete a habit before 8:00 AM', icon: '🌅', rarity: 'common' },
  { id: 'night_owl', name: 'Night Owl', desc: 'Complete a habit after 10:00 PM', icon: '🦉', rarity: 'common' },
  { id: 'polymath', name: 'Renaissance Mind', desc: 'Have active habits across 5 distinct categories', icon: '🎨', rarity: 'rare' },
  { id: 'level_10', name: 'Level 10 Adventurer', desc: 'Reach character Level 10', icon: '🎖️', rarity: 'rare' },
  { id: 'transcended', name: 'Transcended', desc: 'Prestige after hitting Level 50', icon: '🌌', rarity: 'legendary' }
];

const MOTIVATIONAL_QUOTES = [
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "Small disciplines repeated with consistency every day lead to great achievements.", author: "John C. Maxwell" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "First forget inspiration. Habit is more dependable than inspiration.", author: "Octavia Butler" },
  { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
  { text: "It is easier to prevent bad habits than to break them.", author: "Benjamin Franklin" },
  { text: "Chains of habit are too light to be felt until they are too heavy to be broken.", author: "Warren Buffett" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Consistency is what transforms average into excellence.", author: "Tony Robbins" }
];

const EMOJI_COLLECTION = [
  '💧', '🏃', '📚', '🧘', '😴', '💻', '🥗', '🏋️', '🚶', '🚴', '🏊', '🎨',
  '✍️', '🎸', '🧩', '🧠', '🎯', '🚀', '💡', '⏰', '🌿', '🍎', '🍵', '🧹',
  '💰', '🤝', '📞', '💬', '☀️', '🌙', '⭐', '🛡️', '⚔️', '🏆', '💎', '🔮'
];

const COLOR_PALETTE = [
  '#6C63FF', '#FF6584', '#43E97B', '#FFD166', '#00d2ff', '#9d50bb', '#FF9F43', '#10ac84'
];

// Helper: Formats Date object into YYYY-MM-DD in local time
function formatDateStr(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: Get ISO week number string (e.g. "2026-W43")
function getWeekYearString(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// --- GAMIFICATION ENGINE ---
class GamificationEngine {
  constructor(state, sound, particles) {
    this.state = state;
    this.sound = sound;
    this.particles = particles;
    this.comboTimer = null;
    this.COMBO_DURATION = 90; // seconds before combo drops
    this.comboSecondsLeft = 0;
  }

  // XP calculation by star difficulty (1-5 stars)
  getXpForStars(stars) {
    const table = { 1: 15, 2: 25, 3: 40, 4: 60, 5: 90 };
    return table[stars] || 25;
  }

  // RPG progressive XP requirement for a given level
  getXpRequiredForLevel(level) {
    return Math.round(90 * Math.pow(level, 1.45));
  }

  // Hero Title based on character level
  getHeroTitle(level, prestige) {
    if (prestige > 0) return `Cosmic Hero Tier ${prestige}`;
    if (level >= 50) return 'Ascended Legend';
    if (level >= 40) return 'Habit Demigod';
    if (level >= 30) return 'Grand Titan';
    if (level >= 20) return 'Master of Will';
    if (level >= 10) return 'Iron Warrior';
    if (level >= 5) return 'Apprentice Adept';
    return 'Novice Adventurer';
  }

  // Add XP with prestige multiplier and combo multiplier
  addXP(baseAmount) {
    const prestigeBonus = 1 + (this.state.prestige * 0.25);
    const comboBonus = this.state.comboMultiplier;
    const totalGained = Math.round(baseAmount * prestigeBonus * comboBonus);

    this.state.xp += totalGained;
    this.state.totalXpEarned += totalGained;

    // Check level ups
    let req = this.getXpRequiredForLevel(this.state.level);
    let leveledUp = false;

    while (this.state.xp >= req && this.state.level < 50) {
      this.state.xp -= req;
      this.state.level += 1;
      leveledUp = true;
      req = this.getXpRequiredForLevel(this.state.level);
    }

    if (leveledUp) {
      this.sound.playLevelUp();
      this.particles.fullscreenCelebration();
      window.app.showLevelUpModal(this.state.level);
    }

    return totalGained;
  }

  // Increment back-to-back combo
  triggerComboHit() {
    if (this.state.comboMultiplier < 1.5) {
      this.state.comboMultiplier = 1.5;
    } else if (this.state.comboMultiplier < 2.0) {
      this.state.comboMultiplier = 2.0;
    } else {
      this.state.comboMultiplier = 3.0; // Max combo
      this.checkBadgeUnlock('combo_king');
    }

    this.sound.playCombo(this.state.comboMultiplier);
    this.resetComboTimer();
  }

  resetComboTimer() {
    if (this.comboTimer) clearInterval(this.comboTimer);
    this.comboSecondsLeft = this.COMBO_DURATION;

    const timerBar = document.getElementById('comboTimerBar');
    const pill = document.getElementById('comboPill');
    const text = document.getElementById('comboMultiplierText');

    if (pill) pill.classList.add('active');
    if (text) text.textContent = `${this.state.comboMultiplier.toFixed(1)}x`;

    this.comboTimer = setInterval(() => {
      this.comboSecondsLeft--;
      if (timerBar) {
        const pct = (this.comboSecondsLeft / this.COMBO_DURATION) * 100;
        timerBar.style.width = `${pct}%`;
      }
      if (this.comboSecondsLeft <= 0) {
        clearInterval(this.comboTimer);
        this.state.comboMultiplier = 1.0;
        if (pill) pill.classList.remove('active');
        if (text) text.textContent = '1.0x';
        if (timerBar) timerBar.style.width = '0%';
      }
    }, 1000);
  }

  // Calculate Hero Streak (consecutive days where 100% of scheduled habits were done)
  calculateHeroStreak() {
    let streak = 0;
    const now = new Date();
    const todayStr = formatDateStr(now);

    // Check if today is already 100% completed
    const todayScheduled = this.state.habits.filter(h => this.isHabitScheduledForDate(h, todayStr));
    const todayDone = todayScheduled.length > 0 && todayScheduled.every(h => !!h.history[todayStr]);

    if (todayDone) {
      streak = 1;
    }

    // Check previous days backwards
    let checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - 1);

    while (true) {
      const dateStr = formatDateStr(checkDate);
      const scheduled = this.state.habits.filter(h => this.isHabitScheduledForDate(h, dateStr));
      if (scheduled.length === 0) break; // No habits configured that day

      const allDone = scheduled.every(h => !!h.history[dateStr]);
      if (allDone) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    this.state.heroStreak = streak;
    if (streak > this.state.bestHeroStreak) {
      this.state.bestHeroStreak = streak;
    }

    // Check streak-related badges
    if (streak >= 7) this.checkBadgeUnlock('flawless_week');
    if (todayDone) this.checkBadgeUnlock('perfectionist');
    if (streak >= 3) this.checkBadgeUnlock('triple_perfect');

    return streak;
  }

  // Check if habit is scheduled for a given day
  isHabitScheduledForDate(habit, dateStr) {
    if (!habit.frequency || habit.frequency === 'daily') return true;
    const d = new Date(dateStr + 'T12:00:00');
    const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
    if (habit.frequency === 'weekdays') {
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    }
    if (habit.frequency === 'weekends') {
      return dayOfWeek === 0 || dayOfWeek === 6;
    }
    return true;
  }

  // Calculate single habit streak & personal best
  calculateHabitStreak(habit) {
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    const todayStr = formatDateStr();
    const isTodayDone = !!habit.history[todayStr];

    if (isTodayDone) {
      currentStreak = 1;
    }

    // Count backwards from yesterday
    let check = new Date();
    check.setDate(check.getDate() - 1);

    while (true) {
      const dStr = formatDateStr(check);
      if (habit.history[dStr]) {
        currentStreak++;
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate all-time maximum streak
    const dates = Object.keys(habit.history).filter(k => habit.history[k]).sort();
    let prev = null;
    for (const d of dates) {
      if (!prev) {
        tempStreak = 1;
      } else {
        const diff = (new Date(d) - new Date(prev)) / (1000 * 60 * 60 * 24);
        if (Math.round(diff) === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > maxStreak) maxStreak = tempStreak;
      prev = d;
    }

    habit.currentStreak = currentStreak;
    habit.bestStreak = Math.max(maxStreak, currentStreak);

    // Check single habit streak badges
    if (currentStreak >= 7) this.checkBadgeUnlock('on_fire');
    if (currentStreak >= 14) this.checkBadgeUnlock('unstoppable');
    if (currentStreak >= 30) this.checkBadgeUnlock('legendary_streak');
    if (currentStreak >= 60) this.checkBadgeUnlock('titan_will');

    return currentStreak;
  }

  // Virtual Pet companion state (Egg -> Baby -> Teen -> Adult)
  getPetStage() {
    const streak = this.state.heroStreak;
    if (streak === 0) {
      return { stage: 'egg', name: 'Mystic Egg', emoji: '🥚', class: 'pet-egg', speech: 'The egg hums with mysterious magic. Complete habits to hatch it!' };
    }
    if (streak <= 6) {
      return { stage: 'baby', name: 'Hatchling Aero', emoji: '🐣', class: 'pet-baby', speech: 'Aero chirps happily and flaps tiny wings! Keep building habits!' };
    }
    if (streak <= 13) {
      return { stage: 'teen', name: 'Juvenile Drake', emoji: '🦎', class: 'pet-teen', speech: 'Aero breathes small colorful flames! Our power is growing!' };
    }
    // 14+ days streak: Adult
    this.checkBadgeUnlock('dragon_tamer');
    return { stage: 'adult', name: 'Elder Astral Dragon', emoji: '🐉', class: 'pet-adult', speech: 'Aero radiates a majestic cosmic aura! You have achieved true discipline!' };
  }

  // Weekly Boss System
  checkAndInitializeWeeklyBoss() {
    const currentWeekStr = getWeekYearString();
    if (!this.state.boss || this.state.boss.weekId !== currentWeekStr) {
      const activeCount = Math.max(3, this.state.habits.length);
      const totalHp = activeCount * 7;
      
      const bosses = [
        { name: 'Ignis the Sloth Dragon', lore: 'A colossal dragon forged from procrastination and excuses. Strike it down through daily action!', art: '🐉' },
        { name: 'Chronos the Time Thief', lore: 'A shadowy wraith that feeds on wasted hours. Defeat it by honoring your rituals!', art: '⏳' },
        { name: 'Gorgon of Distraction', lore: 'A mesmerizing beast that lures warriors off their path. Stay focused to destroy it!', art: '🐍' },
        { name: 'Titan of Inertia', lore: 'An ancient golem that resists movement. Chip away its stone armor with daily discipline!', art: '🗿' }
      ];

      // Deterministic selection based on week number
      const weekNum = parseInt(currentWeekStr.split('-W')[1] || '1', 10);
      const chosen = bosses[weekNum % bosses.length];

      this.state.boss = {
        weekId: currentWeekStr,
        name: chosen.name,
        lore: chosen.lore,
        art: chosen.art,
        maxHp: totalHp,
        currentHp: totalHp,
        isDefeated: false
      };
    }
  }

  damageBoss(amount = 1) {
    if (!this.state.boss || this.state.boss.isDefeated) return;

    this.state.boss.currentHp = Math.max(0, this.state.boss.currentHp - amount);
    this.sound.playBossHit();

    // Trigger visual hit shake on boss avatar
    const bossArt = document.getElementById('bossMonsterArt');
    if (bossArt) {
      bossArt.classList.add('hit-shake');
      setTimeout(() => bossArt.classList.remove('hit-shake'), 400);
    }

    // Spawn floating damage text
    const floaterCont = document.getElementById('bossCombatFloaterContainer');
    if (floaterCont) {
      const el = document.createElement('div');
      el.className = 'boss-combat-floater';
      el.textContent = `-${amount} HP!`;
      floaterCont.appendChild(el);
      setTimeout(() => el.remove(), 1000);
    }

    if (this.state.boss.currentHp <= 0 && !this.state.boss.isDefeated) {
      this.state.boss.isDefeated = true;
      this.state.bossesDefeatedCount = (this.state.bossesDefeatedCount || 0) + 1;
      this.sound.playBossDefeat();
      this.particles.fullscreenCelebration();
      this.addXP(500); // 500 bonus XP for slaying boss!
      this.checkBadgeUnlock('boss_slayer');
      if (this.state.bossesDefeatedCount >= 3) {
        this.checkBadgeUnlock('boss_dominator');
      }
      window.app.showBossDefeatedModal();
    }
  }

  // Daily Challenge System
  checkAndInitializeDailyChallenge() {
    const todayStr = formatDateStr();
    if (!this.state.dailyChallenge || this.state.dailyChallenge.dateStr !== todayStr) {
      const challenges = [
        { id: 'c1', title: 'Speed Demon', desc: 'Complete 2 habits before 12:00 PM today', goal: 2, xp: 100 },
        { id: 'c2', title: 'Heavy Lifter', desc: 'Complete a 4 or 5-star difficulty habit today', goal: 1, xp: 120 },
        { id: 'c3', title: 'Triple Threat', desc: 'Complete at least 3 habits today', goal: 3, xp: 100 },
        { id: 'c4', title: 'Mind & Body', desc: 'Complete at least 1 Health and 1 Fitness habit today', goal: 2, xp: 110 },
        { id: 'c5', title: 'Perfection Quest', desc: 'Complete all scheduled habits today', goal: this.state.habits.length, xp: 150 }
      ];

      // Deterministic pseudo-random based on date string
      let seed = 0;
      for (let i = 0; i < todayStr.length; i++) seed += todayStr.charCodeAt(i);
      const picked = challenges[seed % challenges.length];

      this.state.dailyChallenge = {
        dateStr: todayStr,
        title: picked.title,
        desc: picked.desc,
        goal: Math.max(1, Math.min(picked.goal, this.state.habits.length)),
        progress: 0,
        xp: picked.xp,
        isCompleted: false
      };
    }
  }

  evaluateDailyChallenge() {
    if (!this.state.dailyChallenge || this.state.dailyChallenge.isCompleted) return;

    const todayStr = formatDateStr();
    const todayHabits = this.state.habits.filter(h => !!h.history[todayStr]);
    const progress = todayHabits.length;
    this.state.dailyChallenge.progress = Math.min(this.state.dailyChallenge.goal, progress);

    if (this.state.dailyChallenge.progress >= this.state.dailyChallenge.goal) {
      this.state.dailyChallenge.isCompleted = true;
      this.sound.playBadgeUnlock();
      this.particles.burst(window.innerWidth / 2, window.innerHeight / 2, 40);
      this.addXP(this.state.dailyChallenge.xp);
      window.app.showSnackbar(`Daily Quest Completed! (+${this.state.dailyChallenge.xp} XP)`);
    }
  }

  // Check and unlock achievement badges
  checkBadgeUnlock(badgeId) {
    if (this.state.unlockedBadges[badgeId]) return;

    this.state.unlockedBadges[badgeId] = new Date().toISOString();
    this.sound.playBadgeUnlock();
    this.particles.fullscreenCelebration();

    const spec = BADGES_SPEC.find(b => b.id === badgeId);
    if (spec) {
      window.app.showSnackbar(`🏆 Trophy Unlocked: "${spec.name}"!`);
    }
  }

  checkAllBadges() {
    const totalCompletions = this.state.habits.reduce((acc, h) => {
      return acc + Object.keys(h.history).filter(k => h.history[k]).length;
    }, 0);

    if (totalCompletions >= 1) this.checkBadgeUnlock('first_step');
    if (totalCompletions >= 5) this.checkBadgeUnlock('high_five');
    if (totalCompletions >= 100) this.checkBadgeUnlock('century');
    if (totalCompletions >= 500) this.checkBadgeUnlock('grandmaster');

    if (this.state.level >= 10) this.checkBadgeUnlock('level_10');

    // Check categories count
    const uniqueCats = new Set(this.state.habits.map(h => h.category));
    if (uniqueCats.size >= 5) this.checkBadgeUnlock('polymath');

    // Time-based check
    const currentHour = new Date().getHours();
    if (currentHour < 8) this.checkBadgeUnlock('early_bird');
    if (currentHour >= 22) this.checkBadgeUnlock('night_owl');
  }
}

// --- CANVAS CHARTS ENGINE ---
class CanvasCharts {
  constructor() {
    this.dpr = window.devicePixelRatio || 1;
  }

  // Pure Canvas 7-Day Performance Bar Chart
  renderWeeklyChart(canvasId, habits) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get true bounding size
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 400;
    const height = 240;

    canvas.width = width * this.dpr;
    canvas.height = height * this.dpr;
    ctx.resetTransform();
    ctx.scale(this.dpr, this.dpr);

    // Calculate completions for the past 7 days (today is rightmost)
    const daysData = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = formatDateStr(d);
      const count = habits.filter(h => !!h.history[dStr]).length;
      daysData.push({
        label: i === 0 ? 'Today' : dayNames[d.getDay()],
        date: dStr,
        count
      });
    }

    const maxCount = Math.max(5, ...daysData.map(d => d.count));
    const padding = { top: 30, right: 20, bottom: 40, left: 35 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Draw Subtle Background Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    const gridRows = 4;
    for (let i = 0; i <= gridRows; i++) {
      const y = padding.top + (chartH / gridRows) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Axis labels
      const val = Math.round(maxCount - (maxCount / gridRows) * i);
      ctx.fillStyle = '#686E8F';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(val.toString(), padding.left - 8, y + 3);
    }

    // Draw Bars
    const barWidth = Math.min(36, (chartW / 7) * 0.6);
    const colStep = chartW / 7;

    daysData.forEach((item, index) => {
      const x = padding.left + colStep * index + (colStep - barWidth) / 2;
      const barH = (item.count / maxCount) * chartH;
      const y = padding.top + chartH - barH;

      // Gradient Fill
      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      if (item.count > 0) {
        grad.addColorStop(0, '#6C63FF');
        grad.addColorStop(1, '#43E97B');
      } else {
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.03)');
      }

      // Rounded Top Bar
      const radius = 6;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x, y + barH);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, y + barH);
      ctx.closePath();
      ctx.fill();

      // Value label on top of bar
      if (item.count > 0) {
        ctx.fillStyle = '#F0F2FD';
        ctx.font = 'bold 11px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.count.toString(), x + barWidth / 2, y - 6);
      }

      // X Axis Day Label
      ctx.fillStyle = item.label === 'Today' ? '#43E97B' : '#9DA3C2';
      ctx.font = item.label === 'Today' ? 'bold 11px Outfit, sans-serif' : '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, x + barWidth / 2, height - padding.bottom + 20);
    });
  }

  // Pure Canvas Category Donut Chart
  renderCategoryDonut(canvasId, legendId, habits) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 360;
    const height = 240;

    canvas.width = width * this.dpr;
    canvas.height = height * this.dpr;
    ctx.resetTransform();
    ctx.scale(this.dpr, this.dpr);

    // Group habits by category
    const categoryCounts = {};
    habits.forEach(h => {
      const cat = h.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const categories = Object.keys(categoryCounts);
    const total = habits.length;

    const catColors = {
      Health: '#38ef7d',
      Fitness: '#FF6584',
      Learning: '#6C63FF',
      Mindfulness: '#00d2ff',
      Productivity: '#FF9F43',
      Creative: '#9d50bb',
      Social: '#FFD166',
      Other: '#A0A5C2'
    };

    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(centerX, centerY) - 20;
    const innerRadius = outerRadius * 0.62;

    if (total === 0) {
      // Empty placeholder ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = outerRadius - innerRadius;
      ctx.beginPath();
      ctx.arc(centerX, centerY, (outerRadius + innerRadius) / 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#686E8F';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No habits yet', centerX, centerY + 4);
      return;
    }

    // Draw Donut Slices
    let startAngle = -Math.PI / 2;
    categories.forEach(cat => {
      const count = categoryCounts[cat];
      const sliceAngle = (count / total) * (Math.PI * 2);
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = catColors[cat] || '#6C63FF';
      ctx.fill();
      ctx.strokeStyle = '#0F0F1A';
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle = endAngle;
    });

    // Center Text
    ctx.fillStyle = '#F0F2FD';
    ctx.font = 'bold 24px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(total.toString(), centerX, centerY + 2);

    ctx.fillStyle = '#9DA3C2';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('HABITS', centerX, centerY + 16);

    // Update HTML Legend
    const legendEl = document.getElementById(legendId);
    if (legendEl) {
      legendEl.innerHTML = categories.map(cat => {
        const count = categoryCounts[cat];
        const pct = Math.round((count / total) * 100);
        const color = catColors[cat] || '#6C63FF';
        return `
          <div class="donut-legend-item">
            <span class="donut-legend-color" style="background:${color}"></span>
            <span>${cat} (<strong>${count}</strong> • ${pct}%)</span>
          </div>
        `;
      }).join('');
    }
  }

  // 12-Week GitHub Style Heatmap Grid
  renderHeatmap(matrixId, monthsId, habits) {
    const matrixEl = document.getElementById(matrixId);
    const monthsEl = document.getElementById(monthsId);
    if (!matrixEl) return;

    matrixEl.innerHTML = '';
    if (monthsEl) monthsEl.innerHTML = '';

    const today = new Date();
    const daysToShow = 84; // 12 weeks = 84 days
    const startDate = new Date();
    startDate.setDate(today.getDate() - (daysToShow - 1));

    // Align start date to previous Monday
    const dayOfWeek = startDate.getDay(); // 0 is Sun, 1 is Mon
    const diffToMon = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    startDate.setDate(startDate.getDate() + diffToMon);

    const cellsData = [];
    const curr = new Date(startDate);
    const monthLabelsMap = {};

    let colIndex = 0;
    while (curr <= today || cellsData.length % 7 !== 0) {
      const dStr = formatDateStr(curr);
      const dayHabits = habits.filter(h => window.app.engine.isHabitScheduledForDate(h, dStr));
      const doneHabits = dayHabits.filter(h => !!h.history[dStr]);
      const totalCount = dayHabits.length;
      const doneCount = doneHabits.length;

      let level = 0;
      if (totalCount > 0 && doneCount > 0) {
        const ratio = doneCount / totalCount;
        if (ratio === 1) level = 4;
        else if (ratio >= 0.75) level = 3;
        else if (ratio >= 0.5) level = 2;
        else level = 1;
      }

      // Check month header
      if (curr.getDate() === 1 || cellsData.length === 0) {
        const mName = curr.toLocaleString('default', { month: 'short' });
        const col = Math.floor(cellsData.length / 7);
        if (!monthLabelsMap[mName]) {
          monthLabelsMap[mName] = col;
        }
      }

      cellsData.push({
        date: dStr,
        doneCount,
        totalCount,
        level,
        isFuture: curr > today
      });

      curr.setDate(curr.getDate() + 1);
    }

    // Render cells in matrix
    cellsData.forEach(cell => {
      const cellDiv = document.createElement('div');
      cellDiv.className = `heatmap-cell level-${cell.level}`;
      if (cell.isFuture) {
        cellDiv.style.visibility = 'hidden';
      }

      // Tooltip interaction
      cellDiv.addEventListener('mouseenter', (e) => {
        const pct = cell.totalCount > 0 ? Math.round((cell.doneCount / cell.totalCount) * 100) : 0;
        const msg = `${cell.date}: ${cell.doneCount}/${cell.totalCount} completed (${pct}%)`;
        window.app.showAppTooltip(msg, e.clientX, e.clientY);
      });

      cellDiv.addEventListener('mouseleave', () => {
        window.app.hideAppTooltip();
      });

      matrixEl.appendChild(cellDiv);
    });

    // Render Month labels
    if (monthsEl) {
      const sortedMonths = Object.keys(monthLabelsMap);
      monthsEl.innerHTML = sortedMonths.map(m => {
        return `<span style="width:50px">${m}</span>`;
      }).join('');
    }
  }
}

// --- MAIN APPLICATION CONTROLLER ---
class HabitHeroApp {
  constructor() {
    this.sound = new SoundFX();
    this.particles = new ParticleFX('confettiCanvas');
    this.charts = new CanvasCharts();
    this.currentView = 'dashboard';
    this.todayFilter = 'all';
    this.categoryFilter = 'all';
    this.searchQuery = '';
    this.sortMethod = 'created';
    this.badgeFilter = 'all';
    this.undoSnapshot = null;
    this.undoTimeout = null;

    this.loadState();
    this.engine = new GamificationEngine(this.state, this.sound, this.particles);
    this.engine.checkAndInitializeWeeklyBoss();
    this.engine.checkAndInitializeDailyChallenge();
    this.engine.calculateHeroStreak();
    this.habits.forEach(h => this.engine.calculateHabitStreak(h));
    this.engine.checkAllBadges();
  }

  // Load from LocalStorage or initialize defaults
  loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.state = JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error loading storage, resetting to default', e);
    }

    if (!this.state) {
      this.state = {
        level: 1,
        xp: 0,
        totalXpEarned: 0,
        prestige: 0,
        heroStreak: 0,
        bestHeroStreak: 0,
        comboMultiplier: 1.0,
        habits: JSON.parse(JSON.stringify(DEFAULT_HABITS)),
        unlockedBadges: {},
        boss: null,
        bossesDefeatedCount: 0,
        dailyChallenge: null,
        soundEnabled: true,
        darkTheme: true
      };
    }

    // Safety checks for fields
    if (!this.state.habits) this.state.habits = JSON.parse(JSON.stringify(DEFAULT_HABITS));
    if (!this.state.unlockedBadges) this.state.unlockedBadges = {};
    if (this.state.prestige === undefined) this.state.prestige = 0;
    if (this.state.soundEnabled === undefined) this.state.soundEnabled = true;
    if (this.state.darkTheme === undefined) this.state.darkTheme = true;
    
    this.sound.enabled = this.state.soundEnabled;
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  get habits() {
    return this.state.habits;
  }

  init() {
    this.setupTheme();
    this.setupNavigation();
    this.setupQuoteTicker();
    this.setupFormPickers();
    this.renderAllViews();
    this.startBossTimerCountdown();
    this.checkPendingNotificationReminders();
  }

  // ==================== VIEW NAVIGATION ====================
  setupNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetView = tab.getAttribute('data-view');
        this.switchView(targetView);
      });
    });

    // Header buttons
    const soundBtn = document.getElementById('soundToggleBtn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => this.toggleSound());
    }

    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    const refreshQuoteBtn = document.getElementById('refreshQuoteBtn');
    if (refreshQuoteBtn) {
      refreshQuoteBtn.addEventListener('click', () => this.cycleQuote());
    }
  }

  switchView(viewName) {
    this.currentView = viewName;
    this.sound.playClick();

    // Toggle active tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-view') === viewName);
    });

    // Toggle view containers
    document.querySelectorAll('.app-view').forEach(view => {
      view.classList.toggle('active', view.id === `view-${viewName}`);
    });

    // Re-render view specific charts
    if (viewName === 'stats') {
      setTimeout(() => {
        this.charts.renderWeeklyChart('weeklyChartCanvas', this.habits);
        this.charts.renderCategoryDonut('categoryChartCanvas', 'donutLegend', this.habits);
        this.charts.renderHeatmap('heatmapDaysMatrix', 'heatmapMonthsRow', this.habits);
      }, 50);
    } else if (viewName === 'achievements') {
      this.renderBadgesGrid();
      this.renderBossArena();
    }
  }

  // ==================== RENDERING LOGIC ====================
  renderAllViews() {
    this.renderHeaderAndHero();
    this.renderTodayHabits();
    this.renderAllHabitsList();
    this.renderStatsView();
    this.renderBossArena();
    this.renderBadgesGrid();
    this.renderSettingsView();
  }

  // Header, Hero Banner & Quick Stats
  renderHeaderAndHero() {
    // Level & XP
    const levelEl = document.getElementById('heroLevelNum');
    const xpCurrentEl = document.getElementById('xpCurrentNum');
    const xpTargetEl = document.getElementById('xpTargetNum');
    const xpBarFill = document.getElementById('xpBarFill');
    const xpPercentText = document.getElementById('xpPercentText');
    const heroTitleBadge = document.getElementById('heroTitleBadge');
    const heroPrestigeStar = document.getElementById('heroPrestigeStar');
    const heroPrestigeTierText = document.getElementById('heroPrestigeTierText');

    const reqXp = this.engine.getXpRequiredForLevel(this.state.level);
    const xpPct = Math.min(100, Math.round((this.state.xp / reqXp) * 100));

    if (levelEl) levelEl.textContent = this.state.level;
    if (xpCurrentEl) xpCurrentEl.textContent = this.state.xp;
    if (xpTargetEl) xpTargetEl.textContent = reqXp;
    if (xpBarFill) xpBarFill.style.width = `${xpPct}%`;
    if (xpPercentText) xpPercentText.textContent = `${xpPct}%`;
    if (heroTitleBadge) heroTitleBadge.textContent = this.engine.getHeroTitle(this.state.level, this.state.prestige);

    if (heroPrestigeStar) {
      if (this.state.prestige > 0) {
        heroPrestigeStar.style.display = 'flex';
        heroPrestigeStar.textContent = `★${this.state.prestige}`;
      } else {
        heroPrestigeStar.style.display = 'none';
      }
    }
    if (heroPrestigeTierText) {
      heroPrestigeTierText.textContent = `Prestige Tier ${this.state.prestige}`;
    }

    // Dashboard Quick Metrics
    const heroStreakEl = document.getElementById('heroStreakNum');
    if (heroStreakEl) heroStreakEl.textContent = this.state.heroStreak;

    const todayStr = formatDateStr();
    const todaySched = this.habits.filter(h => this.engine.isHabitScheduledForDate(h, todayStr));
    const todayDone = todaySched.filter(h => !!h.history[todayStr]).length;

    const todayDoneEl = document.getElementById('todayDoneNum');
    const todayTotalEl = document.getElementById('todayTotalNum');
    if (todayDoneEl) todayDoneEl.textContent = todayDone;
    if (todayTotalEl) todayTotalEl.textContent = todaySched.length;

    const totalDoneAllTime = this.habits.reduce((acc, h) => {
      return acc + Object.keys(h.history).filter(k => h.history[k]).length;
    }, 0);
    const totalDoneAllTimeEl = document.getElementById('totalDoneAllTime');
    if (totalDoneAllTimeEl) totalDoneAllTimeEl.textContent = totalDoneAllTime;

    // Pet Companion Aero
    const petInfo = this.engine.getPetStage();
    const petBadge = document.getElementById('petStageBadge');
    const petVisual = document.getElementById('petVisual');
    const petSpeech = document.getElementById('petDialogueBubble');

    if (petBadge) {
      petBadge.textContent = petInfo.name;
      petBadge.className = `pet-stage-badge ${petInfo.stage}`;
    }
    if (petVisual) {
      petVisual.textContent = petInfo.emoji;
      petVisual.className = petInfo.class;
    }
    if (petSpeech) {
      petSpeech.textContent = `"${petInfo.speech}"`;
    }

    // Daily Challenge
    const ch = this.state.dailyChallenge;
    if (ch) {
      const chTitle = document.getElementById('challengeTitle');
      const chDesc = document.getElementById('challengeDesc');
      const chFill = document.getElementById('challengeProgressFill');
      const chText = document.getElementById('challengeProgressText');
      const chStatus = document.getElementById('challengeStatusBadge');
      const chReward = document.getElementById('challengeRewardBadge');

      if (chTitle) chTitle.textContent = ch.title;
      if (chDesc) chDesc.textContent = ch.desc;
      if (chReward) chReward.innerHTML = `<i class="fa-solid fa-star"></i> +${ch.xp} XP`;
      
      const chPct = Math.min(100, Math.round((ch.progress / ch.goal) * 100));
      if (chFill) chFill.style.width = `${chPct}%`;
      if (chText) chText.textContent = `${ch.progress} / ${ch.goal}`;

      if (chStatus) {
        if (ch.isCompleted) {
          chStatus.textContent = 'Completed!';
          chStatus.style.color = 'var(--accent-green)';
        } else {
          chStatus.textContent = 'In Progress';
          chStatus.style.color = 'var(--accent-orange)';
        }
      }
    }

    // Boss HP Metric Card
    const bossHpEl = document.getElementById('dashBossHpPercent');
    if (bossHpEl && this.state.boss) {
      const pct = Math.round((this.state.boss.currentHp / this.state.boss.maxHp) * 100);
      bossHpEl.textContent = pct;
    }

    // Date Label on Today's Habits
    const todayLabel = document.getElementById('todayDateLabel');
    if (todayLabel) {
      const opts = { weekday: 'long', month: 'short', day: 'numeric' };
      todayLabel.textContent = `• ${new Date().toLocaleDateString(undefined, opts)}`;
    }
  }

  // Render Today's Habits Grid with Filter (All, To Do, Done)
  renderTodayHabits() {
    const grid = document.getElementById('todayHabitsGrid');
    if (!grid) return;

    const todayStr = formatDateStr();
    let scheduled = this.habits.filter(h => this.engine.isHabitScheduledForDate(h, todayStr));

    if (this.todayFilter === 'todo') {
      scheduled = scheduled.filter(h => !h.history[todayStr]);
    } else if (this.todayFilter === 'completed') {
      scheduled = scheduled.filter(h => !!h.history[todayStr]);
    }

    if (scheduled.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1">
          <div class="empty-state-icon">🎉</div>
          <h4>No habits here!</h4>
          <p>${this.todayFilter === 'completed' ? 'Finish some habits today to see them here!' : 'All caught up for today!'}</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = scheduled.map(habit => {
      const isDone = !!habit.history[todayStr];
      const xpVal = this.engine.getXpForStars(habit.difficulty);
      const starsStr = '★'.repeat(habit.difficulty) + '☆'.repeat(5 - habit.difficulty);

      return `
        <div class="glass-card habit-card ${isDone ? 'completed' : ''}" style="--habit-color: ${habit.color || 'var(--primary)'}">
          <div class="habit-card-top">
            <div class="habit-icon-and-title">
              <div class="habit-icon-box">
                ${habit.icon}
              </div>
              <div class="habit-info-text">
                <div class="habit-title-row">
                  <span class="habit-name">${this.escapeHTML(habit.name)}</span>
                  <span class="habit-category-pill" style="border: 1px solid ${habit.color || 'var(--primary)'}40">${habit.category}</span>
                </div>
                <div class="habit-meta-row">
                  <span class="habit-difficulty-stars" title="${habit.difficulty} Stars">${starsStr}</span>
                  <span class="habit-streak-pill" title="Current streak">
                    <span class="streak-flame">🔥</span> ${habit.currentStreak || 0}
                  </span>
                </div>
              </div>
            </div>
            <button class="habit-detail-btn" onclick="window.app.openDetailPanel('${habit.id}')" title="View Habit Details">
              <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>
          </div>

          <div class="habit-card-bottom">
            <span class="habit-xp-pill">+${xpVal} XP</span>
            <div class="habit-actions-group">
              <button 
                class="habit-check-btn ${isDone ? 'checked' : ''}" 
                onclick="window.app.toggleHabitCompletion('${habit.id}', event)"
                title="${isDone ? 'Mark as incomplete' : 'Mark as complete'}"
              >
                <i class="fa-solid fa-check"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Filter Today Tab
  setTodayFilter(filter) {
    this.todayFilter = filter;
    document.querySelectorAll('.filter-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
    });
    this.renderTodayHabits();
  }

  // Render All Habits in Habits Management View
  renderAllHabitsList() {
    const grid = document.getElementById('allHabitsGrid');
    if (!grid) return;

    let list = [...this.habits];

    // Filter by Category
    if (this.categoryFilter !== 'all') {
      list = list.filter(h => h.category === this.categoryFilter);
    }

    // Filter by Search Query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(h => h.name.toLowerCase().includes(q) || h.category.toLowerCase().includes(q));
    }

    // Sort
    if (this.sortMethod === 'streak') {
      list.sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0));
    } else if (this.sortMethod === 'xp') {
      list.sort((a, b) => this.engine.getXpForStars(b.difficulty) - this.engine.getXpForStars(a.difficulty));
    } else if (this.sortMethod === 'difficulty') {
      list.sort((a, b) => b.difficulty - a.difficulty);
    } else if (this.sortMethod === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1">
          <div class="empty-state-icon">📋</div>
          <h4>No matching habits found</h4>
          <p>Create a new habit or adjust your search filters!</p>
        </div>
      `;
      return;
    }

    const todayStr = formatDateStr();

    grid.innerHTML = list.map(habit => {
      const isDone = !!habit.history[todayStr];
      const xpVal = this.engine.getXpForStars(habit.difficulty);
      const starsStr = '★'.repeat(habit.difficulty) + '☆'.repeat(5 - habit.difficulty);

      return `
        <div class="glass-card habit-card ${isDone ? 'completed' : ''}" style="--habit-color: ${habit.color || 'var(--primary)'}">
          <div class="habit-card-top">
            <div class="habit-icon-and-title">
              <div class="habit-icon-box">
                ${habit.icon}
              </div>
              <div class="habit-info-text">
                <div class="habit-title-row">
                  <span class="habit-name">${this.escapeHTML(habit.name)}</span>
                  <span class="habit-category-pill" style="border: 1px solid ${habit.color || 'var(--primary)'}40">${habit.category}</span>
                </div>
                <div class="habit-meta-row">
                  <span class="habit-difficulty-stars">${starsStr}</span>
                  <span class="habit-streak-pill">
                    <span class="streak-flame">🔥</span> ${habit.currentStreak || 0}
                  </span>
                  <span style="font-size:11px; text-transform:capitalize">• ${habit.frequency || 'daily'}</span>
                </div>
              </div>
            </div>
            <button class="habit-detail-btn" onclick="window.app.openDetailPanel('${habit.id}')" title="Details">
              <i class="fa-solid fa-chart-simple"></i>
            </button>
          </div>

          <div class="habit-card-bottom">
            <span class="habit-xp-pill">+${xpVal} XP</span>
            <div class="habit-actions-group">
              <button 
                class="habit-check-btn ${isDone ? 'checked' : ''}" 
                onclick="window.app.toggleHabitCompletion('${habit.id}', event)"
                title="${isDone ? 'Mark as incomplete' : 'Mark as complete'}"
              >
                <i class="fa-solid fa-check"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  handleHabitSearch(q) {
    this.searchQuery = q;
    this.renderAllHabitsList();
  }

  handleHabitSort(method) {
    this.sortMethod = method;
    this.renderAllHabitsList();
  }

  filterHabitsByCategory(cat) {
    this.categoryFilter = cat;
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-cat') === cat);
    });
    this.renderAllHabitsList();
  }

  // ==================== HABIT ACTIONS & UNDO ====================
  toggleHabitCompletion(habitId, evt) {
    if (evt) evt.stopPropagation();

    const habit = this.habits.find(h => h.id === habitId);
    if (!habit) return;

    // Save snapshot for 5-second undo
    this.createUndoSnapshot(`Toggle "${habit.name}"`);

    const todayStr = formatDateStr();
    const currentlyDone = !!habit.history[todayStr];
    const xpVal = this.engine.getXpForStars(habit.difficulty);

    if (!currentlyDone) {
      // Mark Complete
      habit.history[todayStr] = true;
      this.sound.playComplete();
      
      // Confetti burst from click position
      let clickX = window.innerWidth / 2;
      let clickY = window.innerHeight / 2;
      if (evt && evt.clientX && evt.clientY) {
        clickX = evt.clientX;
        clickY = evt.clientY;
      }
      this.particles.burst(clickX, clickY, 35);

      // Add XP & Trigger combo multiplier
      const gained = this.engine.addXP(xpVal);
      this.engine.triggerComboHit();
      this.particles.spawnFloatingText(`+${gained} XP`, clickX, clickY - 20, '#FFD166');

      // Damage weekly boss
      this.engine.damageBoss(habit.difficulty);

      // Evaluate daily challenge
      this.engine.evaluateDailyChallenge();

      this.showSnackbar(`Completed "${habit.name}" (+${gained} XP)`);
    } else {
      // Uncheck
      delete habit.history[todayStr];
      this.state.xp = Math.max(0, this.state.xp - xpVal);
      this.sound.playClick();
      this.showSnackbar(`Marked "${habit.name}" as pending`);
    }

    // Recalculate streaks & badges
    this.engine.calculateHabitStreak(habit);
    this.engine.calculateHeroStreak();
    this.engine.checkAllBadges();

    this.saveState();
    this.renderHeaderAndHero();
    this.renderTodayHabits();
    this.renderAllHabitsList();
    this.renderStatsView();
  }

  createUndoSnapshot(actionName) {
    this.undoSnapshot = JSON.parse(JSON.stringify(this.state));
    const snackbar = document.getElementById('undoSnackbar');
    const msg = document.getElementById('snackbarMessage');

    if (msg) msg.textContent = `${actionName}`;
    if (snackbar) snackbar.classList.add('active');

    if (this.undoTimeout) clearTimeout(this.undoTimeout);
    this.undoTimeout = setTimeout(() => {
      if (snackbar) snackbar.classList.remove('active');
      this.undoSnapshot = null;
    }, 5000);
  }

  executeUndo() {
    if (!this.undoSnapshot) return;
    this.sound.playUndo();
    this.state = JSON.parse(JSON.stringify(this.undoSnapshot));
    this.undoSnapshot = null;
    if (this.undoTimeout) clearTimeout(this.undoTimeout);

    const snackbar = document.getElementById('undoSnackbar');
    if (snackbar) snackbar.classList.remove('active');

    this.saveState();
    this.renderAllViews();
    this.showSnackbar('Action reverted!');
  }

  showSnackbar(text) {
    const snackbar = document.getElementById('undoSnackbar');
    const msg = document.getElementById('snackbarMessage');
    if (msg) msg.textContent = text;
    if (snackbar) snackbar.classList.add('active');

    setTimeout(() => {
      if (snackbar && !this.undoSnapshot) snackbar.classList.remove('active');
    }, 3500);
  }

  // ==================== STATS VIEW ====================
  renderStatsView() {
    // 4 Summary Metrics
    const totalCompletions = this.habits.reduce((acc, h) => {
      return acc + Object.keys(h.history).filter(k => h.history[k]).length;
    }, 0);

    const checkinsEl = document.getElementById('statTotalCheckins');
    if (checkinsEl) checkinsEl.textContent = totalCompletions;

    const bestStreakEl = document.getElementById('statBestStreak');
    if (bestStreakEl) bestStreakEl.textContent = this.state.bestHeroStreak || 0;

    // Calculate Completion Rate across the past 30 days
    let totalScheduled = 0;
    let totalDone = 0;
    let perfectDays = 0;

    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = formatDateStr(d);
      const scheduled = this.habits.filter(h => this.engine.isHabitScheduledForDate(h, dStr));
      const done = scheduled.filter(h => !!h.history[dStr]);

      totalScheduled += scheduled.length;
      totalDone += done.length;

      if (scheduled.length > 0 && done.length === scheduled.length) {
        perfectDays++;
      }
    }

    const rate = totalScheduled > 0 ? Math.round((totalDone / totalScheduled) * 100) : 0;
    const rateEl = document.getElementById('statCompletionRate');
    if (rateEl) rateEl.textContent = `${rate}%`;

    const perfEl = document.getElementById('statPerfectDays');
    if (perfEl) perfEl.textContent = perfectDays;

    if (this.currentView === 'stats') {
      this.charts.renderWeeklyChart('weeklyChartCanvas', this.habits);
      this.charts.renderCategoryDonut('categoryChartCanvas', 'donutLegend', this.habits);
      this.charts.renderHeatmap('heatmapDaysMatrix', 'heatmapMonthsRow', this.habits);
    }
  }

  // ==================== BOSS ARENA & BADGES ====================
  renderBossArena() {
    if (!this.state.boss) return;
    const boss = this.state.boss;

    const nameTitle = document.getElementById('bossNameTitle');
    const loreDesc = document.getElementById('bossLoreDesc');
    const monsterArt = document.getElementById('bossMonsterArt');
    const currentHp = document.getElementById('bossCurrentHp');
    const maxHp = document.getElementById('bossMaxHp');
    const hpFill = document.getElementById('bossHpFill');

    if (nameTitle) nameTitle.textContent = boss.name;
    if (loreDesc) loreDesc.textContent = boss.lore;
    if (monsterArt) monsterArt.textContent = boss.isDefeated ? '💀' : boss.art;
    if (currentHp) currentHp.textContent = boss.currentHp;
    if (maxHp) maxHp.textContent = boss.maxHp;

    if (hpFill) {
      const pct = Math.max(0, Math.min(100, (boss.currentHp / boss.maxHp) * 100));
      hpFill.style.width = `${pct}%`;
    }
  }

  startBossTimerCountdown() {
    const updateCountdown = () => {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 is Sunday
      const daysUntilSunday = (7 - dayOfWeek) % 7;
      
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() + daysUntilSunday);
      endOfWeek.setHours(23, 59, 59, 999);

      const diff = endOfWeek - now;
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);

      const el = document.getElementById('bossTimerCountdown');
      if (el) el.textContent = `${d}d ${h}h`;
    };
    updateCountdown();
    setInterval(updateCountdown, 60000);
  }

  renderBadgesGrid() {
    const grid = document.getElementById('badgesGrid');
    if (!grid) return;

    let badges = [...BADGES_SPEC];
    const unlockedMap = this.state.unlockedBadges || {};

    if (this.badgeFilter === 'unlocked') {
      badges = badges.filter(b => !!unlockedMap[b.id]);
    } else if (this.badgeFilter === 'locked') {
      badges = badges.filter(b => !unlockedMap[b.id]);
    }

    const unlockedCount = Object.keys(unlockedMap).length;
    const unlockedCountEl = document.getElementById('unlockedBadgesCount');
    const totalCountEl = document.getElementById('totalBadgesCount');
    if (unlockedCountEl) unlockedCountEl.textContent = unlockedCount;
    if (totalCountEl) totalCountEl.textContent = BADGES_SPEC.length;

    grid.innerHTML = badges.map(badge => {
      const isUnlocked = !!unlockedMap[badge.id];
      const dateUnlocked = isUnlocked ? new Date(unlockedMap[badge.id]).toLocaleDateString() : '';

      return `
        <div class="glass-card badge-card rarity-${badge.rarity} ${isUnlocked ? 'unlocked' : 'locked'}">
          <div class="badge-icon-box">
            ${isUnlocked ? badge.icon : '🔒'}
          </div>
          <div class="badge-info">
            <span class="badge-rarity-pill">${badge.rarity}</span>
            <div class="badge-name">${badge.name}</div>
            <div class="badge-desc">${badge.desc}</div>
            ${isUnlocked ? `<div class="badge-unlocked-at"><i class="fa-solid fa-check"></i> Unlocked ${dateUnlocked}</div>` : '<div style="font-size:10px; color:var(--text-muted)">Locked</div>'}
          </div>
        </div>
      `;
    }).join('');
  }

  filterBadges(filter) {
    this.badgeFilter = filter;
    document.querySelectorAll('.badge-tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-filter') === filter);
    });
    this.renderBadgesGrid();
  }

  // ==================== PET INTERACTION ====================
  interactPet() {
    this.sound.playBadgeUnlock();
    const petVisual = document.getElementById('petVisual');
    if (petVisual) {
      petVisual.style.transform = 'scale(1.25)';
      setTimeout(() => petVisual.style.transform = '', 300);
    }

    const quotes = [
      "Aero nuzzles against you with warm dragon embers!",
      "Aero does a happy backflip in mid-air!",
      "Aero purrs contentedly: 'Every small habit shapes our destiny!'",
      "Aero blows a tiny ring of rainbow smoke!",
      "Aero looks at you with admiration. Your discipline is inspiring!"
    ];

    const speech = quotes[Math.floor(Math.random() * quotes.length)];
    const bubble = document.getElementById('petDialogueBubble');
    if (bubble) bubble.textContent = `"${speech}"`;

    this.particles.burst(window.innerWidth / 2, window.innerHeight * 0.45, 20);
  }

  // ==================== HABIT CREATION / EDITING MODAL ====================
  setupFormPickers() {
    // Emoji Picker Grid
    const emojiContainer = document.getElementById('emojiPickerGrid');
    if (emojiContainer) {
      emojiContainer.innerHTML = EMOJI_COLLECTION.map((emoji, idx) => {
        return `
          <button type="button" class="emoji-choice-btn ${idx === 0 ? 'selected' : ''}" onclick="window.app.selectFormEmoji('${emoji}', this)">
            ${emoji}
          </button>
        `;
      }).join('');
    }

    // Color Swatches
    const colorContainer = document.getElementById('colorSwatchesRow');
    if (colorContainer) {
      colorContainer.innerHTML = COLOR_PALETTE.map((color, idx) => {
        return `
          <button type="button" class="color-swatch-btn ${idx === 0 ? 'selected' : ''}" style="background:${color}" onclick="window.app.selectFormColor('${color}', this)">
          </button>
        `;
      }).join('');
    }

    // Stars Picker
    const starBtns = document.querySelectorAll('.star-rate-btn');
    starBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const rating = parseInt(btn.getAttribute('data-star'), 10);
        this.setFormDifficulty(rating);
      });
    });

    // Frequency Buttons
    const freqBtns = document.querySelectorAll('.freq-btn');
    freqBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        freqBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  selectFormEmoji(emoji, btn) {
    document.querySelectorAll('.emoji-choice-btn').forEach(b => b.classList.remove('selected'));
    if (btn) btn.classList.add('selected');
    this.selectedEmoji = emoji;
  }

  selectFormColor(color, btn) {
    document.querySelectorAll('.color-swatch-btn').forEach(b => b.classList.remove('selected'));
    if (btn) btn.classList.add('selected');
    this.selectedColor = color;
  }

  setFormDifficulty(rating) {
    this.selectedDifficulty = rating;
    document.querySelectorAll('.star-rate-btn').forEach(btn => {
      const star = parseInt(btn.getAttribute('data-star'), 10);
      btn.classList.toggle('active', star <= rating);
    });

    const xpPreview = document.getElementById('habitFormXpPreview');
    if (xpPreview) {
      const xp = this.engine.getXpForStars(rating);
      xpPreview.textContent = `+${xp} XP`;
    }
  }

  openCreateHabitModal() {
    this.sound.playClick();
    const modalBackdrop = document.getElementById('habitModalBackdrop');
    const modalTitle = document.getElementById('habitModalTitle');
    const form = document.getElementById('habitForm');

    if (modalTitle) modalTitle.innerHTML = '<i class="fa-solid fa-sparkles" style="color:var(--primary-light)"></i> Create New Habit';
    if (form) form.reset();

    const idInput = document.getElementById('habitFormId');
    if (idInput) idInput.value = '';

    this.selectedEmoji = EMOJI_COLLECTION[0];
    this.selectedColor = COLOR_PALETTE[0];
    this.setFormDifficulty(3);

    // Reset selection indicators
    document.querySelectorAll('.emoji-choice-btn').forEach((b, i) => b.classList.toggle('selected', i === 0));
    document.querySelectorAll('.color-swatch-btn').forEach((b, i) => b.classList.toggle('selected', i === 0));

    if (modalBackdrop) modalBackdrop.classList.add('active');
    setTimeout(() => {
      const nameInput = document.getElementById('habitFormName');
      if (nameInput) nameInput.focus();
    }, 100);
  }

  closeHabitModal() {
    const modalBackdrop = document.getElementById('habitModalBackdrop');
    if (modalBackdrop) modalBackdrop.classList.remove('active');
  }

  saveHabitForm(e) {
    e.preventDefault();
    const idInput = document.getElementById('habitFormId');
    const nameInput = document.getElementById('habitFormName');
    const catInput = document.getElementById('habitFormCategory');
    const activeFreqBtn = document.querySelector('.freq-btn.active');

    const name = nameInput.value.trim();
    if (!name) return;

    const category = catInput.value;
    const frequency = activeFreqBtn ? activeFreqBtn.getAttribute('data-freq') : 'daily';
    const difficulty = this.selectedDifficulty || 3;
    const icon = this.selectedEmoji || '⭐';
    const color = this.selectedColor || '#6C63FF';

    const isEdit = idInput && idInput.value;

    if (isEdit) {
      const habit = this.habits.find(h => h.id === idInput.value);
      if (habit) {
        habit.name = name;
        habit.category = category;
        habit.frequency = frequency;
        habit.difficulty = difficulty;
        habit.icon = icon;
        habit.color = color;
      }
    } else {
      const newHabit = {
        id: `habit_${Date.now()}`,
        name,
        category,
        frequency,
        difficulty,
        icon,
        color,
        createdAt: new Date().toISOString(),
        history: {},
        currentStreak: 0,
        bestStreak: 0
      };
      this.habits.push(newHabit);
    }

    this.saveState();
    this.closeHabitModal();
    this.renderAllViews();
    this.sound.playClick();
    this.showSnackbar(isEdit ? `Updated "${name}"` : `Created habit "${name}"!`);
  }

  // ==================== HABIT DETAIL SLIDE PANEL ====================
  openDetailPanel(habitId) {
    const habit = this.habits.find(h => h.id === habitId);
    if (!habit) return;
    this.currentDetailHabitId = habitId;

    const panelBackdrop = document.getElementById('slidePanelBackdrop');
    const catPill = document.getElementById('detailCategoryPill');
    const iconBox = document.getElementById('detailIconBox');
    const title = document.getElementById('detailTitle');
    const diffStars = document.getElementById('detailDifficultyStars');
    const currentStreak = document.getElementById('detailCurrentStreak');
    const bestStreak = document.getElementById('detailBestStreak');
    const totalCompletions = document.getElementById('detailTotalCompletions');
    const rateEl = document.getElementById('detailCompletionRate');

    if (catPill) {
      catPill.textContent = habit.category;
      catPill.style.border = `1px solid ${habit.color || 'var(--primary)'}50`;
    }
    if (iconBox) {
      iconBox.textContent = habit.icon;
      iconBox.style.boxShadow = `0 4px 15px ${habit.color || 'var(--primary)'}30`;
    }
    if (title) title.textContent = habit.name;
    if (diffStars) {
      diffStars.textContent = '★'.repeat(habit.difficulty) + '☆'.repeat(5 - habit.difficulty);
    }

    const curStreak = this.engine.calculateHabitStreak(habit);
    if (currentStreak) currentStreak.textContent = `${curStreak} Days`;
    if (bestStreak) bestStreak.textContent = `${habit.bestStreak || curStreak} Days`;

    const totalDone = Object.keys(habit.history).filter(k => habit.history[k]).length;
    if (totalCompletions) totalCompletions.textContent = totalDone;

    // 30 day completion rate
    let thirtyDayDone = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = formatDateStr(d);
      if (habit.history[dStr]) thirtyDayDone++;
    }
    const ratePct = Math.round((thirtyDayDone / 30) * 100);
    if (rateEl) rateEl.textContent = `${ratePct}%`;

    // Render 30-Day mini grid
    const miniCal = document.getElementById('detailMiniCalendarGrid');
    if (miniCal) {
      miniCal.innerHTML = '';
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = formatDateStr(d);
        const isDone = !!habit.history[dStr];

        const cell = document.createElement('div');
        cell.style.aspectRatio = '1';
        cell.style.borderRadius = '4px';
        cell.style.background = isDone ? (habit.color || 'var(--accent-green)') : 'rgba(255,255,255,0.05)';
        cell.style.boxShadow = isDone ? `0 0 6px ${habit.color || 'var(--accent-green)'}60` : 'none';
        cell.title = `${dStr}: ${isDone ? 'Completed' : 'Missed'}`;
        miniCal.appendChild(cell);
      }
    }

    if (panelBackdrop) panelBackdrop.classList.add('active');
  }

  closeDetailPanel() {
    const panelBackdrop = document.getElementById('slidePanelBackdrop');
    if (panelBackdrop) panelBackdrop.classList.remove('active');
  }

  editHabitFromDetail() {
    this.closeDetailPanel();
    const habit = this.habits.find(h => h.id === this.currentDetailHabitId);
    if (!habit) return;

    this.openCreateHabitModal();
    const modalTitle = document.getElementById('habitModalTitle');
    const idInput = document.getElementById('habitFormId');
    const nameInput = document.getElementById('habitFormName');
    const catInput = document.getElementById('habitFormCategory');

    if (modalTitle) modalTitle.innerHTML = '<i class="fa-solid fa-pen" style="color:var(--primary-light)"></i> Edit Habit';
    if (idInput) idInput.value = habit.id;
    if (nameInput) nameInput.value = habit.name;
    if (catInput) catInput.value = habit.category;

    this.setFormDifficulty(habit.difficulty);
    this.selectedEmoji = habit.icon;
    this.selectedColor = habit.color;

    // Set frequency button
    document.querySelectorAll('.freq-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-freq') === (habit.frequency || 'daily'));
    });
  }

  deleteHabitFromDetail() {
    const habit = this.habits.find(h => h.id === this.currentDetailHabitId);
    if (!habit) return;

    if (confirm(`Are you sure you want to delete "${habit.name}"?`)) {
      this.createUndoSnapshot(`Deleted "${habit.name}"`);
      this.state.habits = this.habits.filter(h => h.id !== habit.id);
      this.closeDetailPanel();
      this.saveState();
      this.renderAllViews();
      this.sound.playClick();
      this.showSnackbar(`Deleted "${habit.name}"`);
    }
  }

  // ==================== LEVEL UP & CELEBRATION MODALS ====================
  showLevelUpModal(level) {
    const modal = document.getElementById('levelUpModalBackdrop');
    const num = document.getElementById('levelUpModalNumber');
    const title = document.getElementById('levelUpModalTitle');

    if (num) num.textContent = level;
    if (title) title.textContent = `You are now a ${this.engine.getHeroTitle(level, this.state.prestige)}!`;
    if (modal) modal.classList.add('active');
  }

  closeLevelUpModal() {
    const modal = document.getElementById('levelUpModalBackdrop');
    if (modal) modal.classList.remove('active');
  }

  showBossDefeatedModal() {
    const modal = document.getElementById('bossDefeatedModalBackdrop');
    if (modal) modal.classList.add('active');
  }

  closeBossDefeatedModal() {
    const modal = document.getElementById('bossDefeatedModalBackdrop');
    if (modal) modal.classList.remove('active');
  }

  // ==================== SETTINGS, THEME & PRESTIGE ====================
  renderSettingsView() {
    const prestigeRank = document.getElementById('settingsPrestigeRank');
    const prestigeMult = document.getElementById('settingsPrestigeMultiplier');
    const ascendBtn = document.getElementById('prestigeAscendBtn');
    const soundToggle = document.getElementById('soundSettingToggle');
    const themeToggle = document.getElementById('themeSettingToggle');

    if (prestigeRank) prestigeRank.textContent = `Tier ${this.state.prestige}`;
    if (prestigeMult) prestigeMult.textContent = `+${this.state.prestige * 25}%`;

    if (soundToggle) soundToggle.checked = this.state.soundEnabled;
    if (themeToggle) themeToggle.checked = !this.state.darkTheme;

    if (ascendBtn) {
      if (this.state.level >= 50) {
        ascendBtn.disabled = false;
        ascendBtn.classList.add('glass-btn-primary');
      } else {
        ascendBtn.title = 'Reach Level 50 to Ascend';
      }
    }
  }

  handlePrestigeAscend() {
    if (this.state.level < 50) {
      alert(`You must reach Level 50 to Prestige! You are currently Level ${this.state.level}. Keep building consistency!`);
      return;
    }

    if (confirm("Cosmic Ascension: Prestige will reset your level to 1, but grants a permanent +25% XP multiplier and cosmic honors. Proceed?")) {
      this.state.prestige += 1;
      this.state.level = 1;
      this.state.xp = 0;
      this.engine.checkBadgeUnlock('transcended');
      this.sound.playLevelUp();
      this.particles.fullscreenCelebration();
      this.saveState();
      this.renderAllViews();
      this.showSnackbar(`Ascended to Prestige Tier ${this.state.prestige}! (+${this.state.prestige * 25}% XP Boost)`);
    }
  }

  setupTheme() {
    if (!this.state.darkTheme) {
      document.body.classList.add('light-theme');
      const icon = document.getElementById('themeIcon');
      if (icon) icon.className = 'fa-solid fa-sun';
    }
  }

  toggleTheme() {
    this.state.darkTheme = !this.state.darkTheme;
    document.body.classList.toggle('light-theme', !this.state.darkTheme);
    const icon = document.getElementById('themeIcon');
    if (icon) {
      icon.className = this.state.darkTheme ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }
    this.saveState();
    this.renderSettingsView();
  }

  toggleThemeSetting(isLight) {
    this.state.darkTheme = !isLight;
    document.body.classList.toggle('light-theme', isLight);
    const icon = document.getElementById('themeIcon');
    if (icon) {
      icon.className = this.state.darkTheme ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }
    this.saveState();
  }

  toggleSound() {
    this.state.soundEnabled = !this.state.soundEnabled;
    this.sound.enabled = this.state.soundEnabled;
    const icon = document.getElementById('soundIcon');
    if (icon) {
      icon.className = this.state.soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
    }
    this.saveState();
    this.renderSettingsView();
  }

  toggleSoundSetting(enabled) {
    this.state.soundEnabled = enabled;
    this.sound.enabled = enabled;
    const icon = document.getElementById('soundIcon');
    if (icon) {
      icon.className = enabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
    }
    this.saveState();
  }

  // ==================== QUOTE ROTATION ====================
  setupQuoteTicker() {
    this.cycleQuote();
    setInterval(() => this.cycleQuote(), 18000); // cycle quotes every 18 seconds
  }

  cycleQuote() {
    const qText = document.getElementById('quoteText');
    const qAuthor = document.getElementById('quoteAuthor');
    if (!qText || !qAuthor) return;

    const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    qText.style.opacity = '0';
    setTimeout(() => {
      qText.textContent = `"${quote.text}"`;
      qAuthor.textContent = `— ${quote.author}`;
      qText.style.opacity = '1';
    }, 250);
  }

  // ==================== NOTIFICATIONS ====================
  requestNotificationPermission() {
    if (!('Notification' in window)) {
      alert('Browser notifications are not supported by this browser.');
      return;
    }
    Notification.requestPermission().then(permission => {
      const btn = document.getElementById('requestNotifyBtn');
      if (btn) btn.textContent = permission === 'granted' ? 'Enabled' : 'Denied';
      if (permission === 'granted') {
        new Notification('HabitHero ⚔️', {
          body: "Habit reminders enabled! Let's stay consistent today.",
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⚔️</text></svg>'
        });
      }
    });
  }

  sendTestNotification() {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      alert('Please enable notifications first!');
      return;
    }
    new Notification('HabitHero Reminder ⚔️', {
      body: 'You have pending habit quests waiting for you today!',
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔥</text></svg>'
    });
  }

  checkPendingNotificationReminders() {
    // Check if afternoon and habits still pending
    if ('Notification' in window && Notification.permission === 'granted') {
      const now = new Date();
      if (now.getHours() === 18) { // 6 PM reminder check
        const todayStr = formatDateStr();
        const pending = this.habits.filter(h => !h.history[todayStr]);
        if (pending.length > 0) {
          new Notification('HabitHero Evening Reminder 🔥', {
            body: `You still have ${pending.length} habit(s) to complete today! Don't break your streak!`,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🐉</text></svg>'
          });
        }
      }
    }
  }

  // ==================== EXPORT, IMPORT & RESET ====================
  exportDataJSON() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.state, null, 2));
    const dlAnchor = document.createElement('a');
    const fileName = `habithero_backup_${formatDateStr()}.json`;
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', fileName);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    this.showSnackbar('Exported data to JSON!');
  }

  importDataJSON(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported && Array.isArray(imported.habits)) {
          this.state = imported;
          this.saveState();
          this.engine.state = this.state;
          this.renderAllViews();
          this.showSnackbar('Backup restored successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  }

  loadSampleHabits() {
    DEFAULT_HABITS.forEach(sample => {
      const exists = this.habits.some(h => h.name === sample.name);
      if (!exists) {
        this.habits.push(JSON.parse(JSON.stringify(sample)));
      }
    });
    this.saveState();
    this.renderAllViews();
    this.showSnackbar('Loaded starter sample habits!');
  }

  confirmResetAllData() {
    if (confirm("WARNING: This will permanently delete ALL habits, progress, XP, and streak records. Continue?")) {
      if (confirm("Are you ABSOLUTELY sure? This cannot be undone.")) {
        localStorage.removeItem(STORAGE_KEY);
        this.state = null;
        this.loadState();
        this.engine.state = this.state;
        this.renderAllViews();
        this.showSnackbar('All data has been reset to defaults.');
      }
    }
  }

  // ==================== TOOLTIP HELPER ====================
  showAppTooltip(text, x, y) {
    const tip = document.getElementById('appTooltip');
    if (!tip) return;
    tip.textContent = text;
    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
    tip.style.opacity = '1';
  }

  hideAppTooltip() {
    const tip = document.getElementById('appTooltip');
    if (tip) tip.style.opacity = '0';
  }

  escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.app = new HabitHeroApp();
  window.app.init();
});
