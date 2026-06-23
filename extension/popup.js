const API_BASE_URL = 'https://burnout-project-q89u.onrender.com/api' || 'http://localhost:5001/api'
const FRONTEND_URL = 'https://burnout-project-xbf1.vercel.app/' || 'http://localhost:5173';

document.addEventListener('DOMContentLoaded', () => {
  // Check if it's the first run to show pin reminder
  chrome.storage.local.get(['hasSeenPinReminder']).then((result) => {
    if (!result.hasSeenPinReminder) {
      const reminder = document.createElement('div');
      reminder.innerHTML = `
        <div style="background:rgba(59, 130, 246, 0.15);border-bottom:1px solid rgba(59, 130, 246, 0.3);padding:8px 12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
            <p style="font-size:11px;color:#93c5fd;margin:0;">
              💡 <strong>Tip:</strong> Click the puzzle icon and pin Burnout Guard!
            </p>
            <button id="dismissPinReminder" style="background:none;border:none;color:#94a3b8;font-size:12px;cursor:pointer;">✕</button>
          </div>
        </div>
      `;
      document.body.prepend(reminder);
      
      document.getElementById('dismissPinReminder').addEventListener('click', () => {
        chrome.storage.local.set({ hasSeenPinReminder: true });
        reminder.remove();
      });
    }
  });
  
  loadUserData();
});

async function getTokenFromStorage() {
  const result = await chrome.storage.local.get('authToken');
  return result.authToken;
}

async function setTokenInStorage(token) {
  await chrome.storage.local.set({ authToken: token });
}

async function fetchUserProfile(token) {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.user;
}

async function fetchBurnoutRisk(token) {
  const res = await fetch(`${API_BASE_URL}/journal-ai/burnout-risk`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.data;
}

async function fetchDailyAssessmentHistory(token) {
  // Fetch both initial and daily assessments to combine them
  const [initialRes, dailyRes] = await Promise.all([
    fetch(`${API_BASE_URL}/assessment/history`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
    fetch(`${API_BASE_URL}/daily-assessment/history`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  ]);
  
  const initialData = await initialRes.json();
  const dailyData = await dailyRes.json();
  
  const initialHistory = initialData.data?.history || [];
  const dailyHistory = dailyData.data?.history || [];
  
  return [...initialHistory, ...dailyHistory];
}

function renderDebug(message) {
  console.log('DEBUG:', message);
}

function getRandomQuote() {
  const quotes = [
    "Take a deep breath, you're doing great!",
    "Remember to drink water and stretch!",
    "A 5-minute break can change your whole day!",
    "You deserve rest, don't forget that!",
    "Small steps lead to big progress!"
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

async function loadUserData() {
  let token = await getTokenFromStorage();
  
  if (!token) {
    renderDebug('No token, showing login');
    renderLoginPrompt();
    return;
  }
  
  try {
    renderLoading();
    const user = await fetchUserProfile(token);
    let burnout = null;
    try {
      burnout = await fetchBurnoutRisk(token);
    } catch (err) {
      renderDebug('Burnout API failed, trying tracker...');
    }
    const streakData = await fetchDailyAssessmentHistory(token);
    const quote = getRandomQuote();
    renderDebug('Data loaded!');
    renderApp(user, burnout, streakData, quote);
  } catch (err) {
    renderDebug('Error: ' + err.message);
    renderLoginPrompt();
  }
}

function renderLoading() {
  document.getElementById('app').innerHTML = `
    <div class="loading">
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      Loading your data...
    </div>
  `;
}

function renderLoginPrompt() {
  document.getElementById('app').innerHTML = `
    <div class="login-prompt">
      <div class="logo">
        <div class="logo-icon">⚡</div>
        <div class="logo-text">Burnout Guard</div>
      </div>
      <h3>Welcome!</h3>
      
      <div style="background:rgba(59, 130, 246, 0.1);border-radius:12px;padding:12px;margin-bottom:20px;border:1px solid rgba(59, 130, 246, 0.2);">
        <p style="font-size:12px;color:#93c5fd;margin-bottom:8px;">
          <strong>How to get your token:</strong>
        </p>
        <ol style="font-size:11px;color:#cbd5e1;margin:0 0 0 16px;padding:0;">
          <li style="margin-bottom:4px;">Go to the Burnout Guard website</li>
          <li>Select "Copy Extension Token"</li>
        </ol>
      </div>
      
      <div style="background:rgba(148,163,184,0.1);border-radius:12px;padding:16px;margin-bottom:20px;">
        <input id="tokenInput" type="text" placeholder="Paste your auth token" style="width:100%;padding:10px;border-radius:8px;border:1px solid #475569;background:rgba(15,23,42,0.5);color:white;font-size:13px;" />
        <button id="submitTokenBtn" class="primary-button" style="margin-top:12px;width:100%;padding:12px;">
          Use Token
        </button>
      </div>
      
      <button class="primary-button" id="loginButton">
        Go to Website
      </button>
    </div>
  `;
  
  document.getElementById('loginButton').addEventListener('click', () => {
    chrome.tabs.create({ url: FRONTEND_URL });
  });
  
  document.getElementById('submitTokenBtn').addEventListener('click', async () => {
    const input = document.getElementById('tokenInput');
    const token = input.value.trim();
    if (token) {
      await setTokenInStorage(token);
      loadUserData();
    }
  });
}

async function getReminderTime() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'GET_REMINDER' }, (response) => {
      resolve(response?.reminderTime || null);
    });
  });
}

