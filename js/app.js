// ============================================
// UTILITY FUNCTIONS
// ============================================

const storage = {

    getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    },

    saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    },

    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },

    setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    },

    clearCurrentUser() {
        localStorage.removeItem('currentUser');
    },


    getTasks(userId) {
        return JSON.parse(localStorage.getItem(`tasks_${userId}`) || '[]');
    },

    saveTasks(userId, tasks) {
        localStorage.setItem(`tasks_${userId}`, JSON.stringify(tasks));
    },


    getNotes(userId) {
        return JSON.parse(localStorage.getItem(`notes_${userId}`) || '[]');
    },

    saveNotes(userId, notes) {
        localStorage.setItem(`notes_${userId}`, JSON.stringify(notes));
    },


    getTimerSessions(userId) {
        return JSON.parse(localStorage.getItem(`timerSessions_${userId}`) || '[]');
    },

    saveTimerSession(userId, session) {
        const sessions = this.getTimerSessions(userId);
        sessions.push(session);
        localStorage.setItem(`timerSessions_${userId}`, JSON.stringify(sessions));
    },


    updateUserProfile(userId, updates) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) return null;

        users[userIndex] = { ...users[userIndex], ...updates };
        this.saveUsers(users);

        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            this.setCurrentUser(users[userIndex]);
        }

        return users[userIndex];
    }
};


function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}


function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}


function show(element) {
    if (element) element.classList.add('active');
}

function hide(element) {
    if (element) element.classList.remove('active');
}


function showMessage(element, message, type = 'error') {
    if (!element) return;
    element.textContent = message;
    element.className = `message ${type}`;
    setTimeout(() => {
        element.className = 'message';
        element.textContent = '';
    }, 3000);
}


function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}



function showAuth() {
    const authView = document.getElementById('auth-view');
    const dashboardView = document.getElementById('dashboard-view');
    show(authView);
    hide(dashboardView);
}

function showDashboard() {
    const authView = document.getElementById('auth-view');
    const dashboardView = document.getElementById('dashboard-view');
    hide(authView);
    show(dashboardView);


    const user = storage.getCurrentUser();
    if (user) {
        document.getElementById('username-display').textContent = user.username || 'User';


        if (user.profileImage) {
            document.getElementById('profile-image').src = user.profileImage;
        }
    }
}

function initAuth() {
    const currentUser = storage.getCurrentUser();
    if (currentUser) {
        showDashboard();
    } else {
        showAuth();
    }
}


const tabButtons = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;

        tabButtons.forEach(b => b.classList.remove('active'));
        authForms.forEach(f => f.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(`${tab}-form`).classList.add('active');
    });
});


const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const messageEl = document.getElementById('auth-message');

        try {
            const users = storage.getUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (!user) {
                throw new Error('Invalid email or password');
            }

            storage.setCurrentUser(user);
            showMessage(messageEl, 'Login successful!', 'success');
            setTimeout(() => {
                showDashboard();
                window.location.reload();
            }, 500);
        } catch (error) {
            showMessage(messageEl, error.message, 'error');
        }
    });
}


const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const messageEl = document.getElementById('auth-message');

        try {
            const users = storage.getUsers();

            if (users.find(u => u.email === email)) {
                throw new Error('Email already registered');
            }

            if (users.find(u => u.username === username)) {
                throw new Error('Username already taken');
            }

            const newUser = {
                id: Date.now().toString(),
                username,
                email,
                password,
                createdAt: new Date().toISOString(),
                profileImage: null
            };

            users.push(newUser);
            storage.saveUsers(users);
            storage.setCurrentUser(newUser);

            showMessage(messageEl, 'Account created successfully!', 'success');
            setTimeout(() => {
                showDashboard();
                window.location.reload();
            }, 500);
        } catch (error) {
            showMessage(messageEl, error.message, 'error');
        }
    });
}


const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        storage.clearCurrentUser();
        showAuth();
        if (loginForm) loginForm.reset();
        if (signupForm) signupForm.reset();
    });
}



let currentFilter = 'all';

function updateTaskSummary(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    const totalEl = document.getElementById('total-tasks');
    const completedEl = document.getElementById('completed-tasks');
    const pendingEl = document.getElementById('pending-tasks');

    if (totalEl) totalEl.textContent = total;
    if (completedEl) completedEl.textContent = completed;
    if (pendingEl) pendingEl.textContent = pending;
}

