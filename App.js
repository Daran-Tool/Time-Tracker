let isRunning = false;
let startTime = 0;
let timerInterval;
let currentEntry = null;

// DOM Elements
const startStopBtn = document.getElementById('start-stop');
const resetBtn = document.getElementById('reset');
const taskInput = document.getElementById('task-name');
const projectSelect = document.getElementById('project');
const addProjectBtn = document.getElementById('add-project');
const entriesList = document.getElementById('entries-list');
const totalTimeDisplay = document.getElementById('total-time');

// Initialize
loadProjects();
updateEntriesList();

// Event Listeners
startStopBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);
addProjectBtn.addEventListener('click', addProject);
document.getElementById('export-csv').addEventListener('click', exportCSV);

function toggleTimer() {
    if (!isRunning) {
        startTimer();
    } else {
        stopTimer();
    }
}

function startTimer() {
    if (!taskInput.value.trim()) {
        alert('Please enter a task name!');
        return;
    }

    isRunning = true;
    startTime = Date.now() - (currentEntry?.duration || 0);
    timerInterval = setInterval(updateDisplay, 1000);
    startStopBtn.textContent = 'Stop';
    startStopBtn.classList.remove('start');
    startStopBtn.classList.add('stop');
}

function stopTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    startStopBtn.textContent = 'Start';
    startStopBtn.classList.remove('stop');
    startStopBtn.classList.add('start');
    saveEntry();
}

function updateDisplay() {
    const elapsed = Date.now() - startTime;
    document.getElementById('time-display').textContent = formatTime(elapsed);
}

function formatTime(ms) {
    const date = new Date(ms);
    return date.toISOString().substr(11, 8);
}

function saveEntry() {
    const entry = {
        task: taskInput.value.trim(),
        project: projectSelect.value,
        start: new Date(startTime),
        end: new Date(),
        duration: Date.now() - startTime
    };

    const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    entries.push(entry);
    localStorage.setItem('timeEntries', JSON.stringify(entries));

    taskInput.value = '';
    updateEntriesList();
}

function updateEntriesList() {
    const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    entriesList.innerHTML = entries.map((entry, index) => `
        <li>
            <span>[${entry.project}] ${entry.task}</span>
            <span>${formatTime(entry.duration)}</span>
        </li>
    `).join('');

    // Update total time
    const total = entries.reduce((sum, entry) => sum + entry.duration, 0);
    totalTimeDisplay.textContent = formatTime(total);
}

function addProject() {
    const projectName = prompt('Enter new project name:');
    if (projectName) {
        const projects = JSON.parse(localStorage.getItem('projects') || '["General"]');
        if (!projects.includes(projectName)) {
            projects.push(projectName);
            localStorage.setItem('projects', JSON.stringify(projects));
            refreshProjects();
        }
    }
}

function loadProjects() {
    const projects = JSON.parse(localStorage.getItem('projects') || '["General"]');
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project;
        option.textContent = project;
        projectSelect.appendChild(option);
    });
}

function refreshProjects() {
    projectSelect.innerHTML = '';
    loadProjects();
}

function exportCSV() {
    const entries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    const csv = [
        'Project,Task,Start Time,End Time,Duration',
        ...entries.map(entry => 
            `${entry.project},${entry.task},${entry.start.toISOString()},${entry.end.toISOString()},${entry.duration}`
        )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'time-entries.csv';
    a.click();
}

function resetTimer() {
    if (confirm('Reset timer and clear current entry?')) {
        isRunning = false;
        clearInterval(timerInterval);
        startStopBtn.textContent = 'Start';
        document.getElementById('time-display').textContent = '00:00:00';
        startTime = 0;
        currentEntry = null;
    }
}