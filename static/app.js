const STORAGE_KEY = "learning_dashboard_v1";

const skillTopics = {
  "Data Analytics": [
    "Data lifecycle and analytics workflow",
    "Data cleaning basics",
    "Exploratory data analysis (EDA)",
    "Data visualization principles",
    "KPI design and business metrics",
    "Dashboard storytelling",
    "Power BI fundamentals",
    "Tableau basics",
    "Advanced charts and interactive dashboards",
    "A/B testing basics"
  ],
  SQL: [
    "SELECT, WHERE, ORDER BY",
    "GROUP BY and aggregate functions",
    "JOINS (INNER, LEFT, RIGHT, FULL)",
    "Subqueries",
    "CTEs and window functions",
    "Indexes and query optimization",
    "SQL case studies for analytics",
    "Data warehousing basics",
    "SQL interview questions practice"
  ],
  Python: [
    "Python syntax and control flow",
    "Functions and modules",
    "File handling and exception handling",
    "OOP basics in Python",
    "NumPy fundamentals",
    "Pandas data manipulation",
    "Matplotlib and Seaborn",
    "Data preprocessing scripts",
    "Automation scripts for analytics tasks",
    "Python interview coding practice"
  ],
  Java: [
    "Java syntax and OOP",
    "Collections framework",
    "Exception handling",
    "Multithreading basics",
    "Java streams and lambda",
    "Basic JDBC and database connectivity",
    "Java project structure and packaging",
    "Java problem solving patterns"
  ],
  DSA: [
    "Big-O notation and complexity",
    "Arrays and strings",
    "Linked list",
    "Stacks and queues",
    "Hashing and maps",
    "Recursion and backtracking",
    "Sorting and searching",
    "Binary search patterns",
    "Trees and BST",
    "Heaps and priority queue",
    "Graphs basics",
    "Dynamic programming fundamentals",
    "LeetCode/GFG medium set practice",
    "Mock coding interviews"
  ],
  "ML Basics": [
    "What is ML and supervised vs unsupervised learning",
    "Train-test split and cross validation",
    "Linear regression",
    "Logistic regression",
    "Decision trees and random forest",
    "Feature engineering basics",
    "Model evaluation metrics",
    "Overfitting vs underfitting",
    "Mini ML project deployment concept"
  ],
  Projects: [
    "SQL + Python mini analysis project",
    "Sales dashboard project in Power BI/Tableau",
    "End-to-end analytics project with documentation",
    "College/research data analytics project",
    "Portfolio website with project cards",
    "GitHub cleanup and readme quality improvements",
    "Capstone analytics project before internships"
  ],
  Certifications: [
    "Google Data Analytics (Coursera)",
    "Microsoft Power BI Data Analyst",
    "HackerRank SQL Intermediate",
    "Python for Data Science certificate",
    "Machine Learning basic certificate",
    "AWS Cloud Practitioner (optional)"
  ],
  "Internship Prep": [
    "Resume tailored for data analytics internship",
    "LinkedIn profile optimization",
    "Aptitude and logical reasoning practice",
    "Data analytics interview Q/A",
    "SQL and Python interview revision",
    "Behavioral interview preparation",
    "Internship application tracker",
    "Networking and referral outreach"
  ]
};

const courses = [
  { id: "course-google-da", name: "Google Data Analytics Professional Certificate", progress: 0 },
  { id: "course-powerbi", name: "Power BI Data Analyst Path", progress: 0 },
  { id: "course-sql", name: "Advanced SQL for Data Analytics", progress: 0 },
  { id: "course-python-da", name: "Python for Data Analysis", progress: 0 },
  { id: "course-dsa", name: "DSA Interview Preparation Track", progress: 0 },
  { id: "course-ml", name: "ML Foundations for Beginners", progress: 0 }
];

