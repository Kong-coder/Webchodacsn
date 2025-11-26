# TODO: Fix Docker URL Configuration Issues

## Steps to Complete:
- [x] Fix AuthController.java: Change localhost:3000 to frontend:80 for Facebook redirect
- [x] Fix SecurityConfig.java: Change localhost:3000 to frontend:80 in CORS configuration
- [x] Fix Header.js: Change localhost:8080 to /api for API calls (use nginx proxy)
- [x] Fix application.yml: Change datasource URL to use host.docker.internal for database connection
- [x] Fix nginx.conf: Change server_name from localhost to frontend
- [ ] Test docker-compose up --build to verify fixes
