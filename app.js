// PSLE 2026 Subject Exam Dates (Official - Tentative)
const examSchedule = [
  {
    subject: "English & Mother Tongue",
    type: "Oral",
    date: "August 12, 2026 08:00:00",
    color: "#9b59b6",
  },
  {
    subject: "Mother Tongue",
    type: "Listening",
    date: "September 15, 2026 09:00:00",
    color: "#ec4899",
  },
  {
    subject: "English",
    type: "Written",
    date: "September 24, 2026 09:00:00",
    color: "#9b59b6",
  },
  {
    subject: "Mathematics",
    type: "Written",
    date: "September 25, 2026 09:00:00",
    color: "#3b82f6",
  },
  {
    subject: "Science",
    type: "Written",
    date: "September 28, 2026 09:00:00",
    color: "#10b981",
  },
  {
    subject: "Mother Tongue",
    type: "Written",
    date: "September 29, 2026 09:00:00",
    color: "#ec4899",
  },
];

function updateSubjectCountdowns() {
  const container = document.getElementById("subjectCountdowns");
  const now = new Date().getTime();

  // Find upcoming exams
  const upcomingExams = examSchedule
    .map((exam) => ({
      ...exam,
      timestamp: new Date(exam.date).getTime(),
      distance: new Date(exam.date).getTime() - now,
    }))
    .filter((exam) => exam.distance > 0)
    .sort((a, b) => a.distance - b.distance);

  // Get the closest upcoming exam
  const nextExam = upcomingExams[0];

  if (!nextExam) {
    container.innerHTML = `
                    <div class="subject-countdown-item completed">
                        <div class="countdown-completed-text" style="font-size: 1.5rem;">
                            🎉 All PSLE 2026 Exams Completed! 🎉
                        </div>
                    </div>
                `;
    return;
  }

  const days = Math.floor(nextExam.distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (nextExam.distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor(
    (nextExam.distance % (1000 * 60 * 60)) / (1000 * 60),
  );
  const seconds = Math.floor((nextExam.distance % (1000 * 60)) / 1000);

  const examDateObj = new Date(nextExam.date);
  const dateStr = examDateObj.toLocaleDateString("en-SG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  container.innerHTML = `
                <div class="subject-countdown-item" style="border-left: 4px solid ${nextExam.color};">
                    <div class="countdown-header">
                        <span class="countdown-subject" style="color: ${nextExam.color};">Next Exam: ${nextExam.subject}</span>
                        <span class="countdown-type">${nextExam.type}</span>
                    </div>
                    <div class="countdown-date">${dateStr} at 9:00 AM</div>
                    <div class="countdown-timer">
                        <div class="countdown-unit">
                            <span class="countdown-value">${days}</span>
                            <span class="countdown-label">Days</span>
                        </div>
                        <div class="countdown-unit">
                            <span class="countdown-value">${hours.toString().padStart(2, "0")}</span>
                            <span class="countdown-label">Hours</span>
                        </div>
                        <div class="countdown-unit">
                            <span class="countdown-value">${minutes.toString().padStart(2, "0")}</span>
                            <span class="countdown-label">Minutes</span>
                        </div>
                        <div class="countdown-unit">
                            <span class="countdown-value">${seconds.toString().padStart(2, "0")}</span>
                            <span class="countdown-label">Seconds</span>
                        </div>
                    </div>
                    ${upcomingExams.length > 1 ? `<div style="text-align: center; margin-top: 1rem; font-size: 0.9rem; opacity: 0.8;">${upcomingExams.length - 1} more exam${upcomingExams.length - 1 !== 1 ? "s" : ""} remaining</div>` : ""}
                </div>
            `;
}

// Update countdown immediately
updateSubjectCountdowns();

// Update countdown every second
const countdownInterval = setInterval(updateSubjectCountdowns, 1000);

function setPsleInfoExpanded(expanded) {
  const details = document.getElementById("psleInfoDetails");
  const toggleBtn = document.getElementById("psleInfoToggle");
  if (!details || !toggleBtn) return;

  details.style.display = expanded ? "block" : "none";
  toggleBtn.textContent = expanded ? "Hide details" : "Show details";
  toggleBtn.setAttribute("aria-expanded", expanded ? "true" : "false");

  try {
    localStorage.setItem("psleInfoExpanded", expanded ? "true" : "false");
  } catch (e) {
    // Ignore storage errors
  }
}

function togglePsleInfo() {
  const details = document.getElementById("psleInfoDetails");
  if (!details) return;
  const expanded = details.style.display !== "none";
  setPsleInfoExpanded(!expanded);
}

(function initPsleInfo() {
  let expanded = false;
  try {
    expanded = localStorage.getItem("psleInfoExpanded") === "true";
  } catch (e) {
    expanded = false;
  }
  setPsleInfoExpanded(expanded);
})();

// Initialize Firebase
const firebaseConfig = window.firebaseConfig;
if (!firebaseConfig || !firebaseConfig.projectId) {
  const authStatus = document.getElementById("authStatus");
  if (authStatus) {
    authStatus.textContent =
      'Missing Firebase config. Create `firebase-config.js` from `firebase-config.example.js`.';
  }
  throw new Error(
    "Missing Firebase config. Create firebase-config.js from firebase-config.example.js."
  );
}

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Todo List Management with Firebase Firestore
let todos = [];
let currentUser = null;
let todosUnsubscribe = null;

function setAuthError(message) {
  const el = document.getElementById("authError");
  if (!message) {
    el.style.display = "none";
    el.textContent = "";
    return;
  }
  el.textContent = message;
  el.style.display = "block";
}

function getUserTodosCollection() {
  if (!currentUser) return null;
  return db.collection("users").doc(currentUser.uid).collection("todos");
}

function setTodoUiEnabled(enabled) {
  const todoInput = document.getElementById("todoInput");
  const todoSubject = document.getElementById("todoSubject");
  const todoPriority = document.getElementById("todoPriority");
  const todoDeadline = document.getElementById("todoDeadline");
  const addBtn = document.querySelector(".btn-add");

  todoInput.disabled = !enabled;
  todoSubject.disabled = !enabled;
  todoPriority.disabled = !enabled;
  todoDeadline.disabled = !enabled;
  if (addBtn) addBtn.disabled = !enabled;

  if (!enabled) {
    todoInput.value = "";
  }
}

function updateAuthUi() {
  const authStatus = document.getElementById("authStatus");
  const googleSignInBtn = document.getElementById("googleSignInBtn");
  const emailToggleBtn = document.getElementById("emailToggleBtn");
  const signOutBtn = document.getElementById("signOutBtn");
  const authEmailSection = document.getElementById("authEmailSection");

  setAuthError(null);

  if (currentUser) {
    const display =
      currentUser.displayName ||
      currentUser.email ||
      `${currentUser.uid.slice(0, 6)}…${currentUser.uid.slice(-4)}`;
    authStatus.textContent = `Signed in as ${display}. Todos are private to this account.`;
    googleSignInBtn.style.display = "none";
    emailToggleBtn.style.display = "none";
    authEmailSection.style.display = "none";
    signOutBtn.style.display = "inline-block";
    setTodoUiEnabled(true);
  } else {
    authStatus.textContent =
      "Sign in to see and manage your private learning plan.";
    googleSignInBtn.style.display = "inline-block";
    emailToggleBtn.style.display = "inline-block";
    signOutBtn.style.display = "none";
    setTodoUiEnabled(false);
  }
}

// Load todos from Firestore
function startTodosListener() {
  if (todosUnsubscribe) {
    todosUnsubscribe();
    todosUnsubscribe = null;
  }

  const userTodosCollection = getUserTodosCollection();
  if (!userTodosCollection) {
    todos = [];
    renderTodos();
    renderCalendar();
    return;
  }

  todosUnsubscribe = userTodosCollection
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snapshot) => {
        todos = [];
        snapshot.forEach((doc) => {
          todos.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        renderTodos();
        renderCalendar(); // Update calendar when todos change
      },
      (error) => {
        console.error("Error loading todos:", error);
        // Fallback to empty array if error
        todos = [];
        renderTodos();
      },
    );
}

// Save is handled automatically by Firestore, but we keep this for compatibility
function saveTodos() {
  // No longer needed - Firestore updates in real-time
  renderCalendar();
}

// Add new todo
async function addTodo() {
  if (!currentUser) {
    alert("Please sign in to add private tasks.");
    return;
  }
  const input = document.getElementById("todoInput");
  const subjectSelect = document.getElementById("todoSubject");
  const prioritySelect = document.getElementById("todoPriority");
  const deadlineInput = document.getElementById("todoDeadline");

  const text = input.value.trim();

  if (text === "") {
    alert("Please enter a task!");
    return;
  }

  const todo = {
    text: text,
    subject: subjectSelect.value,
    priority: prioritySelect.value,
    deadline: deadlineInput.value || null,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  try {
    const userTodosCollection = getUserTodosCollection();
    if (!userTodosCollection) throw new Error("Not signed in");
    await userTodosCollection.add(todo);

    // Reset form
    input.value = "";
    subjectSelect.value = "english";
    prioritySelect.value = "medium";
    setDefaultDeadline();
    input.focus();
  } catch (error) {
    console.error("Error adding todo:", error);
    alert("Failed to add task. Please try again.");
  }
}

// Toggle todo completion
async function toggleTodo(id) {
  if (!currentUser) return;
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    try {
      const userTodosCollection = getUserTodosCollection();
      if (!userTodosCollection) throw new Error("Not signed in");
      await userTodosCollection.doc(id).update({
        completed: !todo.completed,
      });
    } catch (error) {
      console.error("Error toggling todo:", error);
      alert("Failed to update task. Please try again.");
    }
  }
}

// Delete todo
async function deleteTodo(id) {
  try {
    const userTodosCollection = getUserTodosCollection();
    if (!userTodosCollection) throw new Error("Not signed in");
    await userTodosCollection.doc(id).delete();
  } catch (error) {
    console.error("Error deleting todo:", error);
    alert("Failed to delete task. Please try again.");
  }
}

// Render todos to DOM
function renderTodos() {
  const todoList = document.getElementById("todoList");
  const todoCount = document.getElementById("todoCount");

  if (!currentUser) {
    todoList.innerHTML =
      '<div style="text-align: center; padding: 2rem; opacity: 0.7;">Sign in to view and manage your private tasks.</div>';
    todoCount.textContent = "0 tasks";
    return;
  }

  if (todos.length === 0) {
    todoList.innerHTML =
      '<div style="text-align: center; padding: 2rem; opacity: 0.6;">No tasks yet. Add your first learning goal!</div>';
    todoCount.textContent = "0 tasks";
    return;
  }

  // Sort todos by priority and deadline
  const sortedTodos = sortTodos([...todos]);

  todoList.innerHTML = sortedTodos
    .map((todo) => {
      const priorityClass = `priority-${todo.priority || "medium"}`;
      const subjectClass = `subject-${todo.subject || "general"}`;
      const deadlineInfo = formatDeadline(todo.deadline);

      return `
                    <div class="todo-item ${todo.completed ? "completed" : ""} ${priorityClass}">
                        <input
                            type="checkbox"
                            class="todo-checkbox"
                            ${todo.completed ? "checked" : ""}
                            onchange="toggleTodo('${todo.id}')"
                        >
                        <div class="todo-content">
                            <div class="todo-text">${escapeHtml(todo.text)}</div>
                            <div class="todo-meta">
                                <span class="subject-badge ${subjectClass}">${formatSubject(todo.subject)}</span>
                                <span class="priority-badge ${priorityClass}">${todo.priority || "medium"}</span>
                                ${deadlineInfo ? `<span class="deadline-display ${deadlineInfo.class}">${deadlineInfo.text}</span>` : ""}
                            </div>
                        </div>
                        <button class="todo-delete" onclick="deleteTodo('${todo.id}')">Delete</button>
                    </div>
                `;
    })
    .join("");

  const completedCount = todos.filter((t) => t.completed).length;
  todoCount.textContent = `${todos.length} task${todos.length !== 1 ? "s" : ""} (${completedCount} completed)`;
}

// Format subject display
function formatSubject(subject) {
  const subjectNames = {
    english: "English",
    mathematics: "Math",
    science: "Science",
    "mother-tongue": "Mother Tongue",
    general: "General",
  };
  return subjectNames[subject] || "General";
}

// Format deadline display
function formatDeadline(deadline) {
  if (!deadline) return null;

  const deadlineDate = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  const diffTime = deadlineDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let className = "";
  let text = "";

  if (diffDays < 0) {
    className = "overdue";
    text = `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? "s" : ""}`;
  } else if (diffDays === 0) {
    className = "overdue";
    text = "Due Today!";
  } else if (diffDays <= 3) {
    className = "soon";
    text = `Due in ${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  } else {
    text = `Due ${deadlineDate.toLocaleDateString("en-SG", { month: "short", day: "numeric" })}`;
  }

  return { class: className, text: text };
}

// Sort todos by priority and deadline
function sortTodos(todoArray) {
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  return todoArray.sort((a, b) => {
    // Completed tasks go to bottom
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // Sort by priority
    const priorityDiff =
      priorityOrder[a.priority || "medium"] -
      priorityOrder[b.priority || "medium"];
    if (priorityDiff !== 0) return priorityDiff;

    // Sort by deadline (earlier first)
    if (a.deadline && b.deadline) {
      return new Date(a.deadline) - new Date(b.deadline);
    }
    if (a.deadline) return -1;
    if (b.deadline) return 1;

    // Sort by creation time (newer first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Allow Enter key to add todo
document.getElementById("todoInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addTodo();
  }
});

// Set default deadline to today
function setDefaultDeadline() {
  const deadlineInput = document.getElementById("todoDeadline");
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  deadlineInput.value = `${year}-${month}-${day}`;
}

// Load todos on page load
function toggleEmailAuth() {
  const authEmailSection = document.getElementById("authEmailSection");
  const isVisible = authEmailSection.style.display !== "none";
  authEmailSection.style.display = isVisible ? "none" : "flex";
  setAuthError(null);
}

async function signInWithGoogle() {
  setAuthError(null);
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);
  } catch (error) {
    console.error("Google sign-in error:", error);
    setAuthError(error.message || "Failed to sign in with Google.");
  }
}

async function signInWithEmail() {
  setAuthError(null);
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;

  if (!email || !password) {
    setAuthError("Please enter both email and password.");
    return;
  }

  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (error) {
    if (
      error &&
      (error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-login-credentials")
    ) {
      try {
        await auth.createUserWithEmailAndPassword(email, password);
        return;
      } catch (createError) {
        console.error("Email sign-up error:", createError);
        if (createError && createError.code === "auth/email-already-in-use") {
          setAuthError(
            "Incorrect password for this email, or the account already exists. Try again or use Google sign-in.",
          );
          return;
        }
        setAuthError(createError.message || "Failed to sign up.");
        return;
      }
    }
    console.error("Email sign-in error:", error);
    setAuthError(error.message || "Failed to sign in.");
  }
}

async function signOut() {
  setAuthError(null);
  try {
    await auth.signOut();
  } catch (error) {
    console.error("Sign out error:", error);
    setAuthError(error.message || "Failed to sign out.");
  }
}

auth.onAuthStateChanged((user) => {
  currentUser = user || null;
  updateAuthUi();
  startTodosListener();
});

// Set default deadline to today
setDefaultDeadline();

// Calendar functionality
let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();

function renderMonth(gridId, monthTitleId, year, month) {
  const grid = document.getElementById(gridId);
  const monthTitle = document.getElementById(monthTitleId);
  if (!grid || !monthTitle) return;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);

  const firstDayIndex = firstDay.getDay();
  const lastDate = lastDay.getDate();
  const prevLastDate = prevLastDay.getDate();

  monthTitle.textContent = `${firstDay.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;

  let days = "";

  // Day headers
  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  dayHeaders.forEach((day) => {
    days += `<div class="calendar-day-header">${day}</div>`;
  });

  // Previous month's days
  for (let i = firstDayIndex; i > 0; i--) {
    days += `<div class="calendar-day other-month">${prevLastDate - i + 1}</div>`;
  }

  // Current month's days
  const today = new Date();
  for (let i = 1; i <= lastDate; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    const tasksForDate = todos.filter((todo) => todo.deadline === dateStr);
    const isToday =
      today.getDate() === i &&
      today.getMonth() === month &&
      today.getFullYear() === year;
    const hasTasks = tasksForDate.length > 0;
    const hasIncompleteTasks = hasTasks && tasksForDate.some((todo) => !todo.completed);
    const hasOnlyCompletedTasks = hasTasks && !hasIncompleteTasks;

    let classes = "calendar-day";
    if (isToday) classes += " today";
    if (hasOnlyCompletedTasks) classes += " has-completed-only";
    else if (hasIncompleteTasks) classes += " has-tasks";

    days += `<div class="${classes}" onclick="showTasksForDate('${dateStr}')">${i}</div>`;
  }

  // Next month's days
  const totalCells = firstDayIndex + lastDate;
  const nextDays = 7 - (totalCells % 7);
  if (nextDays < 7) {
    for (let i = 1; i <= nextDays; i++) {
      days += `<div class="calendar-day other-month">${i}</div>`;
    }
  }

  grid.innerHTML = days;
}

function renderCalendar() {
  const baseDate = new Date(currentCalendarYear, currentCalendarMonth, 1);
  const nextDate = new Date(currentCalendarYear, currentCalendarMonth + 1, 1);

  renderMonth(
    "calendarGrid1",
    "calendarMonth1",
    baseDate.getFullYear(),
    baseDate.getMonth(),
  );
  renderMonth(
    "calendarGrid2",
    "calendarMonth2",
    nextDate.getFullYear(),
    nextDate.getMonth(),
  );
}

function changeMonth(direction) {
  currentCalendarMonth += direction;
  if (currentCalendarMonth > 11) {
    currentCalendarMonth = 0;
    currentCalendarYear++;
  } else if (currentCalendarMonth < 0) {
    currentCalendarMonth = 11;
    currentCalendarYear--;
  }
  renderCalendar();
}

function showTasksForDate(dateStr) {
  const tasksForDate = todos.filter((todo) => todo.deadline === dateStr);

  if (tasksForDate.length === 0) {
    return; // Don't show popup if no tasks
  }

  const popup = document.getElementById("taskPopup");
  const popupDate = document.getElementById("popupDate");
  const popupBody = document.getElementById("popupBody");

  const date = new Date(dateStr);
  popupDate.textContent = `Tasks for ${date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;

  popupBody.innerHTML = tasksForDate
    .map((todo) => {
      const priorityClass = `priority-${todo.priority || "medium"}`;
      const subjectClass = `subject-${todo.subject || "general"}`;

      return `
                    <div class="popup-task">
                        <div class="popup-task-text">${escapeHtml(todo.text)}</div>
                        <div class="popup-task-meta">
                            <span class="subject-badge ${subjectClass}">${formatSubject(todo.subject)}</span>
                            <span class="priority-badge ${priorityClass}">${todo.priority || "medium"}</span>
                            ${todo.completed ? '<span style="opacity: 0.7;">✓ Completed</span>' : ""}
                        </div>
                    </div>
                `;
    })
    .join("");

  popup.classList.add("active");
}

function closePopup() {
  const popup = document.getElementById("taskPopup");
  popup.classList.remove("active");
}

// Initialize calendar
renderCalendar();
