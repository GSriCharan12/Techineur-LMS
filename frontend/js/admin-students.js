const API = "http://localhost:5000/api/admin/students";

// ================= AUTH CHECK =================
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "admin") {
  window.location.replace("admin-login.html");
}

// ================= DOM ELEMENTS =================
const tableBody = document.querySelector("table tbody");
const modal = document.getElementById("studentModal");
const form = document.getElementById("studentForm");
const studentName = document.getElementById("studentName");
const studentEmail = document.getElementById("studentEmail");
const closeBtn = document.querySelector(".close");
const addBtn = document.getElementById("addStudentBtn");

// ================= LOAD STUDENTS =================
// ================= LOAD STUDENTS =================
let allStudents = [];

async function loadStudents() {
  try {
    const res = await fetch(API, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.clear();
      window.location.replace("admin-login.html");
      return;
    }

    allStudents = await res.json();
    tableBody.innerHTML = "";

    allStudents.forEach(s => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${s.id}</td>
        <td>${s.name}</td>
        <td>${s.email}</td>
        <td>${s.section || "-"}</td>
        <td class="action-buttons">
          <button class="edit-btn" data-id="${s.id}">Edit</button>
          <button class="delete-btn" data-id="${s.id}">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    bindActionButtons();
  } catch (err) {
    console.error(err);
    alert("Failed to load students");
  }
}

// ================= ADD STUDENT =================
form.addEventListener("submit", async e => {
  e.preventDefault();

  const id = document.getElementById("studentIndex").value;
  const name = studentName.value.trim();
  const email = studentEmail.value.trim();
  const password = document.getElementById("studentPassword").value.trim();
  const section = document.getElementById("studentSection").value;

  if (!id && !password) { alert("Password required for new student"); return; }

  const method = id ? "PUT" : "POST";
  const url = id ? `${API}/${id}` : API;

  // Build request body - only include password if provided
  const requestBody = { name, email, section };
  if (password) {
    requestBody.password = password;
  }

  console.log("Submitting:", method, url, requestBody);

  try {
    const res = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    const data = await res.json();
    console.log("Server response:", data);

    if (!res.ok) {
      alert(data.message || "Operation failed");
      return;
    }

    alert("Student saved successfully!");
    modal.style.display = "none";
    form.reset();
    loadStudents();

  } catch (err) {
    console.error("Error:", err);
    alert("Server error");
  }
});

// ================= ACTION BUTTONS =================
function bindActionButtons() {
  // Delete
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      if (!confirm("Delete this student?")) return;
      try {
        const res = await fetch(`${API}/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) { alert("Delete failed"); return; }
        loadStudents();
      } catch (err) { alert("Server error"); }
    };
  });

  // Edit
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const s = allStudents.find(student => student.id == id);
      if (!s) return;

      console.log("Edit clicked for student:", id);
      form.reset();
      document.getElementById("modalTitle").textContent = "Edit Student";
      document.getElementById("studentIndex").value = s.id;
      document.getElementById("studentName").value = s.name;
      document.getElementById("studentEmail").value = s.email;
      document.getElementById("studentSection").value = s.section || "";
      document.getElementById("studentPassword").required = false;
      document.getElementById("studentPassword").placeholder = "Leave blank to keep current";

      // Make studentId readonly during edit (it's auto-generated)
      const sidField = document.getElementById("studentId");
      if (sidField) {
        sidField.value = s.id;
        sidField.readOnly = true;
        sidField.style.backgroundColor = "#f0f0f0";
      }

      modal.style.display = "flex";
      console.log("Modal should be visible now");
    };
  });
}

// ================= MODAL HANDLING =================
addBtn.onclick = () => {
  form.reset();
  document.getElementById("modalTitle").textContent = "Add Student";
  document.getElementById("studentIndex").value = "";
  document.getElementById("studentPassword").required = true;
  document.getElementById("studentPassword").placeholder = "Set login password";

  const sidField = document.getElementById("studentId");
  if (sidField) {
    sidField.readOnly = false;
    sidField.style.backgroundColor = "";
    sidField.value = "";
  }

  modal.style.display = "flex";
};

closeBtn.onclick = () => {
  modal.style.display = "none";
};

window.onclick = e => {
  if (e.target === modal) modal.style.display = "none";
};

// ================= INIT =================
loadStudents();
