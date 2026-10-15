"use strict";

const STORAGE_KEY = "taskly_app_tasks";
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const deadlineInput = document.querySelector("#deadline-input");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const progressPercent = document.querySelector("#progress-percent");
const progressTrack = document.querySelector("#progress-track");
const progressFill = document.querySelector("#progress-fill");
const progressSummary = document.querySelector("#progress-summary");
const emptyState = document.querySelector("#empty-state");
const emptyTitle = document.querySelector("#empty-title");
const emptyCopy = document.querySelector("#empty-copy");
const feedback = document.querySelector("#feedback");
const filterButtons = document.querySelectorAll("[data-filter]");

let tasks = loadTasks();
let currentFilter = "all";

function isValidTask(task) {
  return (
    task !== null &&
    typeof task === "object" &&
    typeof task.id === "string" &&
    typeof task.text === "string" &&
    typeof task.completed === "boolean"
  );
}

function isValidDateString(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function loadTasks() {
  try {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    if (storedTasks === null) return [];

    const parsedTasks = JSON.parse(storedTasks);
    if (!Array.isArray(parsedTasks)) {
      throw new TypeError("Saved task data is not a list.");
    }

    const structurallyValidTasks = parsedTasks.filter(isValidTask);
    const validTasks = structurallyValidTasks.map((task) => {
      const deadline = task.deadline ?? "";
      return {
        ...task,
        deadline: deadline === "" || isValidDateString(deadline) ? deadline : "",
      };
    });
    if (validTasks.length !== parsedTasks.length) {
      feedback.textContent = "Some saved tasks could not be loaded because their data was invalid.";
    } else if (
      structurallyValidTasks.some(
        (task) => task.deadline != null && task.deadline !== "" && !isValidDateString(task.deadline),
      )
    ) {
      feedback.textContent = "Some invalid saved deadlines were cleared.";
    }
    return validTasks;
  } catch (error) {
    console.error("Unable to load Taskly tasks from local storage:", error);
    feedback.textContent = "Saved tasks could not be read. You can still create new tasks.";
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    feedback.textContent = "";
    return true;
  } catch (error) {
    console.error("Unable to save Taskly tasks to local storage:", error);
    feedback.textContent = "Your changes could not be saved on this device.";
    return false;
  }
}

function getVisibleTasks() {
  if (currentFilter === "active") return tasks.filter((task) => !task.completed);
  if (currentFilter === "completed") return tasks.filter((task) => task.completed);
  return tasks;
}

function makeIcon(path, viewBox = "0 0 24 24") {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", viewBox);
  svg.setAttribute("fill", "none");
  svg.setAttribute("aria-hidden", "true");

  const iconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  iconPath.setAttribute("d", path);
  iconPath.setAttribute("stroke", "currentColor");
  iconPath.setAttribute("stroke-width", "1.7");
  iconPath.setAttribute("stroke-linecap", "round");
  iconPath.setAttribute("stroke-linejoin", "round");
  svg.append(iconPath);
  return svg;
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = `task-item${task.completed ? " is-completed" : ""}`;
  item.dataset.taskId = task.id;

  const checkbox = document.createElement("input");
  checkbox.className = "task-check";
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.setAttribute("aria-label", `Mark "${task.text}" as ${task.completed ? "active" : "completed"}`);
  item.append(checkbox);

  const main = document.createElement("div");
  main.className = "task-main";
  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text;
  text.title = "Double-click to edit";
  main.append(text);
  if (task.deadline) {
    const deadline = document.createElement("time");
    const [year, month, day] = task.deadline.split("-").map(Number);
    const dueDate = new Date(year, month - 1, day);
    const today = new Date();
    const todayString = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");
    deadline.className = "task-deadline";
    deadline.dateTime = task.deadline;
    deadline.textContent = task.deadline < todayString && !task.completed
      ? `Overdue · ${dueDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
      : `Due · ${dueDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
    if (!task.completed && task.deadline < todayString) deadline.classList.add("is-overdue");
    main.append(deadline);
  }
  item.append(main);

  const actions = document.createElement("div");
  actions.className = "task-actions";
  actions.append(
    makeActionButton("Edit task", "edit-button", "M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"),
    makeActionButton("Delete task", "delete-button", "M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"),
  );
  item.append(actions);
  return item;
}

function makeActionButton(label, className, iconPath) {
  const button = document.createElement("button");
  button.className = `icon-button ${className}`;
  button.type = "button";
  button.setAttribute("aria-label", label);
  button.append(makeIcon(iconPath));
  return button;
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();
  const activeCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.length - activeCount;
  const completionPercent = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);
  progressPercent.textContent = `${completionPercent}%`;
  progressFill.style.width = `${completionPercent}%`;
  progressTrack.setAttribute("aria-valuenow", String(completionPercent));
  progressSummary.textContent = tasks.length === 0
    ? "No tasks yet — add one to get started."
    : `${completedCount} of ${tasks.length} ${tasks.length === 1 ? "task" : "tasks"} complete`;
  taskList.replaceChildren(...visibleTasks.map(createTaskElement));
  taskCount.textContent =
    tasks.length === 0
      ? "A fresh start"
      : `${activeCount} ${activeCount === 1 ? "task" : "tasks"} left`;

  const noTasks = visibleTasks.length === 0;
  emptyState.hidden = !noTasks;
  taskList.hidden = noTasks;

  if (tasks.length === 0) {
    emptyTitle.textContent = "A clear mind starts here";
    emptyCopy.textContent = "Add your first task above and take it one step at a time.";
  } else if (currentFilter === "active") {
    emptyTitle.textContent = "You’re all caught up";
    emptyCopy.textContent = "There are no active tasks right now. Enjoy the breathing room.";
  } else {
    emptyTitle.textContent = "Nothing completed just yet";
    emptyCopy.textContent = "Finish a task and it’ll find its way here.";
  }
}

function updateTask(id, changes) {
  tasks = tasks.map((task) => (task.id === id ? { ...task, ...changes } : task));
  saveTasks();
  renderTasks();
}

function beginEditing(item) {
  const task = tasks.find((entry) => entry.id === item.dataset.taskId);
  if (!task || item.querySelector(".edit-input")) return;

  const input = document.createElement("input");
  input.className = "edit-input";
  input.type = "text";
  input.maxLength = 300;
  input.value = task.text;
  input.setAttribute("aria-label", "Edit task");
  item.querySelector(".task-text").replaceWith(input);
  input.focus();
  input.select();

  let finished = false;
  const finishEditing = (save) => {
    if (finished) return;
    finished = true;
    const newText = input.value.trim();
    if (save && newText.length === 0) {
      feedback.textContent = "A task cannot be empty. The original text was kept.";
      renderTasks();
      return;
    }
    if (save && newText !== task.text) {
      updateTask(task.id, { text: newText });
      return;
    }
    renderTasks();
  };

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      finishEditing(true);
    } else if (event.key === "Escape") {
      finishEditing(false);
    }
  });
  input.addEventListener("blur", () => finishEditing(true));
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  const deadline = deadlineInput.value;
  if (!text) {
    feedback.textContent = "Please enter a task before adding it.";
    taskInput.focus();
    return;
  }

  tasks.unshift({
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text,
    completed: false,
    deadline,
  });
  taskInput.value = "";
  deadlineInput.value = "";
  currentFilter = "all";
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  saveTasks();
  renderTasks();
  taskInput.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });
    renderTasks();
  });
});

taskList.addEventListener("change", (event) => {
  if (!event.target.matches(".task-check")) return;
  const item = event.target.closest(".task-item");
  updateTask(item.dataset.taskId, { completed: event.target.checked });
});

taskList.addEventListener("click", (event) => {
  const item = event.target.closest(".task-item");
  if (!item) return;

  if (event.target.closest(".edit-button")) {
    beginEditing(item);
  } else if (event.target.closest(".delete-button")) {
    tasks = tasks.filter((task) => task.id !== item.dataset.taskId);
    saveTasks();
    renderTasks();
  }
});

taskList.addEventListener("dblclick", (event) => {
  if (event.target.matches(".task-text")) {
    beginEditing(event.target.closest(".task-item"));
  }
});

renderTasks();