const certs = [
  { id: "cert-google", name: "Google Data Analytics", done: false },
  { id: "cert-powerbi", name: "Microsoft Power BI", done: false },
  { id: "cert-sql", name: "HackerRank SQL Intermediate", done: false },
  { id: "cert-python", name: "Python for Data Science", done: false },
  { id: "cert-ml", name: "ML Foundations", done: false }
];

const startDate = new Date("2026-05-29T00:00:00");
const endDate = new Date("2028-03-31T23:59:00");

const state = loadState();

const dom = {
  roadmap: document.getElementById("roadmapContainer"),
  modal: document.getElementById("learningModal"),
  modalTopicList: document.getElementById("modalTopicList"),
  startBtn: document.getElementById("startLearningBtn"),
  closeModalBtn: document.getElementById("closeModalBtn"),
  searchInput: document.getElementById("searchInput"),
  skillFilter: document.getElementById("skillFilter"),
  statusFilter: document.getElementById("statusFilter"),
  topicSelector: document.getElementById("topicSelector"),
  reminderInput: document.getElementById("reminderInput"),
  saveReminderBtn: document.getElementById("saveReminderBtn"),
  reminderStatus: document.getElementById("reminderStatus"),
  enableNotifyBtn: document.getElementById("enableNotifyBtn"),
  conceptScore: document.getElementById("conceptScore"),
  confidenceScore: document.getElementById("confidenceScore"),
  courseContainer: document.getElementById("courseContainer"),
  certContainer: document.getElementById("certContainer")
};

let charts = {};

init();

function init() {
  populateFilters();
  renderRoadmap();
  renderModalTopics();
  renderTopicSelector();
  renderCourses();
  renderCerts();
  renderScoreBox();
  initCharts();
  wireEvents();
  checkScheduledNotifications();
}

function loadState() {
  const topicList = [];
  Object.entries(skillTopics).forEach(([skill, topics]) => {
    topics.forEach((topic, index) => {
      topicList.push({
        id: `${skill}-${index}`.replace(/\s+/g, "-").toLowerCase(),
        skill,
        topic,
        status: "pending",
        reminderAt: null
      });
    });
  });

  const base = { topics: topicList, courses: [...courses], certs: [...certs], logs: [] };
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return base;

  try {
    const parsed = JSON.parse(saved);
    return {
      topics: mergeById(topicList, parsed.topics || []),
      courses: mergeById(courses, parsed.courses || []),
      certs: mergeById(certs, parsed.certs || []),
      logs: parsed.logs || []
    };
  } catch {
    return base;
  }
}

function mergeById(defaultItems, storedItems) {
  const map = new Map(storedItems.map((item) => [item.id, item]));
  return defaultItems.map((item) => ({ ...item, ...(map.get(item.id) || {}) }));
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderScoreBox();
  renderRoadmap();
  renderCourses();
  renderCerts();
  updateCharts();
}

function wireEvents() {
  dom.startBtn.addEventListener("click", () => dom.modal.classList.remove("hidden"));
  dom.closeModalBtn.addEventListener("click", () => dom.modal.classList.add("hidden"));
  dom.searchInput.addEventListener("input", renderRoadmap);
  dom.skillFilter.addEventListener("change", renderRoadmap);
  dom.statusFilter.addEventListener("change", renderRoadmap);

  dom.saveReminderBtn.addEventListener("click", () => {
    const topicId = dom.topicSelector.value;
    const reminderAt = dom.reminderInput.value;
    const target = state.topics.find((t) => t.id === topicId);
    if (!target || !reminderAt) {
      dom.reminderStatus.textContent = "Pick a topic and valid time.";
      return;
    }

    target.reminderAt = new Date(reminderAt).toISOString();
    dom.reminderStatus.textContent = `Reminder saved for "${target.topic}".`;
    saveState();
  });

  dom.enableNotifyBtn.addEventListener("click", async () => {
    if (!("Notification" in window)) {
      dom.reminderStatus.textContent = "Browser notifications are not supported here.";
      return;
    }
    const permission = await Notification.requestPermission();
    dom.reminderStatus.textContent =
      permission === "granted" ? "Notifications enabled." : "Notification permission denied.";
  });
}

