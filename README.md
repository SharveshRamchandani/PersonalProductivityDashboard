# Personal Productivity Dashboard

A comprehensive productivity dashboard built with vanilla HTML, CSS, and JavaScript. Manage your tasks, take notes, track focus sessions, view weather, and stay organized - all in one place!

## Features

### 🔐 Authentication
- User sign up and login
- Secure session management using localStorage
- User profile management

### ✅ Task Management
- Create, edit, and delete tasks
- Mark tasks as complete/incomplete
- Filter tasks by status (All, Pending, Completed)
- Set task priorities (Low, Medium, High)
- Task descriptions and metadata

### 📝 Notes
- Create and manage notes
- Rich text notes with titles and content
- Edit and delete notes
- Notes organized by date

### ⏱️ Focus Timer
- Pomodoro-style focus timer
- Customizable timer durations (25, 45, 60 minutes)
- Start, pause, and reset functionality
- Session tracking and history
- Total focus time statistics

### 🌤️ Weather & Location
- Real-time weather information
- Automatic location detection
- Weather details (temperature, humidity, wind speed)
- Location display

### 📊 Dashboard
- Overview of all activities
- Task summary statistics
- Focus session statistics
- Daily inspirational quotes
- Weather summary

### 👤 Profile
- Upload and manage profile image
- User information display

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- That's it! No server needed!

### Installation

1. Clone or download this repository
2. That's all!

### Running the Application

**Just double-click `index.html`** or open it directly in your browser!

No server, no build process, no installation needed. It's pure HTML, CSS, and JavaScript that runs directly in your browser.

## Usage

### First Time Setup
1. Click on "Sign Up" tab
2. Enter your username, email, and password
3. Click "Sign Up"
4. You'll be automatically logged in and redirected to the dashboard

### Managing Tasks
1. Navigate to the "Tasks" page
2. Click "+ Add Task" to create a new task
3. Fill in the task details (title, description, priority)
4. Click "Save Task"
5. Use checkboxes to mark tasks as complete
6. Use filter buttons to view All, Pending, or Completed tasks
7. Edit or delete tasks using the action buttons

### Taking Notes
1. Go to the "Notes" page
2. Click "+ New Note" to create a note
3. Enter a title and content
4. Click "Save Note"
5. Click on any note to view/edit it
6. Use the action buttons to edit or delete notes

### Using the Focus Timer
1. Navigate to "Focus Timer"
2. Select a duration (25, 45, or 60 minutes) or use the default 25 minutes
3. Click "Start" to begin your focus session
4. Click "Pause" to pause the timer
5. Click "Reset" to reset the timer
6. Completed sessions are automatically saved and displayed

### Viewing Weather
1. Go to the "Weather" page
2. Allow location access when prompted
3. Weather information will be displayed automatically
4. Click "Refresh" to update weather data

### Profile Management
1. Click on your profile image in the sidebar
2. Select an image file to upload
3. Your profile image will be updated and saved

## Data Storage

All data is stored locally in your browser's localStorage:
- User accounts and authentication
- Tasks and notes
- Timer sessions
- Profile images

**Note:** Data is stored locally and will be cleared if you clear your browser's localStorage or use incognito/private browsing mode.

## API Integration

### Weather API
The app uses the OpenWeatherMap API for weather data. To use real weather data:
1. Sign up for a free API key at [OpenWeatherMap](https://openweathermap.org/api)
2. Open `js/weather.js`
3. Replace `'demo_key'` with your actual API key:
   ```javascript
   const WEATHER_API_KEY = 'your_api_key_here';
   ```

### Quotes API
The app uses the [Quotable API](https://github.com/lukePeavey/quotable) for daily inspirational quotes. This is a free, public API that doesn't require an API key.

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Any modern browser that supports ES6 modules

## Project Structure

```
PersonalProductivityDashboard/
├── index.html          # Main HTML file
├── styles/
│   └── main.css        # All styles
├── js/
│   └── app.js          # All JavaScript (no modules needed!)
├── README.md
└── LICENSE
```

## Features in Detail

### localStorage Management
- All user data is stored in browser localStorage
- Data is organized by user ID
- Includes: users, tasks, notes, timer sessions, profile images

### API Data Fetching
- Weather data from OpenWeatherMap API
- Daily quotes from Quotable API
- Automatic location detection using browser geolocation

### Responsive Design
- Mobile-friendly layout
- Responsive grid system
- Adaptive navigation for smaller screens

## Security Notes

⚠️ **Important:** This is a demo application. In a production environment:
- Passwords should be hashed (currently stored in plain text)
- Use a proper backend server for authentication
- Implement proper session management
- Use HTTPS for all connections
- Validate and sanitize all user inputs

## License

MIT License - see LICENSE file for details

## Contributing

Feel free to fork this project and make it your own! Add features, improve the UI, or customize it to your needs.

## Support

For issues or questions, please open an issue on the repository.

---

Built with ❤️ using vanilla HTML, CSS, and JavaScript
