const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
require("dotenv").config();

const adminRoutes = require("./routes/adminRoutes");
const adminStudentRoutes = require("./routes/adminStudentRoutes");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const facultyRoutes = require("./routes/facultyRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the 'frontend' folder
app.use(express.static(path.join(__dirname, "../frontend")));
// Serve HTML files directly from root (so /admin-login.html works)
app.use(express.static(path.join(__dirname, "../frontend/html")));
// Serve CSS files directly from /css (fixes broken UI on root pages)
app.use("/css", express.static(path.join(__dirname, "../frontend/css")));
// Serve assets from root assets folder
app.use("/assets", express.static(path.join(__dirname, "../assets")));

// Socket.io connection logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Make io accessible in routes
app.set("io", io);

app.use("/api/admin", adminRoutes);
app.use("/api/admin/students", adminStudentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/faculty", facultyRoutes);

// Explicit routes for pages
app.get("/admin-login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/html/admin-login.html"));
});
app.get("/newlogin.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/html/newlogin.html"));
});
app.get("/faculty-login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/html/faculty-login.html"));
});

// Catch-all to serve index.html for any non-API routes
// Fallback to serve index.html for SPA-like navigation, BUT exclude valid files
app.get(/.*/, (req, res) => {
  // If the request accepts html and is not a file (does not contain a dot), serve index.html
  // Otherwise, let it 404 naturally (or be served by express.static if it exists)
  if (req.accepts('html') && !req.path.includes('.')) {
    res.sendFile(path.join(__dirname, "../frontend/html/index.html"));
  } else {
    // Since express.static is above, if we got here, the file doesn't exist.
    res.status(404).send("Not Found");
  }
});

const initDB = require("./config/init-db");

initDB().then(() => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
  });
}).catch(err => {
  console.error("FAILED TO INIT DB:", err);
  // Still try to listen, but with errors logged
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log("Server running on port " + PORT + " (with DB errors)");
  });
});
