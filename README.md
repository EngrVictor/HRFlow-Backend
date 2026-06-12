# HRFlow-Backend


---

## Public Endpoints (No Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check / API status |
| `POST` | `/auth/login` | Login with email and password |
| `GET` | `/auth/google/callback` | OAuth callback for Google (internal) |
| `POST` | `/auth/set-password` | Set password for social-only users |
| `GET` | `/recruitment` | List all job postings |
| `GET` | `/recruitment/:id` | Get a single job posting by ID |
| `POST` | `/recruitment/:id/applications` | Submit a job application |

---

## Authentication Endpoints (`/auth`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/auth/login` | No | Returns JWT token |
| `POST` | `/auth/link/:provider` | Yes | Link Google/Apple account (`provider` = `google` or `apple`) |
| `POST` | `/auth/set-password` | Yes | Set a password for a social login user |

---

## User Management (`/users`)

All routes require authentication. Role requirements as indicated.

| Method | Endpoint | Required Roles | Description |
|--------|----------|----------------|-------------|
| `GET` | `/users/me` | Authenticated only | Get current user profile |
| `POST` | `/users` | `admin`, `hr_manager`, `manager` | Create a new user (with employee profile) |
| `GET` | `/users` | `admin`, `hr_manager` | List all users |
| `GET` | `/users/:id` | `admin`, `hr_manager`, `manager` | Get user by ID |
| `PUT` | `/users/:id/deactivate` | `admin`, `hr_manager` | Soft-deactivate a user |
| `PUT` | `/users/:id/reactivate` | `admin`, `hr_manager` | Reactivate a user |

---

## Employee Management (`/employees`)

| Method | Endpoint | Required Roles / Permissions | Description |
|--------|----------|-----------------------------|-------------|
| `POST` | `/employees/create` | `employee_profile:create` | Create employee with document uploads |
| `POST` | `/employees` | `employee_profile:create` | Alternative employee creation |
| `GET` | `/employees` | `admin`, `hr_manager` | List all employees |
| `GET` | `/employees/:id` | `employee_profile:read` | Get employee by ID |
| `GET` | `/employees/manager/:managerId` | `admin`, `hr_manager` | Get employees under a specific manager |
| `PATCH` | `/employees/update-employee/:id` | `employee_profile:update` | Update employee details |
| `DELETE` | `/employees/delete-employee/:id` | `employee_profile:delete` | Delete employee |

> **Note:** `employee_profile:read/update/delete` permissions are assigned to `admin`, `hr_manager`, and `manager` (for own team).

---

## Leave Requests (`/leave-requests`)

| Method | Endpoint | Required Roles / Permissions | Description |
|--------|----------|-----------------------------|-------------|
| `POST` | `/leave-requests` | `leave_requests:create` | Submit a leave request |
| `GET` | `/leave-requests` | `admin`, `hr_manager`, `manager` | Get all leave requests (filterable) |
| `GET` | `/leave-requests/employee` | Authenticated (owner) | Get leave requests for the logged-in employee |
| `GET` | `/leave-requests/leave-balance` | Authenticated | Get current user’s leave balance |
| `PATCH` | `/leave-requests/update-request/:id` | `leave_requests:approve` | Approve or reject a leave request |
| `DELETE` | `/leave-requests/delete-request/:id` | Owner or Admin | Delete a leave request (if pending) |

---

## Notifications (`/notifications`)

All routes require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `PATCH` | `/notifications/one-read/:notificationId` | Mark a single notification as read |
| `PATCH` | `/notifications/one-unread/:notificationId` | Mark a single notification as unread |
| `GET` | `/notifications/all-unreadcount/:userId` | Get unread notification count for a user |
| `GET` | `/notifications/all-user-notifications/:userId` | Get all notifications for a user |
| `PATCH` | `/notifications/all-read/:userId` | Mark all notifications as read for a user |
| `PATCH` | `/notifications/all-unread/:userId` | Mark all notifications as unread for a user |
| `DELETE` | `/notifications/delete-notification/:notificationId` | Delete a notification |
| `POST` | `/notifications/interview-scheduled` | Trigger notification for interview scheduled |
| `POST` | `/notifications/leave-approved` | Trigger notification for leave approval |
| `POST` | `/notifications/leave-rejected` | Trigger notification for leave rejection |
| `POST` | `/notifications/performance-review` | Trigger notification for performance review submitted |

---

## Performance Reviews (`/performance`)

All routes require authentication.

| Method | Endpoint | Required Roles | Description |
|--------|----------|----------------|-------------|
| `POST` | `/performance` | `admin`, `hr_manager`, `manager` | Create a performance review |
| `GET` | `/performance` | `admin`, `hr_manager`, `manager` | List all reviews (with filters) |
| `GET` | `/performance/employee/:employeeId` | `admin`, `hr_manager`, `manager` | Get reviews for a specific employee |
| `GET` | `/performance/:id` | `admin`, `hr_manager`, `manager` | Get a single review by ID |
| `PATCH` | `/performance/update-review/:id` | `admin`, `hr_manager`, `manager` | Update a review |
| `DELETE` | `/performance/delete-review/:id` | `admin`, `hr_manager` | Delete a review |

---

## Recruitment (`/recruitment`)

| Method | Endpoint | Auth / Roles | Description |
|--------|----------|--------------|-------------|
| `GET` | `/recruitment` | Public | List all job postings |
| `GET` | `/recruitment/:id` | Public | Get a single job posting |
| `POST` | `/recruitment/:id/applications` | Public | Submit an application |
| `GET` | `/recruitment/list-applications` | `admin`, `hr_manager`, `manager` | List all applications |
| `PUT` | `/recruitment/update-application/:id` | `recruitment:update` permission | Update application status |
| `POST` | `/recruitment` | `admin`, `hr_manager` | Create a new job posting |
| `PUT` | `/recruitment/update-job/:id` | `admin`, `hr_manager` | Update a job posting |
| `DELETE` | `/recruitment/delete-job/:id` | `admin`, `hr_manager` | Delete a job posting |

---

## Analytics (`/analytics`)

All routes require authentication **and** roles `hr_manager` or `admin`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/analytics/dashboard` | Main dashboard statistics |
| `GET` | `/analytics/departments` | Department-wise metrics |
| `GET` | `/analytics/leave-summary` | Leave summary (usage, balances) |
| `GET` | `/analytics/recruitment-metrics` | Time-to-hire, application funnels |
| `GET` | `/analytics/performance-distribution` | Performance rating distribution |
| `GET` | `/analytics/headcount` | Employee headcount by department / role |
| `GET` | `/analytics/audit-logs` | System audit logs (admin only) |

---

## Request & Response Examples

### POST `/auth/login`

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "Admin123!"
}

```

## Common Error Codes

| HTTP Status | Error Message | Description |
|-------------|---------------|-------------|
| 400 | Validation failed | Missing or invalid fields |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Authenticated but insufficient role/permission |
| 404 | Not found | Resource does not exist |
| 409 | Duplicate entry | Email or employee code already exists |
| 500 | Internal server error | Something went wrong on the server |
