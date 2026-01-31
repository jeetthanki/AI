# Admin Setup Guide

## Creating an Admin User

To create an admin user, you have two options:

### Option 1: Using the Script (Recommended)

1. Navigate to the backend directory:
```bash
cd backend
```

2. Run the create admin script:
```bash
node scripts/createAdmin.js
```

This will create a default admin with:
- Email: `admin@example.com`
- Password: `admin123`
- Name: `Admin User`

3. To create a custom admin:
```bash
node scripts/createAdmin.js your-email@example.com your-password "Admin Name"
```

### Option 2: Manual Creation via MongoDB

1. Connect to MongoDB using MongoDB Compass or mongosh

2. Navigate to the `resume-analyzer` database

3. Find a user in the `users` collection and update their role:
```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

Or create a new admin user directly (password will be hashed automatically):
```javascript
// Note: Password should be hashed, but for testing you can use bcrypt
// Better to use the script above
```

## Admin Features

Once logged in as admin, you'll have access to:

1. **Admin Dashboard** - Comprehensive analytics and statistics
2. **User Management** - View all users and their activity
3. **Resume Management** - View all uploaded resumes
4. **Analytics** - Detailed statistics including:
   - Total users and resumes
   - Average scores
   - Top users by resume count
   - Daily activity charts
   - Score distribution

## Admin Login

Simply login with your admin credentials through the regular login page. The system will automatically detect your admin role and show the admin dashboard instead of the regular user interface.

## Security Notes

- Admin routes are protected with authentication and role-based authorization
- Only users with `role: 'admin'` can access admin endpoints
- Admin users can see all user data and activities
- Regular users cannot access admin features even if they try to access the URLs directly

