"use strict";

class ChronoTaskManager {
    constructor() {
        // Load initial state array schema from LocalStorage or inject empty model
        this.tasks = JSON.parse(localStorage.getItem('chrono_tasks_matrix')) || [];
        this.editingTaskId = null; // Tracks update lifecycle target

        // Cache DOM Engine properties
        this.taskTitleInput = document.getElementById('taskTitleInput');
        this.taskDateTimeInput = document.getElementById('taskDateTimeInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.taskList = document.getElementById('taskList');
        this.taskCounter = document.getElementById('taskCounter');

        // Initial setup binding triggers
        this.addTaskBtn.addEventListener('click', () => this.handleTaskSubmission());
        
        // Render existing structural tree state
        this.renderTaskTree();
    }

    saveStateToStorage() {
        localStorage.setItem('chrono_tasks_matrix', JSON.stringify(this.tasks));
        this.updateCounterBadge();
    }

    updateCounterBadge() {
        const totalPending = this.tasks.filter(t => !t.completed).length;
        this.taskCounter.textContent = `${totalPending} Pending`;
    }

    handleTaskSubmission() {
        const titleValue = this.taskTitleInput.value.trim();
        const dateTimeValue = this.taskDateTimeInput.value;

        if (!titleValue) {
            this.taskTitleInput.focus();
            return;
        }

        if (this.editingTaskId !== null) {
            // Execution route map: Update lifecycle routine
            this.tasks = this.tasks.map(task => {
                if (task.id === this.editingTaskId) {
                    return {
                        ...task,
                        title: titleValue,
                        dateTime: dateTimeValue ? dateTimeValue : "No deadline"
                    };
                }
                return task;
            });
            
            this.editingTaskId = null;
            this.addTaskBtn.querySelector('span').textContent = "Add Task";
            this.addTaskBtn.querySelector('i').className = "fa-solid fa-plus";
        } else {
            // Execution route map: New task injection routine
            const newTask = {
                id: Date.now(),
                title: titleValue,
                dateTime: dateTimeValue ? dateTimeValue : "No deadline",
                completed: false
            };
            this.tasks.push(newTask);
        }

        // Clean user interface inputs
        this.taskTitleInput.value = "";
        this.taskDateTimeInput.value = "";

        this.saveStateToStorage();
        this.renderTaskTree();
    }

    toggleTaskStatus(id) {
        this.tasks = this.tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        this.saveStateToStorage();
        this.renderTaskTree();
    }

    initiateEditLifecycle(id, currentTitle, currentDateTime) {
        this.editingTaskId = id;
        this.taskTitleInput.value = currentTitle;
        
        // Verify text values to prevent syntax crashes inside time input structures
        if (currentDateTime !== "No deadline") {
            this.taskDateTimeInput.value = currentDateTime;
        } else {
            this.taskDateTimeInput.value = "";
        }

        this.taskTitleInput.focus();
        this.addTaskBtn.querySelector('span').textContent = "Update";
        this.addTaskBtn.querySelector('i').className = "fa-solid fa-pen-to-square";
    }

    deleteTaskItem(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        
        // Reset state edge-case: handling updates targeting wiped variables
        if (this.editingTaskId === id) {
            this.editingTaskId = null;
            this.addTaskBtn.querySelector('span').textContent = "Add Task";
            this.addTaskBtn.querySelector('i').className = "fa-solid fa-plus";
            this.taskTitleInput.value = "";
            this.taskDateTimeInput.value = "";
        }

        this.saveStateToStorage();
        this.renderTaskTree();
    }

    formatDisplayDate(dateTimeString) {
        if (dateTimeString === "No deadline") return dateTimeString;
        
        const options = { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        return new Date(dateTimeString).toLocaleDateString('en-US', options);
    }

    renderTaskTree() {
        this.taskList.innerHTML = "";

        if (this.tasks.length === 0) {
            this.taskList.innerHTML = `
                <div style="text-align: center; color: var(--text-muted); padding: 30px 0; font-size: 0.9rem;">
                    <i class="fa-regular fa-folder-open" style="font-size: 1.8rem; margin-bottom: 8px; display: block;"></i>
                    No tasks found. Create a checkpoint item above.
                </div>
            `;
            this.updateCounterBadge();
            return;
        }

        // Sort strategy layout: Active tasks positioned high, completed structural nodes flow bottom
        const sortedMatrix = [...this.tasks].sort((a, b) => a.completed - b.completed);

        sortedMatrix.forEach(task => {
            const itemNode = document.createElement('li');
            itemNode.className = `task-item ${task.completed ? 'completed' : ''}`;

            itemNode.innerHTML = `
                <div class="task-left-block">
                    <div class="check-trigger" title="Toggle State">
                        <i class="fa-solid fa-check"></i>
                    </div>
                    <div class="task-details">
                        <span class="task-text">${task.title}</span>
                        <span class="task-time-badge">
                            <i class="fa-regular fa-clock"></i>
                            <span>${this.formatDisplayDate(task.dateTime)}</span>
                        </span>
                    </div>
                </div>
                <div class="action-row">
                    <button class="icon-btn btn-edit" title="Edit Properties" ${task.completed ? 'disabled' : ''}>
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="icon-btn btn-delete" title="Purge Record">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;

            // Connect sub-node event hooks locally
            itemNode.querySelector('.check-trigger').addEventListener('click', () => this.toggleTaskStatus(task.id));
            
            if (!task.completed) {
                itemNode.querySelector('.btn-edit').addEventListener('click', () => {
                    this.initiateEditLifecycle(task.id, task.title, task.dateTime);
                });
            }
            
            itemNode.querySelector('.btn-delete').addEventListener('click', () => this.deleteTaskItem(task.id));

            this.taskList.appendChild(itemNode);
        });

        this.updateCounterBadge();
    }
}

// Initializing application when lifecycle hooks activate
document.addEventListener('DOMContentLoaded', () => {
    new ChronoTaskManager();
});