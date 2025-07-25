# EduCharity LMS

A modern, open-source Learning Management System (LMS) designed to empower educators, students, and charitable organizations. EduCharity LMS enables seamless online learning, course management, student engagement, and charitable impact—all in one platform.

---

## 🚀 Features

- **User Roles:** Student, Instructor, and Admin with secure authentication and role-based access.
- **Course Management:** Create, edit, and organize courses with modules, lessons (video, text, quiz, assignment), and resources.
- **Student Experience:** Enroll in courses, track progress, participate in discussions, and earn certificates.
- **Instructor Tools:** Grade assignments, manage students, view analytics, and moderate discussions.
- **Admin Dashboard:** Approve instructors, manage users, oversee platform activity, and review contact messages.
- **Discussion Forums:** Built-in forums for each course to foster community and Q&A.
- **Certificate Generation:** Automated, downloadable certificates for course completion.
- **AI/ML Integration:** Optional essay scoring via a Python/Flask ML API.
- **Responsive UI:** Mobile-friendly, accessible, and visually appealing.
- **Cloud Storage:** Media uploads via Cloudinary.

---

## 🏗️ System Architecture

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Axios
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, Cloudinary, Nodemailer
- **ML API (Optional):** Python, Flask

---

## 📂 Project Structure

```
eduedu/
  lms-charity/
    client/      # Frontend React app
    server/      # Backend Node/Express API
    ml_api/      # Python/Flask ML API (optional)
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js (LTS)
- npm or Yarn
- MongoDB (local or Atlas)
- Cloudinary account
- Python 3.x (for ML API)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/educharity-lms.git
cd eduedu/lms-charity
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in `server/`:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
CLIENT_URL=http://localhost:5173
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```
Create a `.env` file in `client/`:
```
VITE_API_URL=http://localhost:5000/api
```

### 4. ML API Setup (Optional)
```bash
cd ../ml_api
pip install -r requirements.txt
python app.py
```

### 5. Run the App
- **Backend:**
  ```bash
  cd server
  npm run dev
  ```
- **Frontend:**
  ```bash
  cd ../client
  npm run dev
  ```
- **ML API:** (if used)
  ```bash
  cd ../ml_api
  python app.py
  ```

Visit the frontend at [http://localhost:5173](http://localhost:5173)

---

## 🧑‍💻 Open Source Contribution

We welcome contributions from the community! To contribute:

1. **Fork** this repository.
2. **Clone** your fork:
   ```bash
   git clone https://github.com/your-username/educharity-lms.git
   ```
3. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature
   ```
4. **Make your changes** and add tests if needed.
5. **Commit** with a clear message:
   ```bash
   git commit -m "feat: Add X" # or "fix: Y"
   ```
6. **Push** to your fork:
   ```bash
   git push origin feature/your-feature
   ```
7. **Open a Pull Request** to the `main` branch.

**Guidelines:**
- Follow the existing code style (Prettier, ESLint, comments).
- Write clear, maintainable code.
- Add tests for new features if possible.
- Be respectful and constructive in code reviews and discussions.

**Reporting Issues:**
- Use GitHub Issues for bugs or feature requests.
- Provide steps to reproduce, screenshots, and error logs if possible.

---

## 📄 License

This project is licensed under the MIT License:

```
MIT License

Copyright (c) 2024 EduCharity

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

Made with ❤️ by EduCharity. Empowering learning, enabling impact. 🌍✨
