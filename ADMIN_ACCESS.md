# Billun Admin Access Setup

## ✅ Admin User Created Successfully!

### Admin Credentials:
- **Email**: `admin@billun.com`
- **Password**: `admin123456`
- **Role**: `admin`
- **Name**: Super Admin
- **Company**: Billun
- **Phone**: +33123456789

### Access URLs:
- **Frontend (Billun Dashboard)**: http://localhost:3001
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: localhost:5432 (PostgreSQL)

### Container Status:
All containers are running successfully:
- `fiverr-frontend-1` - Next.js frontend on port 3001
- `fiverr-backend-1` - FastAPI backend on port 8000  
- `fiverr-db-1` - PostgreSQL database on port 5432

### Available API Endpoints:
- `POST /auth/token` - Login (get access token)
- `POST /auth/register` - Register new user
- `POST /auth/create-admin` - Create admin user
- `GET /users/` - List all users
- And all other CRUD endpoints for materials, anomalies, etc.

### How to Use:
1. Open http://localhost:3001 in your browser
2. Login with the admin credentials above
3. Access the dashboard with full admin privileges
4. Manage users, materials, anomalies, and view statistics

### Docker Commands:
```bash
# Start all services
docker-compose up -d

# Stop all services  
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Rebuild and restart
docker-compose build && docker-compose up -d
```

### Project Structure:
- Frontend: Modern Next.js app with TypeScript, Tailwind CSS, authentication
- Backend: FastAPI with JWT authentication, SQLAlchemy ORM, PostgreSQL
- Features: User management, material tracking, anomaly reporting, statistics, APK section

### GitHub Repository:
The project has been pushed to: https://github.com/Holy-C-afk/Fiverradam.git

---
**Note**: Change the admin password in production for security!
