document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name");

    if (!token || role !== "faculty") {
        window.location.href = "faculty-login.html";
        return;
    }

    // Update user info
    document.getElementById("facultyName").textContent = name;
    document.getElementById("facultyRole").textContent = "Faculty Member";

    const BASE_URL = window.API_BASE_URL || "http://localhost:5000";
    // Initialize Socket.io
    const socket = io(BASE_URL);

    socket.on("connect", () => {
        console.log("Connected to real-time server");
    });

    // Listen for real-time activity updates
    socket.on("new-activity", (activity) => {
        addActivityItem(activity, true);
        // Optionally update stats too if the activity implies a change
        if (activity.type === 'check') {
            // Just an example: increment assignments count if something was graded
            const assignElem = document.getElementById("statAssignments");
            assignElem.textContent = parseInt(assignElem.textContent) + 1;
        }
    });

    // Fetch initial data
    fetchDashboardData();

    async function fetchDashboardData() {
        try {
            const response = await fetch(`${BASE_URL}/api/faculty/dashboard`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Failed to fetch dashboard data");

            const data = await response.json();
            updateUI(data);
        } catch (err) {
            console.error(err);
            document.getElementById("activityList").innerHTML = `<p style="color: red; padding: 20px;">Error loading data</p>`;
        }
    }

    function updateUI(data) {
        // Update User info
        if (data.facultyInfo) {
            document.getElementById("facultyName").textContent = data.facultyInfo.name;
            document.getElementById("facultyRole").textContent = `Faculty Member • Section ${data.facultyInfo.section || 'N/A'}`;
        }

        // Update Stats
        document.getElementById("statCourses").textContent = data.stats.activeCourses;
        document.getElementById("statStudents").textContent = data.stats.totalStudents;
        document.getElementById("statAssignments").textContent = data.stats.assignments;
        document.getElementById("statAvgGrade").textContent = data.stats.avgGrade;

        // Update Activity
        const activityList = document.getElementById("activityList");
        activityList.innerHTML = "";
        data.recentActivity.forEach(activity => {
            addActivityItem(activity);
        });
    }

    function addActivityItem(activity, highlight = false) {
        const activityList = document.getElementById("activityList");

        const item = document.createElement("div");
        item.className = "activity-item";
        if (highlight) {
            item.style.backgroundColor = "#f0f9ff";
            item.style.borderLeft = "4px solid #3b82f6";
        }

        const iconMap = {
            'check': 'fa-check',
            'upload': 'fa-upload',
            'comment': 'fa-comment',
            'plus': 'fa-plus',
            'info': 'fa-info-circle'
        };

        const icon = iconMap[activity.type] || 'fa-bell';

        item.innerHTML = `
      <div class="activity-icon"><i class="fas ${icon}"></i></div>
      <div class="activity-content">
        <p>${activity.action}</p>
        <small>${activity.time}</small>
      </div>
    `;

        activityList.prepend(item);

        if (highlight) {
            setTimeout(() => {
                item.style.backgroundColor = "";
                item.style.transition = "background-color 2s";
            }, 2000);
        }
    }

    // Handle Quick Actions
    const fileUpload = document.getElementById("fileUpload");
    const actionBtns = document.querySelectorAll(".action-btn");

    actionBtns.forEach(btn => {
        btn.addEventListener("click", async (e) => {
            e.preventDefault();
            const actionText = btn.querySelector("span").textContent.trim();
            console.log("Action clicked:", actionText);

            // 📂 Trigger File Picker for specific actions
            if (actionText === "New Assignment" || actionText === "Upload Materials") {
                fileUpload.setAttribute("data-action", actionText);
                fileUpload.click();
                return;
            }

            // 📊 View Grades Modal
            if (actionText === "View Grades") {
                document.getElementById("gradesModal").style.display = "flex";
                broadcastActivity(`Viewed Student Grades`, "check");
                return;
            }

            // 📣 Interactive Announcement
            if (actionText === "Make Announcement") {
                const message = prompt("Enter your announcement for students:");
                if (message) {
                    broadcastActivity(`ANNOUNCEMENT: ${message}`, "comment");
                }
                return;
            }

            // Normal fallback actions
            broadcastActivity(`You performed: ${actionText}`, getIconType(actionText));
        });
    });

    // 📁 Handle File Selection
    fileUpload.addEventListener("change", async () => {
        if (fileUpload.files.length === 0) return;

        const actionText = fileUpload.getAttribute("data-action") || "File Upload";
        const fileNames = Array.from(fileUpload.files).map(f => f.name).join(", ");

        // Broadcast the specific file upload activity
        broadcastActivity(`Published: ${actionText} (${fileUpload.files.length} files: ${fileNames.substring(0, 30)}...)`, "upload");

        // Reset file input for next time
        fileUpload.value = "";
    });

    async function broadcastActivity(action, type) {
        try {
            await fetch(`${BASE_URL}/api/faculty/activity`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ action, type })
            });
        } catch (err) {
            console.error("Failed to post activity", err);
        }
    }

    // Logout logic
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "faculty-login.html";
    });

    function getIconType(text) {
        if (text.includes("Assignment")) return "plus";
        if (text.includes("Materials")) return "upload";
        if (text.includes("Grades")) return "check";
        if (text.includes("Announcement")) return "comment";
        return "info";
    }

    // Modal Close Logic
    document.getElementById("closeGrades").addEventListener("click", () => {
        document.getElementById("gradesModal").style.display = "none";
    });

    window.onclick = (e) => {
        if (e.target === document.getElementById("gradesModal")) {
            document.getElementById("gradesModal").style.display = "none";
        }
    };
});
