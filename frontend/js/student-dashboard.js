// 🔐 Protect Student Dashboard
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
console.log("Student Dashboard JS Loaded. Role:", role);

if (!token || role !== "student") {
  window.location.href = "newlogin.html";
}

const BASE_URL = window.API_BASE_URL || "http://localhost:5000";
const API_BASE = `${BASE_URL}/api/student`;

// 🚪 Logout function
function logout() {
  localStorage.clear();
  window.location.href = "newlogin.html";
}

// Update Name and Avatar in Header
function updateHeader() {
  const name = localStorage.getItem("name") || "Student";
  const userNameElem = document.querySelector(".user-name");
  const userAvatarElem = document.querySelector(".user-avatar");

  if (userNameElem) userNameElem.textContent = name;
  if (userAvatarElem) {
    userAvatarElem.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ff2770&color=fff`;
  }
}
updateHeader();

// Toggle sidebar visibility
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('main-content');
  sidebar.classList.toggle('open');
  mainContent.classList.toggle('shifted');
}

// Show the selected section and hide others
function showSection(sectionId) {
  const sections = [
    '.dashboard-welcome',
    '#myinfo-section',
    '#choose-section-section',
    '#mycourses-section',
    '#attendance-section',
    '#grades-section',
    '#feedback-section',
    '#announcements-section',
    '#links-section',
    '#materials-section'
  ];

  sections.forEach(selector => {
    const element = document.querySelector(selector);
    if (element) element.style.display = 'none';
  });

  const targetSection = document.getElementById(sectionId) || document.querySelector(sectionId);
  if (targetSection) {
    targetSection.style.display = 'block';
  }

  if (sectionId === 'mycourses-section') {
    loadMyCourses();
  } else if (sectionId === 'attendance-section') {
    loadAttendance();
  } else if (sectionId === 'grades-section') {
    loadGrades();
  } else if (sectionId === 'feedback-section') {
    loadFacultyListForFeedback();
  }
}

// Fetch student profile to get their current section
async function loadStudentProfile() {
  try {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const profile = await res.json();

    if (profile.section) {
      document.getElementById("section").value = profile.section;
      localStorage.setItem("studentSection", profile.section);
    }

    document.querySelector(".user-name").textContent = profile.name;
    document.getElementById("name").value = profile.name;
    document.getElementById("email").value = profile.email;

  } catch (err) {
    console.error("Profile load error:", err);
  }
}

// Load and display the student's enrolled courses based on their section
async function loadMyCourses() {
  const tbody = document.getElementById("myCoursesTable");
  tbody.innerHTML = "<tr><td colspan='3'>Loading courses...</td></tr>";

  try {
    const res = await fetch(`${API_BASE}/my-courses`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const courses = await res.json();

    tbody.innerHTML = "";

    if (courses.length === 0) {
      tbody.innerHTML = "<tr><td colspan='3'>No courses found for your section.</td></tr>";
      return;
    }

    courses.forEach(course => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${course.course_code}</td>
        <td>${course.course_name}</td>
        <td>${course.faculty_name || "TBA"}</td>
      `;
      tbody.appendChild(row);
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = "<tr><td colspan='3'>Error loading courses.</td></tr>";
  }
}

// Update faculty preview - making it dynamic based on all courses for that section
async function updateFacultyPreview() {
  const section = document.getElementById("section").value;
  if (!section) return;

  const tbody = document.querySelector("#choose-section-section tbody");
  tbody.innerHTML = "<tr><td colspan='3'>Fetching preview...</td></tr>";

  try {
    // We can reuse a public course endpoint or add a specific preview one
    // For simplicity, let's fetch all and filter client-side for the preview
    const res = await fetch(`${BASE_URL}/api/admin/courses`);
    const allCourses = await res.json();
    const sectionCourses = allCourses.filter(c => c.section === section);

    tbody.innerHTML = "";
    if (sectionCourses.length === 0) {
      tbody.innerHTML = "<tr><td colspan='3'>No courses listed for this section yet.</td></tr>";
      return;
    }

    sectionCourses.forEach(c => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${c.course_code}</td><td>${c.course_name}</td><td>${c.faculty_name || 'TBA'}</td>`;
      tbody.appendChild(row);
    });
  } catch (err) {
    tbody.innerHTML = "<tr><td colspan='3'>Error loading preview.</td></tr>";
  }
}

async function loadAttendance() {
  const tbody = document.getElementById("attendance-table-body");
  tbody.innerHTML = "";

  const staticAttendance = [
    { course_name: "CS101 - Intro to Programming", total: 40, attended: 38 },
    { course_name: "MAT202 - Discrete Mathematics", total: 32, attended: 28 },
    { course_name: "PHY301 - Engineering Physics", total: 45, attended: 30 },
    { course_name: "ENG101 - Academic English", total: 20, attended: 20 }
  ];

  staticAttendance.forEach(item => {
    const percentage = ((item.attended / item.total) * 100).toFixed(1);
    const row = document.createElement("tr");

    // Color coding based on attendance health
    let color = "#22c55e"; // Green for safe
    if (percentage < 85) color = "#f59e0b"; // Orange warning
    if (percentage < 75) color = "#ef4444"; // Red critical

    row.innerHTML = `
      <td>${item.course_name}</td>
      <td>${item.total}</td>
      <td>${item.attended}</td>
      <td style="color: ${color}; font-weight: bold;">${percentage}%</td>
    `;
    tbody.appendChild(row);
  });
}

async function loadGrades() {
  const tbody = document.getElementById("grades-table-body");
  tbody.innerHTML = "";

  const staticGrades = [
    { semester: "Fall 2024", course_name: "CS101 - Intro to Programming", grade: "A" },
    { semester: "Fall 2024", course_name: "MAT202 - Discrete Mathematics", grade: "B+" },
    { semester: "Fall 2024", course_name: "PHY301 - Engineering Physics", grade: "A-" },
    { semester: "Fall 2024", course_name: "ENG101 - Academic English", grade: "A" }
  ];

  staticGrades.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.semester}</td>
      <td>${item.course_name}</td>
      <td style="font-weight: bold; color: #ff2770;">${item.grade}</td>
    `;
    tbody.appendChild(row);
  });
}

