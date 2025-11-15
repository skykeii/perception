# Font Size Control API - Examples

Complete examples for using the font size control endpoints.

## API Endpoints

- **POST** `/api/font-size/:userId` - Adjust font size
- **GET** `/api/font-size/:userId` - Get current font size

## Features

- ✅ Increase font size by 10% increments
- ✅ Decrease font size by 10% decrements
- ✅ Set to specific percentage (50% - 300%)
- ✅ Reset to default 100%
- ✅ Automatic bounds checking (min 50%, max 300%)
- ✅ Persisted per user

---

## JavaScript Examples

### 1. Increase Font Size

```javascript
async function increaseFontSize(userId) {
  const response = await fetch(`http://localhost:5000/api/font-size/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'increase' })
  });
  
  const data = await response.json();
  console.log(`Font size increased from ${data.previousSize}% to ${data.fontSize}%`);
  return data;
}

// Usage
increaseFontSize('user123');
// Response: { fontSize: 110, previousSize: 100, action: 'increase', percentage: '110%' }
```

### 2. Decrease Font Size

```javascript
async function decreaseFontSize(userId) {
  const response = await fetch(`http://localhost:5000/api/font-size/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'decrease' })
  });
  
  const data = await response.json();
  console.log(`Font size decreased to ${data.percentage}`);
  return data;
}

// Usage
decreaseFontSize('user123');
// Response: { fontSize: 100, previousSize: 110, action: 'decrease', percentage: '100%' }
```

### 3. Set Specific Font Size

```javascript
async function setFontSize(userId, size) {
  const response = await fetch(`http://localhost:5000/api/font-size/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      action: 'set',
      value: size 
    })
  });
  
  const data = await response.json();
  console.log(`Font size set to ${data.percentage}`);
  return data;
}

