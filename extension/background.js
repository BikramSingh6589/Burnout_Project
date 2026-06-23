console.log('Burnout Guard background script loaded');

// Function to create a notification
function createNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: title,
    message: message,
    priority: 2
  });
}

// Listen for alarm triggers
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('Alarm triggered:', alarm.name);
  
  if (alarm.name === 'dailyReminder') {
    createNotification(
      'Burnout Guard Reminder',
      'Time to check in with your wellness today! 🌟'
    );
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  if (message.type === 'SET_REMINDER') {
    const { time } = message;
    const [hours, minutes] = time.split(':').map(Number);
    
    // Clear existing alarm
    chrome.alarms.clear('dailyReminder').then(() => {
      // Create new alarm
      const now = new Date();
      const reminderTime = new Date();
      reminderTime.setHours(hours, minutes, 0, 0);
      
      // If time is in past, set for tomorrow
      if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }
      
      chrome.alarms.create('dailyReminder', {
        when: reminderTime.getTime(),
        periodInMinutes: 24 * 60
      });
      
      // Save to storage
      chrome.storage.local.set({ reminderTime: time });
      
      sendResponse({ success: true });
    });
    
    return true; // Keep port open for async response
  }
  
  if (message.type === 'GET_REMINDER') {
    chrome.storage.local.get(['reminderTime']).then((result) => {
      sendResponse({ reminderTime: result.reminderTime || null });
    });
    return true;
  }
  
  if (message.type === 'CLEAR_REMINDER') {
    chrome.alarms.clear('dailyReminder').then(() => {
      chrome.storage.local.remove('reminderTime');
      sendResponse({ success: true });
    });
    return true;
  }
});

// Initialize alarm on startup if saved
chrome.storage.local.get(['reminderTime']).then((result) => {
  if (result.reminderTime) {
    const [hours, minutes] = result.reminderTime.split(':').map(Number);
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);
    
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    chrome.alarms.create('dailyReminder', {
      when: reminderTime.getTime(),
      periodInMinutes: 24 * 60
    });
  }
});