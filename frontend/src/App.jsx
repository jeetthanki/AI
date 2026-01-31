import { useState, useContext } from 'react'
import { AuthContext } from './context/AuthContext'
import './App.css'
import Login from './components/Login'
import Register from './components/Register'
import ResumeUpload from './components/ResumeUpload'
import AnalysisResults from './components/AnalysisResults'
import AdminDashboard from './components/AdminDashboard'

function App() {
  const { user, loading, logout } = useContext(AuthContext)
  const [showRegister, setShowRegister] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result)
    setUploadLoading(false)
    setError(null)
  }

  const handleUploadStart = () => {
    setUploadLoading(true)
    setError(null)
    setAnalysisResult(null)
  }

  const handleError = (err) => {
    setError(err)
    setUploadLoading(false)
  }

  // Show loading spinner while checking authentication
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

  // Show login/register if not authenticated
  if (!user) {
    return (
      <div className="App">
        {showRegister ? (
          <Register onSwitchToLogin={() => setShowRegister(false)} />
        ) : (
          <Login onSwitchToRegister={() => setShowRegister(true)} />
        )}
      </div>
    )
  }

  // Show admin dashboard if admin
  if (user.role === 'admin') {
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

  // Show main app if authenticated user
  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <div className="header-content">
            <div>
              <h1>AI Resume Analyzer</h1>
              <p>Upload your resume and get instant AI-powered analysis</p>
            </div>
            <div className="user-section">
              <span className="user-name">Welcome, {user.name}!</span>
              <button onClick={logout} className="logout-button">
                Logout
              </button>
            </div>
          </div>
        </header>

        <ResumeUpload
          onUploadStart={handleUploadStart}
          onAnalysisComplete={handleAnalysisComplete}
          onError={handleError}
          loading={uploadLoading}
        />

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {analysisResult && (
          <AnalysisResults result={analysisResult} />
        )}
      </div>
    </div>
  )
}

export default App

