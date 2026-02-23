import { useState, useContext } from 'react'
import { AuthContext } from './context/AuthContext'
import './App.css'
import Login from './components/Login'
import Register from './components/Register'
import ResumeUpload from './components/ResumeUpload'
import AnalysisResults from './components/AnalysisResults'
import AdminDashboard from './components/AdminDashboard'
import ForgotPassword from './components/ForgotPassword'
import { useToast } from './context/ToastContext'
import ProfilePanel from './components/ProfilePanel'

function App() {
  const { user, loading, logout } = useContext(AuthContext)
  const [authView, setAuthView] = useState('login') // 'login' | 'register' | 'forgot'
  const [analysisResult, setAnalysisResult] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [error, setError] = useState(null)
  const { showToast } = useToast()

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
    if (err) {
      showToast({ message: err, type: 'error' })
    }
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
        {authView === 'register' && (
          <Register onSwitchToLogin={() => setAuthView('login')} />
        )}
        {authView === 'login' && (
          <Login
            onSwitchToRegister={() => setAuthView('register')}
            onForgotPassword={() => setAuthView('forgot')}
          />
        )}
        {authView === 'forgot' && (
          <ForgotPassword onBackToLogin={() => setAuthView('login')} />
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
              <h1>✨ AI Resume Analyzer</h1>
              <p>Get instant, personalized feedback on your resume</p>
            </div>
            <div className="user-section">
              <span className="user-name">Welcome, {user.name}!</span>
              <button onClick={logout} className="logout-button">
                Logout
              </button>
            </div>
          </div>
        </header>

        <ProfilePanel />

        {!analysisResult && !uploadLoading && (
          <div className="welcome-tips">
            <h3>💡 Quick Tips</h3>
            <ul>
              <li>Upload a text-based PDF or Word document for best results</li>
              <li>Ensure your resume contains selectable text (not scanned images)</li>
              <li>Get detailed scores and personalized recommendations</li>
            </ul>
          </div>
        )}

        <ResumeUpload
          onUploadStart={handleUploadStart}
          onAnalysisComplete={handleAnalysisComplete}
          onError={handleError}
          loading={uploadLoading}
        />

        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
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