function loadTasks() {
    const user = storage.getCurrentUser();
    if (!user) return;

    const tasks = storage.getTasks(user.id);
    const tasksList = document.getElementById('tasks-list');
    if (!tasksList) return;


    let filteredTasks = tasks;
    if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
    }


    updateTaskSummary(tasks);

    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px;">No tasks found. Add your first task!</p>';
        return;
    }

    tasksList.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task.id}')">
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
                ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                <div class="task-meta">
                    <span class="task-priority ${task.priority}">${task.priority}</span>
                    <span>Created: ${formatDate(task.createdAt)}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-edit" onclick="editTask('${task.id}')">Edit</button>
                <button class="btn-delete" onclick="deleteTask('${task.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function openTaskModal(taskId = null) {
    const modal = document.getElementById('task-modal');
    const form = document.getElementById('task-form');
    const title = document.getElementById('task-modal-title');

    if (taskId) {
        const user = storage.getCurrentUser();
        const tasks = storage.getTasks(user.id);
        const task = tasks.find(t => t.id === taskId);

        if (task) {
            title.textContent = 'Edit Task';
            document.getElementById('task-id').value = task.id;
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-description').value = task.description || '';
            document.getElementById('task-priority').value = task.priority;
        }
    } else {
        title.textContent = 'Add Task';
        form.reset();
        document.getElementById('task-id').value = '';
    }

    show(modal);
}

function closeTaskModal() {
    const modal = document.getElementById('task-modal');
    hide(modal);
    const form = document.getElementById('task-form');
    if (form) form.reset();
}

function saveTask() {
    const user = storage.getCurrentUser();
    if (!user) return;

    const taskId = document.getElementById('task-id').value;
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const priority = document.getElementById('task-priority').value;

    const tasks = storage.getTasks(user.id);

    if (taskId) {
        const index = tasks.findIndex(t => t.id === taskId);
        if (index >= 0) {
            tasks[index] = {
                ...tasks[index],
                title,
                description,
                priority
            };
        }
    } else {
        tasks.push({
            id: generateId(),
            title,
            description,
            priority,
            completed: false,
            createdAt: new Date().toISOString()
        });
    }

    storage.saveTasks(user.id, tasks);
    closeTaskModal();
    loadTasks();
}

window.toggleTask = function (taskId) {
    const user = storage.getCurrentUser();
    if (!user) return;

    const tasks = storage.getTasks(user.id);
    const task = tasks.find(t => t.id === taskId);

    if (task) {
        task.completed = !task.completed;
        storage.saveTasks(user.id, tasks);
        loadTasks();
    }
};

window.editTask = function (taskId) {
    openTaskModal(taskId);
};

window.deleteTask = function (taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    const user = storage.getCurrentUser();
    if (!user) return;

    const tasks = storage.getTasks(user.id);
    const filtered = tasks.filter(t => t.id !== taskId);
    storage.saveTasks(user.id, filtered);
    loadTasks();
};

function setupTaskModal() {
    const modal = document.getElementById('task-modal');
    const addBtn = document.getElementById('add-task-btn');
    const form = document.getElementById('task-form');

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            openTaskModal();
        });
    }

    if (modal) {
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                closeTaskModal();
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeTaskModal();
            }
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveTask();
        });
    }
}

function initTasks() {
    loadTasks();
    setupTaskModal();


    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            loadTasks();
        });
    });
}