async function loadFacultyListForFeedback() {
  const select = document.getElementById("feedback-faculty");
  try {
    const res = await fetch(`${API_BASE}/faculties`, { headers: { Authorization: `Bearer ${token}` } });
    const faculties = await res.json();
    select.innerHTML = '<option value="" disabled selected>Select faculty</option>';
    faculties.forEach(f => {
      const opt = document.createElement("option");
      opt.value = f.id;
      opt.textContent = f.name;
      select.appendChild(opt);
    });
  } catch (e) { console.error("Error loading faculty for feedback", e); }
}

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {

  loadStudentProfile();

  document.getElementById("feedback-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const faculty_id = document.getElementById("feedback-faculty").value;
    const rating = document.getElementById("feedback-rating").value;
    const comment = document.getElementById("feedback-comment").value;

    try {
      const res = await fetch(`${API_BASE}/submit-feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ faculty_id, rating, comment })
      });

      if (res.ok) {
        alert("Thank you for your feedback!");
        document.getElementById("feedback-form").reset();
      } else {
        alert("Failed to submit feedback");
      }
    } catch (err) { alert("Server error"); }
  });

  document.getElementById("section-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const section = document.getElementById("section").value;

    try {
      const res = await fetch(`${API_BASE}/enroll-section`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ section })
      });

      if (res.ok) {
        localStorage.setItem("studentSection", section);
        alert(`You have been enrolled in Section ${section}!`);
        showSection('mycourses-section');
      } else {
        alert("Failed to enroll in section");
      }
    } catch (err) {
      alert("Server error");
    }
  });

  // Sidebar toggle for submenus
  document.querySelectorAll('.has-submenu > a').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      this.parentElement.classList.toggle('open');
    });
  });

  showSection('.dashboard-welcome');

  // =============== REAL-TIME ANNOUNCEMENTS ===============
  const socket = io(BASE_URL);

  socket.on("new-activity", (activity) => {
    console.log("Student received activity:", activity);

    // Check if it's an announcement (case-insensitive check)
    const isAnnouncement =
      activity.type === 'comment' ||
      activity.action.toLowerCase().includes("announcement") ||
      activity.action.toLowerCase().includes("posted");

    if (isAnnouncement) {
      console.log("Confirmed as announcement. Updating UI...");
      const announcementsList = document.getElementById("announcements-list");

      // Remove placeholder
      if (announcementsList.querySelector("p") && announcementsList.querySelector("p").textContent.includes("No new")) {
        announcementsList.innerHTML = "";
      }

      const announcement = document.createElement("div");
      announcement.className = "announcement-card";
      announcement.style.cssText = "background: #fff; border-left: 5px solid #ff2770; padding: 15px; margin-bottom: 15px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border-radius: 4px;";

      announcement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong style="color: #ff2770; font-size: 0.8rem; letter-spacing: 1px;">NEW ANNOUNCEMENT</strong>
                <small style="color: #94a3b8;">${activity.time || 'Just now'}</small>
            </div>
            <p style="color: #1e293b; line-height: 1.5;">${activity.action}</p>
        `;

      announcementsList.prepend(announcement);

      // Alert the user if they aren't looking at announcements
      const currentSection = localStorage.getItem("currentSection");
      if (currentSection !== 'announcements-section') {
        alert("📢 Faculty Announcement: " + activity.action);
      }
    }

    // Check if it's a file upload (New Assignment or Material)
    if (activity.action.includes("files:")) {
      console.log("Material upload detected. Updating Materials section...");
      const materialsList = document.getElementById("materials-list");
      const noMaterials = document.getElementById("no-materials");

      if (noMaterials) noMaterials.remove();

      const materialCard = document.createElement("div");
      materialCard.style.cssText = "background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; border-left: 5px solid #22c55e;";

      materialCard.innerHTML = `
            <div>
                <strong style="color: #333;">${activity.action.split(' (')[0]}</strong><br>
                <small style="color: #666;">${activity.action.match(/\(([^)]+)\)/)[0]} • ${activity.time}</small>
            </div>
            <button style="background: #22c55e; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                <i class='bx bx-download'></i> Download
            </button>
        `;

      materialsList.prepend(materialCard);

      // Notification for materials if not on that page
      const currentSection = localStorage.getItem("currentSection");
      if (currentSection !== 'materials-section') {
        alert("📁 New course materials have been uploaded!");
      }
    }
  });

  // Helper to store current section
  const originalShowSection = window.showSection;
  window.showSection = (id) => {
    localStorage.setItem("currentSection", id);
    originalShowSection(id);
  };
});

// Expose updateFaculty for the HTML onchange
window.updateFaculty = updateFacultyPreview;
