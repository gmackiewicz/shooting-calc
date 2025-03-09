if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
        .then(registration => {
            console.log('Service Worker registered:', registration);
        })
        .catch(error => {
            console.error('Service Worker registration failed:', error);
        });
    });
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
// Prevent Chrome from automatically showing the prompt
e.preventDefault();
// Stash the event so it can be triggered later
deferredPrompt = e;
// Show your custom "Add to Home Screen" button or banner
document.querySelector('#install-button').style.display = 'block';
});

// When your button is clicked, show the prompt
document.querySelector('#install-button').addEventListener('click', (e) => {
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        }
        deferredPrompt = null;
    });
});

// State variables
let currentTarget = {
    shots: [],
    counters: {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0}
};
let targetHistory = [];

// DOM Elements
const calculateView = document.getElementById('calculate-view');
const summaryView = document.getElementById('summary-view');
const numpadElement = document.getElementById('numpad');
const currentScoreElement = document.getElementById('current-score');
const shotsCountElement = document.getElementById('shots-count');
const tenxCountElement = document.getElementById('10x-count');
const shotsListElement = document.getElementById('shots-list');
const historyListElement = document.getElementById('history-list');
const miniHistoryListElement = document.getElementById('mini-history-list');
const clearTargetBtn = document.getElementById('clear-target-btn');

