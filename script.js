// Global Variables
let processes = [];
let currentAlgorithm = '';
let processCounter = 1;

// Process colors for visualization
const colors = [
    'process-color-1',
    'process-color-2',
    'process-color-3',
    'process-color-4',
    'process-color-5',
    'process-color-6'
];

// Add Process
function addProcess() {
    const id = document.getElementById('processId').value || `P${processCounter}`;
    const arrival = parseInt(document.getElementById('arrivalTime').value) || 0;
    const burst = parseInt(document.getElementById('burstTime').value) || 0;
    const priority = parseInt(document.getElementById('priority').value) || 1;
    
    if (burst <= 0) {
        alert('Burst time must be greater than 0!');
        return;
    }
    
    // Check duplicate ID
    if (processes.find(p => p.id === id)) {
        alert('Process ID already exists!');
        return;
    }
    
    const process = {
        id: id,
        arrival: arrival,
        burst: burst,
        priority: priority,
        remaining: burst,
        colorClass: colors[processes.length % colors.length]
    };
    
    processes.push(process);
    processCounter++;
    
    // Update process ID for next entry
    document.getElementById('processId').value = `P${processCounter}`;
    
    updateProcessTable();
    hideVisualization();
}

// Update Process Table
function updateProcessTable() {
    const tbody = document.getElementById('processTableBody');
    
    if (processes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No processes added. Add a process to begin!</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    processes.forEach((process, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><strong>${process.id}</strong></td>
            <td>${process.arrival}</td>
            <td>${process.burst}</td>
            <td>${process.priority}</td>
            <td><button onclick="removeProcess(${index})" class="btn remove-btn">Remove</button></td>
        `;
    });
}

// Remove Process
function removeProcess(index) {
    processes.splice(index, 1);
    updateProcessTable();
    hideVisualization();
}

// Load Sample Data
function loadSampleData() {
    processes = [
        { id: 'P1', arrival: 0, burst: 5, priority: 2, remaining: 5, colorClass: 'process-color-1' },
        { id: 'P2', arrival: 1, burst: 3, priority: 1, remaining: 3, colorClass: 'process-color-2' },
        { id: 'P3', arrival: 2, burst: 8, priority: 3, remaining: 8, colorClass: 'process-color-3' },
        { id: 'P4', arrival: 3, burst: 6, priority: 2, remaining: 6, colorClass: 'process-color-4' }
    ];
    processCounter = 5;
    document.getElementById('processId').value = 'P5';
    updateProcessTable();
    hideVisualization();
}

// Reset All
function resetAll() {
    processes = [];
    processCounter = 1;
    document.getElementById('processId').value = 'P1';
    document.getElementById('arrivalTime').value = '0';
    document.getElementById('burstTime').value = '5';
    document.getElementById('priority').value = '1';
    updateProcessTable();
    hideVisualization();
    document.getElementById('comparisonArea').style.display = 'none';
}

// Hide Visualization
function hideVisualization() {
    document.getElementById('visualizationArea').style.display = 'none';
    document.getElementById('comparisonArea').style.display = 'none';
}

// Run Algorithm
function runAlgorithm(algorithm) {
    if (processes.length === 0) {
        alert('Please add at least one process!');
        return;
    }
    
    currentAlgorithm = algorithm.toUpperCase();
    
    // Show/hide quantum input for Round Robin
    if (algorithm === 'rr') {
        document.getElementById('quantumInput').style.display = 'block';
    } else {
        document.getElementById('quantumInput').style.display = 'none';
    }
    
    let result;
    switch(algorithm) {
        case 'fcfs':
            result = fcfs();
            break;
        case 'sjf':
            result = sjf();
            break;
        case 'priority':
            result = priorityScheduling();
            break;
        case 'rr':
            result = roundRobin();
            break;
    }
    
    displayResults(result, algorithm);
}

// FCFS Algorithm
function fcfs() {
    const sortedProcesses = [...processes].sort((a, b) => a.arrival - b.arrival);
    let currentTime = 0;
    const ganttChart = [];
    const metrics = [];
    
    sortedProcesses.forEach(process => {
        if (currentTime < process.arrival) {
            currentTime = process.arrival;
        }
        
        const startTime = currentTime;
        const completionTime = currentTime + process.burst;
        const turnaroundTime = completionTime - process.arrival;
        const waitingTime = turnaroundTime - process.burst;
        const responseTime = startTime - process.arrival;
        
        ganttChart.push({
            id: process.id,
            start: startTime,
            end: completionTime,
            colorClass: process.colorClass
        });
        
        metrics.push({
            id: process.id,
            arrival: process.arrival,
            burst: process.burst,
            completion: completionTime,
            turnaround: turnaroundTime,
            waiting: waitingTime,
            response: responseTime
        });
        
        currentTime = completionTime;
    });
    
    return { ganttChart, metrics };
}

// SJF Algorithm
function sjf() {
    const processQueue = [...processes].map(p => ({...p}));
    let currentTime = 0;
    const ganttChart = [];
    const metrics = [];
    const completed = [];
    
    while (completed.length < processes.length) {
        const available = processQueue.filter(p => 
            p.arrival <= currentTime && !completed.includes(p.id)
        );
        
        if (available.length === 0) {
            currentTime++;
            continue;
        }
        
        // Select process with shortest burst time
        available.sort((a, b) => a.burst - b.burst);
        const process = available[0];
        
        const startTime = currentTime;
        const completionTime = currentTime + process.burst;
        const turnaroundTime = completionTime - process.arrival;
        const waitingTime = turnaroundTime - process.burst;
        const responseTime = startTime - process.arrival;
        
        ganttChart.push({
            id: process.id,
            start: startTime,
            end: completionTime,
            colorClass: process.colorClass
        });
        
        metrics.push({
            id: process.id,
            arrival: process.arrival,
            burst: process.burst,
            completion: completionTime,
            turnaround: turnaroundTime,
            waiting: waitingTime,
            response: responseTime
        });
        
        completed.push(process.id);
        currentTime = completionTime;
    }
    
    return { ganttChart, metrics };
}

// Priority Scheduling
function priorityScheduling() {
    const processQueue = [...processes].map(p => ({...p}));
    let currentTime = 0;
    const ganttChart = [];
    const metrics = [];
    const completed = [];
    
    while (completed.length < processes.length) {
        const available = processQueue.filter(p => 
            p.arrival <= currentTime && !completed.includes(p.id)
        );
        
        if (available.length === 0) {
            currentTime++;
            continue;
        }
        
        // Select process with highest priority (lowest number = highest priority)
        available.sort((a, b) => a.priority - b.priority);
        const process = available[0];
        
        const startTime = currentTime;
        const completionTime = currentTime + process.burst;
        const turnaroundTime = completionTime - process.arrival;
        const waitingTime = turnaroundTime - process.burst;
        const responseTime = startTime - process.arrival;
        
        ganttChart.push({
            id: process.id,
            start: startTime,
            end: completionTime,
            colorClass: process.colorClass
        });
        
        metrics.push({
            id: process.id,
            arrival: process.arrival,
            burst: process.burst,
            completion: completionTime,
            turnaround: turnaroundTime,
            waiting: waitingTime,
            response: responseTime
        });
        
        completed.push(process.id);
        currentTime = completionTime;
    }
    
    return { ganttChart, metrics };
}

// Round Robin Algorithm
function roundRobin() {
    const quantum = parseInt(document.getElementById('timeQuantum').value) || 2;
    const processQueue = [...processes].map(p => ({...p, remaining: p.burst, firstResponse: -1}));
    let currentTime = 0;
    const ganttChart = [];
    const metrics = [];
    const readyQueue = [];
    let completed = 0;
    
    // Add initially arrived processes
    processQueue.forEach(p => {
        if (p.arrival <= currentTime) {
            readyQueue.push(p);
        }
    });
    
    while (completed < processes.length) {
        if (readyQueue.length === 0) {
            currentTime++;
            processQueue.forEach(p => {
                if (p.arrival <= currentTime && p.remaining > 0 && !readyQueue.includes(p)) {
                    readyQueue.push(p);
                }
            });
            continue;
        }
        
        const process = readyQueue.shift();
        
        if (process.firstResponse === -1) {
            process.firstResponse = currentTime;
        }
        
        const executeTime = Math.min(quantum, process.remaining);
        const startTime = currentTime;
        const endTime = currentTime + executeTime;
        
        ganttChart.push({
            id: process.id,
            start: startTime,
            end: endTime,
            colorClass: process.colorClass
        });
        
        process.remaining -= executeTime;
        currentTime = endTime;
        
        // Add newly arrived processes
        processQueue.forEach(p => {
            if (p.arrival <= currentTime && p.remaining > 0 && !readyQueue.includes(p) && p !== process) {
                readyQueue.push(p);
            }
        });
        
        if (process.remaining > 0) {
            readyQueue.push(process);
        } else {
            completed++;
            const turnaroundTime = currentTime - process.arrival;
            const waitingTime = turnaroundTime - process.burst;
            const responseTime = process.firstResponse - process.arrival;
            
            metrics.push({
                id: process.id,
                arrival: process.arrival,
                burst: process.burst,
                completion: currentTime,
                turnaround: turnaroundTime,
                waiting: waitingTime,
                response: responseTime
            });
        }
    }
    
    // Sort metrics by process id
    metrics.sort((a, b) => a.id.localeCompare(b.id));
    
    return { ganttChart, metrics };
}
// Display Results
function displayResults(result, algorithm) {
    document.getElementById('comparisonArea').style.display = 'none';
    document.getElementById('visualizationArea').style.display = 'block';
    
    // Update algorithm name
    const algorithmNames = {
        'fcfs': 'First-Come, First-Served (FCFS)',
        'sjf': 'Shortest Job First (SJF)',
        'priority': 'Priority Scheduling',
        'rr': 'Round Robin (RR)'
    };
    document.getElementById('currentAlgorithm').textContent = `Algorithm: ${algorithmNames[algorithm]}`;
    
    // Display Gantt Chart
    displayGanttChart(result.ganttChart);
    
    // Display Metrics
    displayMetrics(result.metrics);
    
    // Display Explanation
    displayExplanation(algorithm);
    
    // Scroll to visualization
    document.getElementById('visualizationArea').scrollIntoView({ behavior: 'smooth' });
}

// Display Gantt Chart
function displayGanttChart(ganttChart) {
    const container = document.getElementById('ganttChart');
    const timeline = document.getElementById('ganttTimeline');
    container.innerHTML = '';
    timeline.innerHTML = '';
    
    if (ganttChart.length === 0) return;
    
    const totalTime = ganttChart[ganttChart.length - 1].end;
    const pixelsPerUnit = Math.max(50, Math.min(100, 800 / totalTime));
    
    ganttChart.forEach((block, index) => {
        const width = (block.end - block.start) * pixelsPerUnit;
        const div = document.createElement('div');
        div.className = `gantt-block ${block.colorClass}`;
        div.style.width = `${width}px`;
        div.innerHTML = `<strong>${block.id}</strong><br><small>${block.start}-${block.end}</small>`;
        div.title = `${block.id}: ${block.start} to ${block.end}`;
        container.appendChild(div);
    });
    
    // Add timeline markers
    for (let i = 0; i <= totalTime; i++) {
        if (i % Math.ceil(totalTime / 10) === 0 || i === totalTime) {
            const marker = document.createElement('div');
            marker.className = 'timeline-mark';
            marker.style.left = `${i * pixelsPerUnit}px`;
            marker.textContent = i;
            timeline.appendChild(marker);
        }
    }
}

// Display Metrics
function displayMetrics(metrics) {
    const tbody = document.getElementById('metricsTableBody');
    tbody.innerHTML = '';
    
    let totalTurnaround = 0;
    let totalWaiting = 0;
    let totalResponse = 0;
    
    metrics.forEach(metric => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><strong>${metric.id}</strong></td>
            <td>${metric.arrival}</td>
            <td>${metric.burst}</td>
            <td>${metric.completion}</td>
            <td>${metric.turnaround}</td>
            <td>${metric.waiting}</td>
            <td>${metric.response}</td>
        `;
        
        totalTurnaround += metric.turnaround;
        totalWaiting += metric.waiting;
        totalResponse += metric.response;
    });
    
    // Calculate and display averages
    const count = metrics.length;
    document.getElementById('avgTurnaround').textContent = (totalTurnaround / count).toFixed(2);
    document.getElementById('avgWaiting').textContent = (totalWaiting / count).toFixed(2);
    document.getElementById('avgResponse').textContent = (totalResponse / count).toFixed(2);
}

// Display Explanation
function displayExplanation(algorithm) {
    const explanations = {
        'fcfs': `
            <strong>First-Come, First-Served (FCFS)</strong> is the simplest CPU scheduling algorithm. 
            <br><br>
            <strong>How it works:</strong>
            <ul>
                <li>Processes are executed in the order they arrive in the ready queue</li>
                <li>Once a process starts executing, it runs to completion (non-preemptive)</li>
                <li>Like a queue at a ticket counter - first person in line gets served first</li>
            </ul>
            <strong>Advantages:</strong> Simple to understand and implement, no starvation
            <br>
            <strong>Disadvantages:</strong> Convoy effect (short processes wait for long ones), poor average waiting time
        `,
        'sjf': `
            <strong>Shortest Job First (SJF)</strong> selects the process with the smallest burst time for execution next.
            <br><br>
            <strong>How it works:</strong>
            <ul>
                <li>Among all arrived processes, select the one with shortest burst time</li>
                <li>Execute it to completion (non-preemptive version shown here)</li>
                <li>Optimal for minimizing average waiting time</li>
            </ul>
            <strong>Advantages:</strong> Minimum average waiting time, efficient for batch systems
            <br>
            <strong>Disadvantages:</strong> Difficult to predict burst time, starvation for long processes, not practical for interactive systems
        `,
        'priority': `
            <strong>Priority Scheduling</strong> assigns a priority to each process and executes the highest priority process first.
            <br><br>
            <strong>How it works:</strong>
            <ul>
                <li>Each process is assigned a priority number (lower number = higher priority in this implementation)</li>
                <li>CPU is allocated to the process with highest priority</li>
                <li>Equal priority processes are scheduled in FCFS order</li>
            </ul>
            <strong>Advantages:</strong> Can prioritize important processes, flexible
            <br>
            <strong>Disadvantages:</strong> Starvation (low priority processes may never execute), priority inversion problem
        `,
        'rr': `
            <strong>Round Robin (RR)</strong> is designed for time-sharing systems. Each process gets a small time quantum.
            <br><br>
            <strong>How it works:</strong>
            <ul>
                <li>Each process gets a fixed time quantum (time slice)</li>
                <li>If process doesn't finish in quantum, it's preempted and moved to end of ready queue</li>
                <li>Next process in queue gets CPU for one quantum</li>
                <li>Continues in circular fashion until all processes complete</li>
            </ul>
            <strong>Advantages:</strong> Fair allocation, no starvation, good response time
            <br>
            <strong>Disadvantages:</strong> Higher context switching overhead, performance depends on quantum size
        `
    };
    
    document.getElementById('explanationText').innerHTML = explanations[algorithm];
}

// Compare All Algorithms
function compareAll() {
    if (processes.length === 0) {
        alert('Please add at least one process!');
        return;
    }
    
    document.getElementById('visualizationArea').style.display = 'none';
    document.getElementById('comparisonArea').style.display = 'block';
    
    // Run all algorithms
    const fcfsResult = fcfs();
    const sjfResult = sjf();
    const priorityResult = priorityScheduling();
    const rrResult = roundRobin();
    
    // Calculate averages for each
    const fcfsAvg = calculateAverages(fcfsResult.metrics);
    const sjfAvg = calculateAverages(sjfResult.metrics);
    const priorityAvg = calculateAverages(priorityResult.metrics);
    const rrAvg = calculateAverages(rrResult.metrics);
    
    // Display comparison cards
    displayComparisonCard('fcfsCard', 'FCFS', fcfsAvg);
    displayComparisonCard('sjfCard', 'SJF', sjfAvg);
    displayComparisonCard('priorityCard', 'Priority', priorityAvg);
    displayComparisonCard('rrCard', 'Round Robin', rrAvg);
    
    // Scroll to comparison
    document.getElementById('comparisonArea').scrollIntoView({ behavior: 'smooth' });
}

// Calculate Averages
function calculateAverages(metrics) {
    const count = metrics.length;
    const sum = metrics.reduce((acc, m) => ({
        turnaround: acc.turnaround + m.turnaround,
        waiting: acc.waiting + m.waiting,
        response: acc.response + m.response
    }), { turnaround: 0, waiting: 0, response: 0 });
    
    return {
        avgTurnaround: (sum.turnaround / count).toFixed(2),
        avgWaiting: (sum.waiting / count).toFixed(2),
        avgResponse: (sum.response / count).toFixed(2)
    };
}

// Display Comparison Card
function displayComparisonCard(cardId, name, averages) {
    const card = document.getElementById(cardId);
    card.innerHTML = `
        <h4>${name}</h4>
        <div class="metric">
            <span>Avg Turnaround Time:</span>
            <span>${averages.avgTurnaround}</span>
        </div>
        <div class="metric">
            <span>Avg Waiting Time:</span>
            <span>${averages.avgWaiting}</span>
        </div>
        <div class="metric">
            <span>Avg Response Time:</span>
            <span>${averages.avgResponse}</span>
        </div>
    `;
}

// Initialize
window.onload = function() {
    console.log('CPU Scheduling Visualizer Loaded!');
    updateProcessTable();
};

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey || event.metaKey) {
        switch(event.key) {
            case 'r':
                event.preventDefault();
                resetAll();
                break;
            case 'l':
                event.preventDefault();
                loadSampleData();
                break;
        }
    }
});