# Interview Master

**Interview Master** is a comprehensive, AI-powered platform designed to help you ace your job interviews. From crafting the perfect resume to practicing with AI-driven mock interviews, we provide the tools you need to succeed.

## 🚀 Features

### 📄 Resume Tools
*   **Resume Builder:** Create professional, ATS-friendly resumes with an intuitive builder interface.
*   **Resume Analyzer:** Get instant feedback on your resume. Our AI scanner checks for keyword optimization, formatting, and content quality to give you a match score.

### 🤖 AI Mock Interviews
*   **HR Round Simulation:** Practice behavioral sticking points with our AI interviewer.
*   **Real-time Emotion Analytics:** Uses facial expression recognition (via `face-api.js`) to provide feedback on your confidence and engagement during the interview.

### 📚 Comprehensive Learning
*   **Structured Curriculum:** tailored paths for Data Structures & Algorithms, System Design, and Behavioural rounds.
*   **Assessment:** Evaluate your skills with quizzes and coding challenges.

## 🛠️ Tech Stack
*   **Frontend:** HTML5, CSS3, JavaScript (Vanilla + Libraries like `GSAP`, `Chart.js`, `face-api.js`)
*   **Backend:** Python (Flask)
*   **Database:** MySQL

## ⚙️ Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mandadisakethreddy-cmd/amazon.git
    cd amazon
    ```

2.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Database Configuration:**
    *   Ensure MySQL is running.
    *   Create a database named `interview_master_db`.
    *   Update `app.py` with your MySQL credentials (default password set to `12345`).

4.  **Run the Application:**
    ```bash
    python app.py
    ```
    Access the app at `http://localhost:5000`.

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request.
