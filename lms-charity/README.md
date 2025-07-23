# Charity LMS Platform

A comprehensive Learning Management System (LMS) designed to facilitate online education with features for course management, student enrollment, assignment grading, and more. This platform is built with a focus on usability, scalability, and modern web technologies.

## Features

-   **User Authentication & Authorization**: Secure login, registration, and role-based access control (Student, Instructor, Admin).
-   **Course Management**: Create, update, and delete courses with detailed descriptions, modules, lessons (video, text, quiz, assignment).
-   **Student Enrollment**: Students can enroll in courses, track their progress, and earn certificates.
-   **Assignment Grading**: Instructors can view and grade student submissions, provide feedback, and utilize AI-powered essay scoring.
-   **Dashboard & Analytics**: Intuitive dashboards for instructors and administrators to monitor course performance, student engagement, and grading progress.
-   **Discussion Forums**: Integrated discussion forums for each course to foster communication and collaboration.
-   **Resource Management**: Attach various types of resources (PDFs, documents, links) to lessons.
-   **Certificate Generation**: Automated certificate generation for course completion.
-   **Responsive Design**: Optimized for various devices and screen sizes.

## Technologies Used

### Frontend
-   **React**: A JavaScript library for building user interfaces.
-   **Vite**: A fast build tool for modern web projects.
-   **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
-   **Axios**: Promise-based HTTP client for the browser and Node.js.
-   **Framer Motion**: A production-ready motion library for React.

### Backend
-   **Node.js**: JavaScript runtime environment.
-   **Express.js**: A fast, unopinionated, minimalist web framework for Node.js.
-   **MongoDB**: A NoSQL document database for data storage.
-   **Mongoose**: An ODM (Object Data Modeling) library for MongoDB and Node.js.
-   **JWT (JSON Web Tokens)**: For secure authentication.
-   **Cloudinary**: For cloud-based media management (image/video/document uploads).
-   **Nodemailer**: For sending emails.

### AI/ML
-   **Python (Flask)**: A micro web framework for the ML API.
-   **ML Model**: (Details about the specific ML model for essay scoring, if applicable, would go here).

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

-   Node.js (LTS version recommended)
-   npm (Node Package Manager) or Yarn
-   MongoDB instance (local or cloud-hosted like MongoDB Atlas)
-   Cloudinary account (for file uploads)
-   Python 3.x (for the ML API)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/charity-lms.git
    cd charity-lms
    ```

2.  **Backend Setup:**
    ```bash
    cd server
    npm install
    ```
    Create a `.env` file in the `server` directory and add your environment variables:
    ```
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    # Optional: For email services
    EMAIL_USER=your_email@example.com
    EMAIL_PASS=your_email_password
    # Frontend URL (for CORS)
    CLIENT_URL=http://localhost:5173
    ```

3.  **Frontend Setup:**
    ```bash
    cd ../client
    npm install
    ```
    Create a `.env` file in the `client` directory and add your environment variables:
    ```
    VITE_API_URL=http://localhost:5000/api
    # Add any other client-side specific environment variables here
    ```

4.  **ML API Setup (Optional - for AI Essay Scoring):**
    ```bash
    cd ../ml_api
    pip install -r requirements.txt
    ```
    Run the Flask API:
    ```bash
    python app.py
    ```
    Note: Ensure the ML API is running on a port accessible by your backend (e.g., `http://localhost:5001`). You might need to configure this in your backend.

### Running the Application

1.  **Start the Backend Server:**
    ```bash
    cd server
    npm run dev
    ```

2.  **Start the Frontend Development Server:**
    ```bash
    cd ../client
    npm run dev
    ```

The frontend should now be running at `http://localhost:5173` (or another port if 5173 is in use).

## Contributing

We welcome contributions to the Charity LMS Platform! If you're interested in improving the project, please follow these guidelines.

### How to Contribute

1.  **Fork the repository.**
2.  **Clone your forked repository** to your local machine.
3.  **Create a new branch** for your feature or bug fix:
    ```bash
    git checkout -b feature/your-feature-name
    # or
    git checkout -b bugfix/your-bug-fix
    ```
4.  **Make your changes** and test them thoroughly.
5.  **Commit your changes** with a clear and concise message:
    ```bash
    git commit -m "feat: Add new feature X"
    # or
    git commit -m "fix: Resolve bug Y"
    ```
    (Please adhere to Conventional Commits for commit messages).
6.  **Push your branch** to your forked repository:
    ```bash
    git push origin feature/your-feature-name
    ```
7.  **Open a Pull Request** to the `main` branch of the original repository.

### Code Style

-   Follow the existing code style and conventions used in the project.
-   Ensure your code is well-commented where necessary.
-   Write clear, concise, and maintainable code.

### Reporting Bugs

If you find a bug, please open an issue on the GitHub repository. Provide a detailed description of the bug, steps to reproduce it, and any relevant error messages.

### Feature Requests

Feel free to open an issue for feature requests. Describe the feature, why it would be useful, and any potential implementation ideas.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