// Load data from localStorage
function loadData() {
    const savedHistory = localStorage.getItem('targetHistory');
    if (savedHistory) {
        targetHistory = JSON.parse(savedHistory);
        updateHistoryView();
        updateMiniHistoryView();
    }
    
    const savedTarget = localStorage.getItem('currentTarget');
    if (savedTarget) {
        currentTarget = JSON.parse(savedTarget);
        updateScoreDisplay();
        updateShotsList();
        updateCounters();
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('targetHistory', JSON.stringify(targetHistory));
    localStorage.setItem('currentTarget', JSON.stringify(currentTarget));
}

// Update score display
function updateScoreDisplay() {
    const sum = currentTarget.shots.reduce((total, shot) => total + shot, 0);
    const total = currentTarget.shots.length * 10;
    const tenXCount = currentTarget.shots.filter((shot) => shot == 10).length;
    currentScoreElement.textContent = `${sum}/${total}`;
    shotsCountElement.textContent = currentTarget.shots.length;
    tenxCountElement.textContent = tenXCount;
}

// Update shots list
function updateShotsList() {
    shotsListElement.innerHTML = '';
    
    if (currentTarget.shots.length === 0) {
        shotsListElement.textContent = 'Enter your points';
        return;
    }
    
    currentTarget.shots.forEach((shot, index) => {
        const shotChip = document.createElement('span');
        shotChip.className = 'shot-chip';
        shotChip.textContent = shot;
        shotChip.dataset.index = index;
        shotChip.title = 'Click to remove this shot';
        shotChip.addEventListener('click', (e) => {
            removeShot(parseInt(e.target.dataset.index));
        });
        shotsListElement.appendChild(shotChip);
    });
}

// Update numpad counters
function updateCounters() {
    for (const value in currentTarget.counters) {
        const counterElement = document.getElementById(`count-${value}`);
        if (counterElement) {
            counterElement.textContent = currentTarget.counters[value];
        }
    }
}

// Update history view
function updateHistoryView() {
    historyListElement.innerHTML = '';
    targetHistory.forEach((target, index) => {
        const sum = target.shots.reduce((total, shot) => total + shot, 0);
        const total = target.shots.length * 10;
        const tenXCount = target.shots.filter((shot) => shot == 10).length;
        
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const shotsDiv = document.createElement('div');
        shotsDiv.textContent = target.shots.join(', ');
        
        const scoreDiv = document.createElement('div');
        scoreDiv.innerHTML = `<strong>${sum} / ${total}</strong> (10x: ${tenXCount})`;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = 'X';
        removeBtn.dataset.index = index;
        removeBtn.addEventListener('click', (e) => {
            removeTarget(parseInt(e.target.dataset.index));
        });
        
        historyItem.appendChild(shotsDiv);
        historyItem.appendChild(scoreDiv);
        historyItem.appendChild(removeBtn);
        
        historyListElement.appendChild(historyItem);
    });
}

// Update mini history view for main screen
function updateMiniHistoryView() {
    miniHistoryListElement.innerHTML = '';
    targetHistory.forEach((target, index) => {
        const sum = target.shots.reduce((total, shot) => total + shot, 0);
        const total = target.shots.length * 10;
        const tenXCount = target.shots.filter((shot) => shot == 10).length;
        
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const shotsDiv = document.createElement('div');
        shotsDiv.textContent = target.shots.join(', ');
        
        const scoreDiv = document.createElement('div');
        scoreDiv.innerHTML = `<strong>${sum} / ${total}</strong> (10x: ${tenXCount})`;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = 'X';
        removeBtn.dataset.index = index;
        removeBtn.addEventListener('click', (e) => {
            removeTarget(parseInt(e.target.dataset.index));
        });
        
        historyItem.appendChild(shotsDiv);
        historyItem.appendChild(scoreDiv);
        historyItem.appendChild(removeBtn);
        
        miniHistoryListElement.appendChild(historyItem);
    });
}

// Add a shot to the current target
function addShot(value) {
    currentTarget.shots.push(value);
    currentTarget.counters[value]++;
    updateScoreDisplay();
    updateShotsList();
    updateCounters();
    saveData();
}

// Remove a specific shot
function removeShot(index) {
    if (index >= 0 && index < currentTarget.shots.length) {
        const removedShot = currentTarget.shots[index];
        currentTarget.shots.splice(index, 1);
        currentTarget.counters[removedShot]--;
        updateScoreDisplay();
        updateShotsList();
        updateCounters();
        saveData();
    }
}

// Remove the last shot
function removeLastShot() {
    if (currentTarget.shots.length > 0) {
        const lastShot = currentTarget.shots.pop();
        currentTarget.counters[lastShot]--;
        updateScoreDisplay();
        updateShotsList();
        updateCounters();
        saveData();
    }
}

// Clear the current target without saving
function clearCurrentTarget() {
    if (currentTarget.shots.length > 0) {
        currentTarget = {
            shots: [],
            counters: {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0}
        };
        updateScoreDisplay();
        updateShotsList();
        updateCounters();
        saveData();
    }
}

// Remove a target from history
function removeTarget(index) {
    if (index >= 0 && index < targetHistory.length) {
        targetHistory.splice(index, 1);
        updateHistoryView();
        updateMiniHistoryView();
        saveData();
    }
}

// Create a new target
function createNewTarget() {
    if (currentTarget.shots.length > 0) {
        targetHistory.push({...currentTarget});
        currentTarget = {
            shots: [],
            counters: {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0}
        };
        updateScoreDisplay();
        updateShotsList();
        updateCounters();
        updateHistoryView();
        updateMiniHistoryView();
        saveData();
    }
}

// Switch to Summary view
function showSummaryView() {
    calculateView.style.display = 'none';
    summaryView.style.display = 'block';
    numpadElement.style.display = 'none';
    document.getElementById('score-info').style.display = 'none';
    updateHistoryView();
}

// Switch to Calculate view
function showCalculateView() {
    calculateView.style.display = 'block';
    summaryView.style.display = 'none';
    numpadElement.style.display = 'grid';
    document.getElementById('score-info').style.display = 'block';
}

// Event Listeners
document.querySelectorAll('.num-btn').forEach(button => {
    if (button.id !== 'backspace') {
        button.addEventListener('click', () => {
            const value = parseInt(button.dataset.value);
            addShot(value);
        });
    }
});

document.getElementById('backspace').addEventListener('click', removeLastShot);
document.getElementById('new-target-btn').addEventListener('click', createNewTarget);
document.getElementById('summary-btn').addEventListener('click', showSummaryView);
document.getElementById('calculate-btn').addEventListener('click', showCalculateView);
document.getElementById('clear-target-btn').addEventListener('click', clearCurrentTarget);

// Initialize app
loadData();