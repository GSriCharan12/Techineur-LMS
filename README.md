# Techineur LMS 🎓

A full-stack Learning Management System (LMS) designed to streamline academic management for Administrators, Faculty, and Students using real-time technologies.

## 🚀 Key Features

*   **Role-Based Access Control:** Secure, distinct dashboards for Admins, Faculty, and Students powered by JWT authentication.
*   **Real-Time Updates:** Instant notifications for feedback, grades, and dashboard stats using **Socket.io**.
*   **Admin Command Center:** Manage students, faculty, courses, and sections with full CRUD capabilities.
*   **Student Portal:** View attendance, check grades, and submit anonymous feedback to faculty.
*   **Faculty Dashboard:** Manage grades and view assigned course loads.
*   **Data Visualization:** Live statistics and metrics for university administration.

## 🛠️ Tech Stack

*   **Frontend:** HTML5, Vanilla CSS, JavaScript
*   **Backend:** Node.js, Express.js
*   **Database:** MySQL (Relational Schema)
*   **Real-Time:** Socket.io (WebSockets)
*   **Security:** Bcrypt (hashing), JWT (tokens), dotenv

## 📸 Screenshots

*(Upload your screenshots to an 'assets' folder or just drag-and-drop them into the GitHub editor to generate links here)*

| Admin Dashboard | Student Portal |
| :---: | :---: |
| ![Admin Dashboard](placeholder-link) | ![Student View](placeholder-link) |

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/GSriCharan12/Techineur-LMS.git
    cd Techineur-LMS
    ```

2.  **Install Backend Dependencies**
    ```bash
    cd backend
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the `backend` folder:
    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=lms_db
    PORT=5000
    JWT_SECRET=your_jwt_secret
    ADMIN_EMAIL=admin@gmail.com
    ADMIN_PASSWORD=admin123
    ```

4.  **Database Setup**
    *   Import the provided SQL schema or run the setup scripts in `backend/` to initialize tables.

5.  **Run the Server**
    ```bash
    node server.js
    ```
    *Server runs on port 5000*

6.  **Launch**
    *   Open `index.html` (or `html/newlogin.html`) in your browser.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and create a pull request.

## 👤 Author

**Sri Charan**
*   [GitHub Profile](https://github.com/GSriCharan12)
