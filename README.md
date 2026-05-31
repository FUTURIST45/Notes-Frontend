# Notes Frontend

This is the frontend for the Secure Personal Notes App. It gives users a simple interface to register, log in, and manage their personal notes.

## Project Role

The frontend is the part of the application the user interacts with. It displays the login page, registration page, and dashboard. After login, it stores the JWT token locally and sends it to the backend when the user works with notes.

## Main Features

- Registration page.
- Login page.
- Protected dashboard.
- Create, edit, and delete notes.
- Logout button.
- Simple responsive interface.

## Authentication Flow

When a user registers or logs in, the frontend receives a JWT token from the backend. The token is saved in local storage for this basic school project.

When the user opens the dashboard or performs note actions, the frontend sends the token with the request. If there is no token, the dashboard is blocked and the user is redirected to the login page.

## Connection To Backend

The frontend communicates with the backend API for authentication and note actions. The backend is responsible for checking the token and making sure users only access their own notes.

## Technologies

- React
- TypeScript
- Vite
- React Router
