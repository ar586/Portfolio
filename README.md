# Intelligent Portfolio 🚀

A modern, dynamic personal portfolio website powered by **Next.js 16** and **FastAPI**, featuring real-time data integration, an intelligent chatbot, and interactive visualizations.

## 🌟 Features

-   **Dynamic GitHub Activity**: Real-time visualization of repositories, contributions, and language statistics using the GitHub API.
-   **LeetCode Integration**: Live tracking of problem-solving statistics and heatmaps.
-   **Intelligent Chatbot**: A RAG-powered (Retrieval-Augmented Generation) assistant that answers questions about my background, skills, and projects using **LangChain**, **Qdrant**, and **Google Gemini**.
-   **Interactive UI**: Built with **Framer Motion** for smooth animations and **Recharts** for data visualization.
-   **Modern Design**: Glassmorphism aesthetic implemented with **Tailwind CSS v4**.

## 🛠️ Tech Stack

### Frontend
-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **UI Library**: [React 19](https://react.dev/)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **Icons**: [Lucide React](https://lucide.dev/) & React Icons
-   **HTTP Client**: Axios

### Backend
-   **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
-   **Database**: [MongoDB](https://www.mongodb.com/) (Data persistence)
-   **Vector Database**: [Qdrant](https://qdrant.tech/) (For RAG)
-   **AI/ML**: LangChain, Google Gemini (GenAI)
-   **Task Automation**: Python scripts for data syncing.

## 🚀 Getting Started

### Prerequisites
-   Node.js (v18+)
-   Python (v3.10+)
-   MongoDB (Running locally or Atlas)
-   Qdrant (Running locally or Cloud)
-   GitHub API Key (Optional, for higher rate limits)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <your-repo-url>
    cd Portfolio
    ```

2.  **Environment Setup**:
    -   Create a `.env` file in `backend/` and configure:
        ```env
        mongo_uri=mongodb://localhost:27017/
        GEMINI_API_KEY=your_gemini_key
        # Add other necessary keys
        ```

3.  **Install Backend Dependencies**:
    ```bash
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    ```

4.  **Install Frontend Dependencies**:
    ```bash
    cd frontend
    npm install
    ```

### Running the App

You can start both services using the provided helper script:

```bash
./start_app.sh
```

Or run them individually:

**Backend**:
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

**Frontend**:
```bash
cd frontend
npm run dev
```

The application will be available at:
-   **Frontend**: `http://localhost:3000`
-   **Backend Docs**: `http://localhost:8000/docs`

## 🔄 Data Synchronization

To populate the portfolio with initial data (GitHub stats, LeetCode stats), run the sync script:

```bash
python backend/sync_portfolio_data.py
```

## 📄 License
[MIT](LICENSE)
