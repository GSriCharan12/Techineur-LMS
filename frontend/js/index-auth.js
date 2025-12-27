// index-auth.js
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (token && role) {
  if (role === "student") {
    window.location.href = "student-dashboard.html";
  } 
  else if (role === "admin") {
    window.location.href = "admin-dashboard.html";
  }
  // faculty can be added later
}
