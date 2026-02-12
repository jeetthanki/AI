import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import AdminDashboard from './AdminDashboard'
import AdminLogin from './AdminLogin'
import '../App.css'

function AdminPage() {
  const { user, loading, logout } = useContext(AuthContext)

  if (loading) {
    return (
      <div className="App">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return <AdminLogin />
  }

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <div className="header-content">
            <div>
              <h1>Admin Dashboard</h1>
              <p>Manage users and view analytics</p>
            </div>
            <div className="user-section">
              <span className="user-name">Welcome, {user.name}!</span>
              <button onClick={logout} className="logout-button">
                Logout
              </button>
            </div>
          </div>
        </header>
        <AdminDashboard />
      </div>
    </div>
  )
}

export default AdminPage


