const express = require("express");
const cors = require("cors");
const http = require("http");
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
app.use(express.json());

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

const PORT = 5000;
server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