function populateFilters() {
  Object.keys(skillTopics).forEach((skill) => {
    const option = document.createElement("option");
    option.value = skill;
    option.textContent = skill;
    dom.skillFilter.appendChild(option);
  });
}

function renderRoadmap() {
  const search = dom.searchInput.value.trim().toLowerCase();
  const selectedSkill = dom.skillFilter.value;
  const statusFilter = dom.statusFilter.value;

  const items = state.topics.filter((item) => {
    const bySearch = !search || item.topic.toLowerCase().includes(search) || item.skill.toLowerCase().includes(search);
    const bySkill = selectedSkill === "all" || item.skill === selectedSkill;
    const byStatus = statusFilter === "all" || item.status === statusFilter;
    return bySearch && bySkill && byStatus;
  });

  dom.roadmap.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "topic";
    card.innerHTML = `
      <div class="topic-top">
        <div>
          <strong>${item.topic}</strong><br>
          <small>${item.skill}</small>
        </div>
        <small>${item.reminderAt ? "Reminder set" : "No reminder"}</small>
      </div>
      <div class="topic-actions">
        ${statusChip(item, "completed", "Completed")}
        ${statusChip(item, "revise", "Revise")}
        ${statusChip(item, "later", "Schedule Later")}
        <button class="chip reset" data-action="reset">Reset</button>
      </div>
    `;

    card.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        item.status = action === "reset" ? "pending" : action;
        state.logs.push({ when: new Date().toISOString(), topicId: item.id, status: item.status });
        saveState();
      });
    });

    dom.roadmap.appendChild(card);
  });
}

function statusChip(item, action, label) {
  const active = item.status === action ? `active ${action}` : "";
  return `<button class="chip ${active}" data-action="${action}">${label}</button>`;
}

function renderModalTopics() {
  dom.modalTopicList.innerHTML = "";
  state.topics.forEach((topic) => {
    const div = document.createElement("div");
    div.className = "modal-item";
    div.innerHTML = `<strong>${topic.topic}</strong> <small>- ${topic.skill}</small>`;
    dom.modalTopicList.appendChild(div);
  });
}

function renderTopicSelector() {
  dom.topicSelector.innerHTML = "";
  state.topics.forEach((topic) => {
    const option = document.createElement("option");
    option.value = topic.id;
    option.textContent = `${topic.topic} (${topic.skill})`;
    dom.topicSelector.appendChild(option);
  });
}

function renderCourses() {
  dom.courseContainer.innerHTML = "";
  state.courses.forEach((course) => {
    const wrap = document.createElement("div");
    wrap.className = "course";
    wrap.innerHTML = `
      <strong>${course.name}</strong>
      <div class="bar"><span style="width:${course.progress}%"></span></div>
      <div class="topic-actions">
        <button class="chip" data-step="-10">-10%</button>
        <button class="chip" data-step="10">+10%</button>
      </div>
    `;
    wrap.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        course.progress = Math.max(0, Math.min(100, course.progress + Number(btn.dataset.step)));
        saveState();
      });
    });
    dom.courseContainer.appendChild(wrap);
  });
}

function renderCerts() {
  dom.certContainer.innerHTML = "";
  state.certs.forEach((cert) => {
    const wrap = document.createElement("div");
    wrap.className = "cert";
    const checked = cert.done ? "checked" : "";
    wrap.innerHTML = `
      <label>
        <input type="checkbox" ${checked}>
        ${cert.name}
      </label>
    `;
    wrap.querySelector("input").addEventListener("change", (e) => {
      cert.done = e.target.checked;
      saveState();
    });
    dom.certContainer.appendChild(wrap);
  });
}

