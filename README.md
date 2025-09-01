# Gym Member Management - Frontend

Modern React frontend untuk sistem manajemen member gym dengan UI yang responsive dan user-friendly.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Frontend akan berjalan di:** http://localhost:5173

## 📋 Prerequisites

Pastikan backend API sudah berjalan di http://localhost:3000

## 🔐 Default Login
- Username: `admin`
- Password: `admin123`

## ✨ Features

- 🔐 **Authentication** - Secure login dengan JWT
- 📊 **Dashboard** - Overview statistik member
- 👥 **Member Management** - CRUD operations untuk member
- 🔍 **Search & Filter** - Pencarian dan filtering member
- 📱 **Responsive Design** - Mobile-friendly interface
- 🎨 **Modern UI** - Beautiful design dengan Tailwind CSS
- ⚡ **Real-time Updates** - Data update otomatis
- 🔔 **Notifications** - Toast notifications untuk feedback

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **UI Library**: Tailwind CSS + Custom Components
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Icons**: Emoji icons
- **Build Tool**: Vite

## 📁 Project Structure

```
gym-frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Login.jsx       # Login page
│   │   ├── Dashboard.jsx   # Dashboard page
│   │   ├── Members.jsx     # Members management
│   │   ├── MemberModal.jsx # Add/Edit member modal
│   │   ├── Layout.jsx      # Main layout
│   │   └── ProtectedRoute.jsx # Route protection
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.jsx # Authentication state
│   │   └── NotificationContext.jsx # Notifications
│   ├── services/           # API services
│   │   ├── api.js         # Axios configuration
│   │   ├── authService.js # Auth API calls
│   │   └── memberService.js # Member API calls
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # App entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
└── package.json          # Dependencies and scripts
```

## 🎨 UI Components

- **Cards** - Dashboard statistics cards
- **Tables** - Member listing dengan actions
- **Modals** - Add/Edit member forms
- **Forms** - Login dan member forms
- **Notifications** - Success/Error toast messages
- **Loading States** - Skeleton loading indicators

## 🔗 API Integration

Frontend berkomunikasi dengan backend melalui REST API:
- Base URL: `http://localhost:3000/api`
- Authentication: Bearer Token (JWT)
- Error Handling: Automatic token refresh & logout

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px