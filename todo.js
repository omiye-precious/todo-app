const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const themeToggle = document.getElementById("theme-toggle");
const filterButtons = document.querySelectorAll(".filter");
const searchInput = document.getElementById("searchInput");
const sortBtn = document.getElementById("sortBtn");
const totalCount = document.getElementById("totalCount");
const activeCount = document.getElementById("activeCount");
const completedCount = document.getElementById("completedCount");

let sortAsc = true;

const priorityIcons = {
  low: "🟢 Low",
  medium: "🟡 Medium",
  high: "🔴 High"
};

function updateSummary() {
  const tasks = document.querySelectorAll(".task-item");
  const total = tasks.length;
  const completed = document.querySelectorAll(".task-item[data-status='completed']").length;
  const active = total - completed;

  totalCount.textContent = total;
  activeCount.textContent = active;
  completedCount.textContent = completed;
}

// Load tasks from localStorage
function loadTasks() {
  const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  savedTasks.forEach(task => {
    createTaskElement(task.text, task.priority, task.dueDate, task.tags, task.status);
  });
  updateSummary();
}

// Save tasks to localStorage
function saveTasks() {
  const tasks = [];
  document.querySelectorAll(".task-item").forEach(item => {
    tasks.push({
      text: item.querySelector(".task-text").textContent.trim(),
      priority: item.getAttribute("data-priority"),
      dueDate: item.querySelector(".due-date")?.textContent.replace("📅 ", "") || "",
      tags: item.querySelector(".tags")?.textContent.replace("🏷️ ", "") || "",
      status: item.getAttribute("data-status")
    });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function createTaskElement(text, priority, dueDate, tags, status = "active") {
  const li = document.createElement("li");
  li.className = `task-item priority-${priority}`;
  li.setAttribute("data-status", status);
  li.setAttribute("data-priority", priority);

  if (status === "completed") li.classList.add("completed");

  li.innerHTML = `
    <span class="task-text" contenteditable="false">${text}</span>
    <span class="priority-label">${priorityIcons[priority]}</span>
    ${dueDate ? `<span class="due-date">📅 ${dueDate}</span>` : ""}
    ${tags ? `<span class="tags">🏷️ ${tags}</span>` : ""}
    <button class="edit-btn">✏️</button>
    <button class="remove-btn">❌</button>
  `;

  taskList.appendChild(li);
}

function addTask() {
  const text = taskInput.value.trim();
  const dueDate = document.getElementById("dueDate").value;
  const tags = document.getElementById("tags").value;
  const priority = document.getElementById("priority").value;

  if (!text) return;

  createTaskElement(text, priority, dueDate, tags);
  taskInput.value = "";
  document.getElementById("dueDate").value = "";
  document.getElementById("tags").value = "";

  updateSummary();
  saveTasks();
}

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

taskList.addEventListener("click", (e) => {
  const item = e.target.closest(".task-item");
  const taskText = item.querySelector(".task-text");

  if (e.target.classList.contains("remove-btn")) {
    item.remove();
    updateSummary();
    saveTasks();
  }

  if (e.target.classList.contains("edit-btn")) {
    const editing = taskText.isContentEditable;
    taskText.contentEditable = !editing;
    taskText.focus();
    e.target.textContent = editing ? "✏️" : "💾";
    if (editing) saveTasks();
  }

  if (e.target.classList.contains("task-text")) {
    item.classList.toggle("completed");
    item.setAttribute("data-status", item.classList.contains("completed") ? "completed" : "active");
    updateSummary();
    saveTasks();
  }
});

taskList.addEventListener("keydown", (e) => {
  if (e.target.classList.contains("task-text") && e.key === "Enter") {
    e.preventDefault();
    e.target.contentEditable = "false";
    const btn = e.target.closest(".task-item").querySelector(".edit-btn");
    btn.textContent = "✏️";
    saveTasks();
  }
});

// Ctrl + E to edit selected task
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "e") {
    e.preventDefault();
    const selected = document.querySelector(".task-text:focus");
    if (selected) {
      selected.contentEditable = true;
      selected.focus();
    }
  }
});

// Filter Buttons
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.getAttribute("data-filter");
    const items = document.querySelectorAll(".task-item");

    items.forEach(item => {
      const status = item.getAttribute("data-status");
      item.style.display =
        filter === "all" || status === filter ? "flex" : "none";
    });
  });
});

// Theme toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// Search tasks
searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  document.querySelectorAll(".task-item").forEach(item => {
    const text = item.querySelector(".task-text").textContent.toLowerCase();
    item.style.display = text.includes(term) ? "flex" : "none";
  });
});

// Sort by priority
sortBtn.addEventListener("click", () => {
  const items = Array.from(document.querySelectorAll(".task-item"));
  const priorities = { high: 1, medium: 2, low: 3 };

  items.sort((a, b) => {
    const pa = a.getAttribute("data-priority");
    const pb = b.getAttribute("data-priority");
    return sortAsc ? priorities[pa] - priorities[pb] : priorities[pb] - priorities[pa];
  });

  items.forEach(item => taskList.appendChild(item));
  sortAsc = !sortAsc;
  saveTasks();
});

// Load tasks on page load
loadTasks();