async function setReminderTime(time) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'SET_REMINDER', time }, (response) => {
      resolve(response?.success || false);
    });
  });
}

async function clearReminder() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'CLEAR_REMINDER' }, (response) => {
      resolve(response?.success || false);
    });
  });
}

function renderApp(user, burnout, streakData, quote) {
  // Use user.currentStreak instead of array length
  const daysCompleted = user.currentStreak ?? 0;
  
  // Get user name
  const userName = user.name || user.fullName || 'User';
  
  // Get burnout score and risk level (PRIORITIZE LATEST TRACKER ENTRY)
  let score = 50;
  let riskLevel = 'low';
  
  if (streakData && streakData.length > 0) {
    // First, try to get latest tracker entry
    const sortedHistory = [...streakData]
      .map((h) => ({
        ...h,
        timestamp: new Date(h.completedAt ?? h.createdAt ?? h.date).getTime(),
        burnoutScore: h.burnoutScore,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
    const latestTracker = sortedHistory[sortedHistory.length - 1];
    if (latestTracker && typeof latestTracker.burnoutScore === 'number') {
      score = latestTracker.burnoutScore;
      riskLevel = score > 70 ? 'high' : score > 40 ? 'moderate' : 'low';
    }
  } 
  // Fallback to burnout API if no tracker data
  else if (burnout) {
    score = burnout.score ?? 50;
    riskLevel = burnout.riskLevel ?? 'low';
  }
  
  let riskClass = '';
  let riskBg = '';
  if (riskLevel === 'high') {
    riskClass = 'text-red-400';
    riskBg = 'bg-red-500/10 border-red-500/30';
  } else if (riskLevel === 'moderate') {
    riskClass = 'text-amber-400';
    riskBg = 'bg-amber-500/10 border-amber-500/30';
  } else {
    riskClass = 'text-green-400';
    riskBg = 'bg-green-500/10 border-green-500/30';
  }

  document.getElementById('app').innerHTML = `
    <div class="app">
      <div class="header">
        <div class="user-greeting">
          Hey ${userName}! 👋
        </div>
      </div>

      <div class="burnout-card ${riskBg}">
        <div class="burnout-label">Burnout Risk</div>
        <div class="burnout-score ${riskClass}">${score}/100</div>
        <div class="burnout-level ${riskClass}">
          ${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
        </div>
      </div>

      <div class="stats">
        <div class="stat-card" style="grid-column: span 2;">
          <div class="stat-label">Current Streak</div>
          <div class="stat-value">${daysCompleted} days</div>
        </div>
      </div>

      <div class="reminder-section">
        <div class="reminder-header">
          <div class="reminder-title">Daily Reminder</div>
          <label class="reminder-toggle">
            <input type="checkbox" id="reminderToggle">
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="reminder-controls" id="reminderControls" style="display: none;">
          <input type="time" id="reminderTimeInput" class="reminder-time-input">
          <button class="save-reminder-btn" id="saveReminderBtn">Save</button>
        </div>
        <div class="reminder-status" id="reminderStatus"></div>
      </div>

      <div class="quote">
        "${quote}"
      </div>

      <button class="primary-button" id="openDashboard">
        Open Dashboard
      </button>
      <button class="primary-button" id="logoutBtn" style="margin-top:12px;background:rgba(148,163,184,0.2);">
        Log Out
      </button>
    </div>
  `;
  
  document.getElementById('openDashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: FRONTEND_URL });
  });
  
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await chrome.storage.local.remove('authToken');
    loadUserData();
  });
  
  // Initialize reminder UI
  initReminderUI();
}

async function initReminderUI() {
  const reminderToggle = document.getElementById('reminderToggle');
  const reminderControls = document.getElementById('reminderControls');
  const reminderTimeInput = document.getElementById('reminderTimeInput');
  const saveReminderBtn = document.getElementById('saveReminderBtn');
  const reminderStatus = document.getElementById('reminderStatus');
  
  // Load existing reminder
  const savedTime = await getReminderTime();
  if (savedTime) {
    reminderToggle.checked = true;
    reminderControls.style.display = 'flex';
    reminderTimeInput.value = savedTime;
    reminderStatus.textContent = `Reminder set for ${savedTime}`;
    reminderStatus.classList.add('active');
  }
  
  // Toggle handler
  reminderToggle.addEventListener('change', async () => {
    if (reminderToggle.checked) {
      reminderControls.style.display = 'flex';
      // Set default time if none
      if (!reminderTimeInput.value) {
        reminderTimeInput.value = '21:00';
      }
    } else {
      reminderControls.style.display = 'none';
      await clearReminder();
      reminderStatus.textContent = '';
      reminderStatus.classList.remove('active');
    }
  });
  
  // Save handler
  saveReminderBtn.addEventListener('click', async () => {
    const time = reminderTimeInput.value;
    if (time) {
      const success = await setReminderTime(time);
      if (success) {
        reminderStatus.textContent = `Reminder set for ${time}`;
        reminderStatus.classList.add('active');
      }
    }
  });
}