function renderScoreBox() {
  const total = state.topics.length;
  const completed = state.topics.filter((t) => t.status === "completed").length;
  dom.conceptScore.textContent = `${completed} / ${total}`;
  dom.confidenceScore.textContent = `Confidence Index: ${Math.round((completed / total) * 100)}%`;
}

function initCharts() {
  const topicStats = getStatusCounts();

  charts.progress = new Chart(document.getElementById("progressDoughnut"), {
    type: "doughnut",
    data: {
      labels: ["Completed", "Revise", "Later", "Pending"],
      datasets: [{
        data: [topicStats.completed, topicStats.revise, topicStats.later, topicStats.pending],
        backgroundColor: ["#40f0a8", "#ffcf6b", "#8b7cff", "#45539b"]
      }]
    },
    options: chartOptions("Status Distribution")
  });

  const skills = Object.keys(skillTopics);
  charts.skill = new Chart(document.getElementById("skillBarChart"), {
    type: "bar",
    data: {
      labels: skills,
      datasets: [{
        label: "Completion %",
        data: skills.map(skillCompletionPercent),
        backgroundColor: "#6cc2ff"
      }]
    },
    options: chartOptions("Skill Completion")
  });

  charts.monthly = new Chart(document.getElementById("monthlyLineChart"), {
    type: "line",
    data: {
      labels: monthLabels(),
      datasets: [{
        label: "Cumulative completed topics",
        data: monthlyMomentum(),
        borderColor: "#d789ff",
        pointRadius: 2,
        tension: 0.25
      }]
    },
    options: chartOptions("Monthly Momentum")
  });
}

function updateCharts() {
  const topicStats = getStatusCounts();
  charts.progress.data.datasets[0].data = [topicStats.completed, topicStats.revise, topicStats.later, topicStats.pending];
  charts.progress.update();

  const skills = Object.keys(skillTopics);
  charts.skill.data.datasets[0].data = skills.map(skillCompletionPercent);
  charts.skill.update();

  charts.monthly.data.datasets[0].data = monthlyMomentum();
  charts.monthly.update();
}

function chartOptions(title) {
  return {
    plugins: {
      legend: { labels: { color: "#ece9ff" } },
      title: { display: true, text: title, color: "#b7a3ff" }
    },
    scales: {
      x: { ticks: { color: "#d6d1ff" }, grid: { color: "#2a215c" } },
      y: { ticks: { color: "#d6d1ff" }, grid: { color: "#2a215c" }, beginAtZero: true }
    }
  };
}

function getStatusCounts() {
  const counts = { completed: 0, revise: 0, later: 0, pending: 0 };
  state.topics.forEach((t) => counts[t.status]++);
  return counts;
}

function skillCompletionPercent(skill) {
  const skills = state.topics.filter((t) => t.skill === skill);
  const completed = skills.filter((t) => t.status === "completed").length;
  return Math.round((completed / skills.length) * 100);
}

function monthLabels() {
  const out = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    out.push(cursor.toLocaleString("en-US", { month: "short", year: "2-digit" }));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return out;
}

function monthlyMomentum() {
  const labels = monthLabels();
  const completed = state.topics.filter((t) => t.status === "completed").length;
  const perMonth = labels.length ? completed / labels.length : 0;
  let running = 0;
  return labels.map(() => {
    running += perMonth;
    return Math.round(running);
  });
}

function checkScheduledNotifications() {
  setInterval(() => {
    const now = Date.now();
    state.topics.forEach((topic) => {
      if (!topic.reminderAt) return;
      const time = new Date(topic.reminderAt).getTime();
      if (time <= now && topic.status !== "completed") {
        dom.reminderStatus.textContent = `Reminder: ${topic.topic} (${topic.skill})`;
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Learning Reminder", { body: `${topic.topic} - ${topic.skill}` });
        }
        topic.reminderAt = null;
      }
    });
    saveState();
  }, 30000);
}
