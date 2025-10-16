# Unmute World - Full-Stack Application

This is a full-stack version of the Unmute World application, featuring a React frontend and a Node.js/Express/MongoDB backend.

## Prerequisites

- **Node.js**: Version 18.x or higher.
- **npm**: Should be included with Node.js.
- **MongoDB**: A running instance of MongoDB is required for the backend. You can [install it locally](https://www.mongodb.com/try/download/community) or use a cloud service like MongoDB Atlas.

## Running Locally

Follow these steps to get the application running on your local machine.

### 1. Install Dependencies

Install both frontend and backend dependencies from the root directory:

```bash
npm install
```

### 2. Configure Environment Variables

Create a new file named `.env` in the root of the project by copying the content below.

```env
# ===============================================
# Unmute World Environment Variables
# ===============================================

# --- Backend Configuration ---
# Your MongoDB connection string.
# This default works if you have MongoDB running locally on the standard port.
MONGODB_URI=mongodb://127.0.0.1:27017/unmute_world_db

# A secret key for signing JSON Web Tokens (JWT).
# IMPORTANT: Change this to a long, random, and secure string for production.
JWT_SECRET=a_very_secret_key_that_should_be_changed

# The port the backend server will run on.
PORT=5000

# --- Email Configuration (for Password Reset) ---
# See https://nodemailer.com/ for transport options.
# Example for Gmail SMTP:
# Note: For Gmail, you must generate an "App Password" from your Google Account
# security settings and use it for EMAIL_PASS. Your regular password will not work.
# https://support.google.com/accounts/answer/185833
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM="Unmute World <no-reply@unmuteworld.com>"


# --- Frontend Configuration ---
# Your Google Gemini API Key.
# This is loaded by Vite and used in the frontend.
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

- Replace `YOUR_GEMINI_API_KEY_HERE` with your actual Gemini API key.
- Update the `EMAIL_*` variables with your email provider's details.
- If your MongoDB instance is running elsewhere, update `MONGODB_URI` accordingly.

### 3. Run the Application

Run the development script. This will start both the backend server (on port 5000) and the frontend Vite server concurrently.

```bash
npm run dev
```

You should see output indicating that both servers are running. You can now access the application in your browser at the address provided by Vite (usually `http://localhost:5173`).