// Usage
setFontSize('user123', 150);
// Response: { fontSize: 150, previousSize: 100, action: 'set', percentage: '150%' }
```

### 4. Reset to Default

```javascript
async function resetFontSize(userId) {
  const response = await fetch(`http://localhost:5000/api/font-size/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reset' })
  });
  
  const data = await response.json();
  console.log(`Font size reset to ${data.percentage}`);
  return data;
}

// Usage
resetFontSize('user123');
// Response: { fontSize: 100, previousSize: 150, action: 'reset', percentage: '100%' }
```

### 5. Get Current Font Size

```javascript
async function getCurrentFontSize(userId) {
  const response = await fetch(`http://localhost:5000/api/font-size/${userId}`);
  const data = await response.json();
  console.log(`Current font size: ${data.percentage}`);
  return data;
}

// Usage
getCurrentFontSize('user123');
// Response: { fontSize: 100, percentage: '100%' }
```

---

## Complete Font Size Controller

Here's a complete class for managing font sizes:

```javascript
class FontSizeController {
  constructor(userId, baseUrl = 'http://localhost:5000/api') {
    this.userId = userId;
    this.baseUrl = baseUrl;
  }

  async increase() {
    return this._adjustFontSize('increase');
  }

  async decrease() {
    return this._adjustFontSize('decrease');
  }

  async setSize(value) {
    return this._adjustFontSize('set', value);
  }

  async reset() {
    return this._adjustFontSize('reset');
  }

  async getCurrent() {
    const response = await fetch(`${this.baseUrl}/font-size/${this.userId}`);
    return await response.json();
  }

  async _adjustFontSize(action, value = null) {
    const body = { action };
    if (value !== null) {
      body.value = value;
    }

    const response = await fetch(`${this.baseUrl}/font-size/${this.userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    return await response.json();
  }

  // Apply font size to webpage
  async applyToPage() {
    const { fontSize } = await this.getCurrent();
    document.documentElement.style.fontSize = `${fontSize}%`;
  }
}

// Usage Example
const fontController = new FontSizeController('user123');

// Increase font size
await fontController.increase();

// Apply to current page
await fontController.applyToPage();

// Get current size
const current = await fontController.getCurrent();
console.log(`Current size: ${current.percentage}`);
```

---

## Chrome Extension Integration

Example of integrating font size control into a Chrome extension:

```javascript
// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'adjustFontSize') {
    adjustFontSize(request.userId, request.fontAction)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
});

async function adjustFontSize(userId, action) {
  const response = await fetch(`http://localhost:5000/api/font-size/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action })
  });
  return await response.json();
}

// content.js - Apply font size to webpage
chrome.runtime.sendMessage(
  { action: 'adjustFontSize', userId: 'user123', fontAction: 'increase' },
  (response) => {
    if (response.fontSize) {
      document.documentElement.style.fontSize = `${response.fontSize}%`;
      console.log(`Font size updated to ${response.percentage}`);
    }
  }
);

// popup.js - UI controls
document.getElementById('increase-font').addEventListener('click', async () => {
  const response = await fetch('http://localhost:5000/api/font-size/user123', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'increase' })
  });
  const data = await response.json();
  
  // Send message to content script to apply
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'applyFontSize',
      fontSize: data.fontSize
    });
  });
});
```

---

## Error Handling

```javascript
async function safeFontSizeAdjust(userId, action, value = null) {
  try {
    const body = { action };
    if (value !== null) body.value = value;
    
    const response = await fetch(`http://localhost:5000/api/font-size/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to adjust font size');
    }

    return await response.json();
  } catch (error) {
    console.error('Font size adjustment error:', error);
    return { 
      error: error.message,
      fontSize: 100 // fallback
    };
  }
}
```

---

## Testing with curl

```bash
# Increase font size
curl -X POST http://localhost:5000/api/font-size/user123 \
  -H "Content-Type: application/json" \
  -d '{"action":"increase"}'

# Decrease font size
curl -X POST http://localhost:5000/api/font-size/user123 \
  -H "Content-Type: application/json" \
  -d '{"action":"decrease"}'

# Set to 150%
curl -X POST http://localhost:5000/api/font-size/user123 \
  -H "Content-Type: application/json" \
  -d '{"action":"set","value":150}'

# Reset to default
curl -X POST http://localhost:5000/api/font-size/user123 \
  -H "Content-Type: application/json" \
  -d '{"action":"reset"}'

# Get current font size
curl http://localhost:5000/api/font-size/user123
```

---

## Response Examples

### Increase Response
```json
{
  "fontSize": 110,
  "previousSize": 100,
  "action": "increase",
  "percentage": "110%"
}
```

### At Maximum (300%)
```json
{
  "fontSize": 300,
  "previousSize": 300,
  "action": "increase",
  "percentage": "300%"
}
```

### At Minimum (50%)
```json
{
  "fontSize": 50,
  "previousSize": 50,
  "action": "decrease",
  "percentage": "50%"
}
```

### Set to Specific Value
```json
{
  "fontSize": 175,
  "previousSize": 110,
  "action": "set",
  "percentage": "175%"
}
```

---

## Best Practices

1. **Persist Changes**: Always save font size preferences to the backend so they persist across sessions
2. **Bounds Checking**: The API automatically enforces min (50%) and max (300%) limits
3. **Smooth Transitions**: Use CSS transitions when applying font size changes
4. **User Feedback**: Show visual feedback when font size changes
5. **Keyboard Shortcuts**: Implement keyboard shortcuts (Ctrl+ / Ctrl-) for accessibility

```css
/* Smooth font size transitions */
html {
  transition: font-size 0.2s ease;
}
```

---

## Integration with User Preferences

The font size is automatically stored in user preferences:

```javascript
// Get all preferences including font size
const response = await fetch('http://localhost:5000/api/preferences/user123');
const prefs = await response.json();
console.log(prefs.fontSize); // "110"

// Update font size through preferences endpoint
await fetch('http://localhost:5000/api/preferences/user123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fontSize: '120' })
});
```
