# Phase 03 — Frontend Authentication & Project Integration

## Implemented

- Login screen.
- Email/username + password input.
- Protected routes.
- Session storage for access/refresh tokens.
- Automatic access-token refresh.
- Current-user profile loading.
- Logout.
- Preview login for GitHub Pages.
- Authenticated project list.
- Create project dialog.
- Edit project dialog.
- Archive confirmation dialog.
- Real project API integration.
- Temporary preview CRUD when running on GitHub Pages.
- Modular auth/session/dialog/project files.

## Production behavior

When the web app is running with My Field Server:

1. Login calls POST /api/auth/login.
2. Access/refresh tokens are stored for the browser session.
3. Protected routes require a valid session.
4. API requests send the Bearer access token.
5. A 401 triggers one refresh attempt.
6. Projects are read/written in PostgreSQL/PostGIS.

## GitHub Pages behavior

GitHub Pages runs with VITE_PREVIEW_MODE=true.

The login page provides a dedicated preview-entry button. Preview projects live only in browser memory and are not written to the local server.

## Admin username

Set INITIAL_ADMIN_USERNAME in the local .env file to the email or username you want to use.

Do not commit the real password or JWT secret.