function loadNotes() {
    const user = storage.getCurrentUser();
    if (!user) return;

    const notes = storage.getNotes(user.id);
    const notesList = document.getElementById('notes-list');
    if (!notesList) return;

    if (notes.length === 0) {
        notesList.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px; grid-column: 1 / -1;">No notes yet. Create your first note!</p>';
        return;
    }

    const sortedNotes = [...notes].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

    notesList.innerHTML = sortedNotes.map(note => `
        <div class="note-item" onclick="openNote('${note.id}')">
            <div class="note-title">${escapeHtml(note.title)}</div>
            <div class="note-content">${escapeHtml(note.content)}</div>
            <div class="note-date">${formatDate(note.updatedAt || note.createdAt)}</div>
            <div class="note-actions">
                <button class="btn-edit" onclick="event.stopPropagation(); editNote('${note.id}')">Edit</button>
                <button class="btn-delete" onclick="event.stopPropagation(); deleteNote('${note.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function openNoteModal(noteId = null) {
    const modal = document.getElementById('note-modal');
    const form = document.getElementById('note-form');
    const title = document.getElementById('note-modal-title');

    if (noteId) {
        const user = storage.getCurrentUser();
        const notes = storage.getNotes(user.id);
        const note = notes.find(n => n.id === noteId);

        if (note) {
            title.textContent = 'Edit Note';
            document.getElementById('note-id').value = note.id;
            document.getElementById('note-title').value = note.title;
            document.getElementById('note-content').value = note.content;
        }
    } else {
        title.textContent = 'New Note';
        form.reset();
        document.getElementById('note-id').value = '';
    }

    show(modal);
}

function closeNoteModal() {
    const modal = document.getElementById('note-modal');
    hide(modal);
    const form = document.getElementById('note-form');
    if (form) form.reset();
}

function saveNote() {
    const user = storage.getCurrentUser();
    if (!user) return;

    const noteId = document.getElementById('note-id').value;
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').value;

    const notes = storage.getNotes(user.id);

    if (noteId) {
        const index = notes.findIndex(n => n.id === noteId);
        if (index >= 0) {
            notes[index] = {
                ...notes[index],
                title,
                content,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        notes.push({
            id: generateId(),
            title,
            content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    storage.saveNotes(user.id, notes);
    closeNoteModal();
    loadNotes();
}

window.openNote = function (noteId) {
    const user = storage.getCurrentUser();
    if (!user) return;

    const notes = storage.getNotes(user.id);
    const note = notes.find(n => n.id === noteId);

    if (note) {
        openNoteModal(noteId);
    }
};

window.editNote = function (noteId) {
    openNoteModal(noteId);
};

window.deleteNote = function (noteId) {
    if (!confirm('Are you sure you want to delete this note?')) return;

    const user = storage.getCurrentUser();
    if (!user) return;

    const notes = storage.getNotes(user.id);
    const filtered = notes.filter(n => n.id !== noteId);
    storage.saveNotes(user.id, filtered);
    loadNotes();
};

function setupNoteModal() {
    const modal = document.getElementById('note-modal');
    const addBtn = document.getElementById('add-note-btn');
    const form = document.getElementById('note-form');

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            openNoteModal();
        });
    }

    if (modal) {
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                closeNoteModal();
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeNoteModal();
            }
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveNote();
        });
    }
}

function initNotes() {
    loadNotes();
    setupNoteModal();
}



let timerInterval = null;
let timeLeft = 25 * 60;
let isRunning = false;
let currentSessionStart = null;

function setTimer(minutes) {
    if (isRunning) {
        if (!confirm('Timer is running. Reset to new duration?')) return;
        pauseTimer();
    }
    timeLeft = minutes * 60;
    updateDisplay();
}

function startTimer() {
    if (isRunning) return;

    isRunning = true;
    currentSessionStart = new Date();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft <= 0) {
            completeSession();
        }
    }, 1000);

    const startBtn = document.getElementById('timer-start');
    const pauseBtn = document.getElementById('timer-pause');
    if (startBtn) startBtn.disabled = true;
    if (pauseBtn) pauseBtn.disabled = false;
}

function pauseTimer() {
    if (!isRunning) return;

    isRunning = false;
    clearInterval(timerInterval);

    const startBtn = document.getElementById('timer-start');
    const pauseBtn = document.getElementById('timer-pause');
    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;
}

function resetTimer() {
    if (isRunning) {
        pauseTimer();
    }

    timeLeft = 25 * 60;
    updateDisplay();
    currentSessionStart = null;
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const timerEl = document.getElementById('timer-time');
    if (timerEl) timerEl.textContent = display;
}

function completeSession() {
    pauseTimer();

    const user = storage.getCurrentUser();
    if (!user) return;

    const duration = currentSessionStart ? Math.floor((new Date() - currentSessionStart) / 1000 / 60) : 25;

    const session = {
        id: Date.now().toString(),
        duration: duration,
        completedAt: new Date().toISOString()
    };

    storage.saveTimerSession(user.id, session);

    alert(`Focus session completed! You focused for ${duration} minutes.`);

    loadSessions();
    resetTimer();
}

function loadSessions() {
    const user = storage.getCurrentUser();
    if (!user) return;

    const sessions = storage.getTimerSessions(user.id);
    const sessionsList = document.getElementById('sessions-list');

    const totalSessions = sessions.length;
    const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);

    const totalSessionsEl = document.getElementById('total-sessions');
    const totalTimeEl = document.getElementById('total-time');
    if (totalSessionsEl) totalSessionsEl.textContent = totalSessions;
    if (totalTimeEl) totalTimeEl.textContent = totalTime;

    if (!sessionsList) return;

    if (sessions.length === 0) {
        sessionsList.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 20px;">No sessions yet. Start your first focus session!</p>';
        return;
    }

    const recentSessions = [...sessions].reverse().slice(0, 10);

    sessionsList.innerHTML = recentSessions.map(session => `
        <div class="session-item">
            <span>${formatDate(session.completedAt)}</span>
            <span><strong>${session.duration} min</strong></span>
        </div>
    `).join('');
}

function initTimer() {
    const startBtn = document.getElementById('timer-start');
    const pauseBtn = document.getElementById('timer-pause');
    const resetBtn = document.getElementById('timer-reset');
    const presetBtns = document.querySelectorAll('.preset-btn');

    if (startBtn) startBtn.addEventListener('click', startTimer);
    if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const minutes = parseInt(btn.dataset.minutes);
            setTimer(minutes);
        });
    });

    updateDisplay();
    loadSessions();
}



// Weather API Configuration
// NOTE: Replace with your own API key from https://openweathermap.org/api
// For security, consider using environment variables or a config file
const WEATHER_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual API key
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

async function fetchWeatherData(query) {
    // Check if API key is configured
    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
        return { 
            error: 'Weather API key not configured. Please add your API key in js/app.js',
            needsApiKey: true 
        };
    }

    try {
        let url;
        if (typeof query === 'string') {
            url = `${WEATHER_API_URL}?q=${encodeURIComponent(query)}&appid=${WEATHER_API_KEY}&units=metric`;
        } else {
            url = `${WEATHER_API_URL}?lat=${query.lat}&lon=${query.lon}&appid=${WEATHER_API_KEY}&units=metric`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your weather API configuration.');
            }
            if (response.status === 404) {
                throw new Error('City not found');
            }
            throw new Error('Weather API Error');
        }

        const data = await response.json();
        return {
            location: `${data.name}, ${data.sys.country}`,
            temperature: Math.round(data.main.temp),
            description: data.weather[0].description,
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed * 3.6),
            feelsLike: Math.round(data.main.feels_like),
            icon: data.weather[0].icon
        };
    } catch (error) {
        console.error('Weather fetch error:', error);
        return { error: error.message };
    }
}

function displayWeather(data, detailsEl, summaryEl) {
    // Check if data is null or has an error
    if (!data || data.error) {
        const errorMessage = data && data.error ? data.error : '';
        const errorDisplay = errorMessage && errorMessage !== 'City not found' && errorMessage !== 'Weather API Error'
            ? `<p class="error" style="color: var(--danger); margin-bottom: 10px;">${errorMessage}</p>`
            : '';

        if (detailsEl) {
            detailsEl.innerHTML = `
                <div class="weather-search">
                    ${errorDisplay}
                    <input type="text" id="city-input" placeholder="Enter city name...">
                    <button onclick="searchWeather()">Search</button>
                    ${errorMessage === 'City not found' ? '<p class="error" style="color: var(--danger); margin-top: 5px;">City not found. Please try again.</p>' : ''}
                </div>`;
        }

        // Also update summary if it's the dashboard
        if (summaryEl) {
            summaryEl.innerHTML = `<p>Weather unavailable</p>`;
        }
        return;
    }

    if (detailsEl) {
        detailsEl.innerHTML = `
            <div class="weather-search">
                <input type="text" id="city-input" placeholder="Enter city name..." value="${data.location.split(',')[0]}">
                <button onclick="searchWeather()">Search</button>
            </div>
            <div class="weather-info">
                <div class="weather-item">
                    <label>Location</label>
                    <div class="value">${data.location}</div>
                </div>
                <div class="weather-item">
                    <label>Temperature</label>
                    <div class="value">${data.temperature}°C</div>
                </div>
                <div class="weather-item">
                    <label>Feels Like</label>
                    <div class="value">${data.feelsLike}°C</div>
                </div>
                <div class="weather-item">
                    <label>Condition</label>
                    <div class="value">${data.description}</div>
                </div>
                <div class="weather-item">
                    <label>Humidity</label>
                    <div class="value">${data.humidity}%</div>
                </div>
                <div class="weather-item">
                    <label>Wind Speed</label>
                    <div class="value">${data.windSpeed} km/h</div>
                </div>
            </div>
        `;
    }

    if (summaryEl) {
        summaryEl.innerHTML = `
            <p><strong>${data.location}</strong></p>
            <p>${data.temperature}°C - ${data.description}</p>
        `;
    }
}

window.searchWeather = async function () {
    const input = document.getElementById('city-input');
    if (!input || !input.value) return;

    const city = input.value;
    const weatherDetails = document.getElementById('weather-details');
    const weatherSummary = document.getElementById('weather-summary');

    // Show loading state
    const btn = document.querySelector('#city-input + button');
    let originalBtnText = 'Search';
    if (btn) {
        originalBtnText = btn.textContent;
        btn.textContent = '...';
        btn.disabled = true;
    }

    const data = await fetchWeatherData(city);

    if (btn) {
        btn.textContent = originalBtnText;
        btn.disabled = false;
    }

    if (data && !data.error) {
        localStorage.setItem('lastCity', city);
        displayWeather(data, weatherDetails, weatherSummary);
    } else {
        // Pass the error data to displayWeather to show it in the UI
        displayWeather(data, weatherDetails, weatherSummary);
    }
};

async function loadWeather() {
    const weatherDetails = document.getElementById('weather-details');
    const weatherSummary = document.getElementById('weather-summary');

    // Try to get last used city
    const lastCity = localStorage.getItem('lastCity');

    if (lastCity) {
        const data = await fetchWeatherData(lastCity);
        if (data && !data.error) {
            displayWeather(data, weatherDetails, weatherSummary);
            return;
        }
    }

    // Fallback to geolocation
    try {
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        const data = await fetchWeatherData({ lat: latitude, lon: longitude });
        displayWeather(data, weatherDetails, weatherSummary);
    } catch (error) {
        console.log('Using default/fallback');
        displayWeather(null, weatherDetails, weatherSummary);
    }
}

const QUOTES = [
    { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { content: "Productivity is being able to do things that you were never able to do before.", author: "Franz Kafka" },
    { content: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
    { content: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
    { content: "Focus on being productive instead of busy.", author: "Tim Ferriss" }
];

function loadQuote() {
    const quoteDisplay = document.getElementById('quote-display');
    if (!quoteDisplay) return;

    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

    quoteDisplay.innerHTML = `
        <p class="quote-text">"${randomQuote.content}"</p>
        <p class="quote-author">— ${randomQuote.author}</p>
    `;
}

function initWeather() {
    loadWeather();
    loadQuote();

    const refreshBtn = document.getElementById('refresh-weather');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadWeather();
            loadQuote();
        });
    }
}



function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        hide(page);
    });

    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
        show(targetPage);
        loadPageData(pageName);
    }
}

function loadPageData(pageName) {
    switch (pageName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'tasks':
            initTasks();
            break;
        case 'notes':
            initNotes();
            break;
        case 'timer':
            initTimer();
            break;
        case 'weather':
            initWeather();
            break;
    }
}

function loadDashboard() {
    const user = storage.getCurrentUser();
    if (!user) return;

    const tasks = storage.getTasks(user.id);
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    const totalEl = document.getElementById('total-tasks');
    const completedEl = document.getElementById('completed-tasks');
    const pendingEl = document.getElementById('pending-tasks');
    if (totalEl) totalEl.textContent = total;
    if (completedEl) completedEl.textContent = completed;
    if (pendingEl) pendingEl.textContent = pending;

    const sessions = storage.getTimerSessions(user.id);
    const totalSessions = sessions.length;
    const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);

    const totalSessionsEl = document.getElementById('total-sessions');
    const totalTimeEl = document.getElementById('total-time');
    if (totalSessionsEl) totalSessionsEl.textContent = totalSessions;
    if (totalTimeEl) totalTimeEl.textContent = totalTime;

    initWeather();
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            showPage(page);

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function initProfileUpload() {
    const profileUpload = document.getElementById('profile-upload');
    const profileImage = document.getElementById('profile-image');

    if (profileUpload && profileImage) {
        profileUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const imageData = event.target.result;
                profileImage.src = imageData;

                const user = storage.getCurrentUser();
                if (user) {
                    storage.updateUserProfile(user.id, { profileImage: imageData });
                }
            };
            reader.readAsDataURL(file);
        });
    }
}

function initPageLoaders() {
    const dashboardView = document.getElementById('dashboard-view');
    if (dashboardView && dashboardView.classList.contains('active')) {
        loadDashboard();
    }
}


document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initNavigation();
    initProfileUpload();
    initPageLoaders();
});


window.showPage = showPage;
window.showDashboard = showDashboard;

