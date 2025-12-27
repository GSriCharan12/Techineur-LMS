document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const inputs = document.querySelectorAll("#loginForm input");
  const email = inputs[0].value.trim();
  const password = inputs[1].value.trim();

  try {
    const BASE_URL = window.API_BASE_URL || "http://localhost:5000";
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Login failed");
      return;
    }

    localStorage.clear(); // clean slate
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("name", data.name);

    if (data.role === 'admin') {
      window.location.href = "admin-dashboard.html";
      localStorage.setItem("role", data.role);
      localStorage.setItem("name", data.name);

      console.log("Login Success. Role:", data.role);

      if (data.role === 'admin') {
        window.location.href = "admin-dashboard.html";
      } else if (data.role === 'student') {
        window.location.href = "student-dashboard.html";
      } else if (data.role === 'faculty') {
        window.location.href = "faculty-dashboard.html";
      } else {
        // Fallback or other roles
        console.warn("Unknown role:", data.role);
        window.location.href = "index.html";
      }

    } catch (err) {
      alert("Server error");
    }
  });

