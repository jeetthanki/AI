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
                <button onClick={logout} className="button button-secondary">
                  Sign out
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
        <header className="header header-pro">
          <div className="header-content">
            <div className="brand-block">
              <div className="brand-title-row">
                <h1 className="brand-title">AI Resume Analyzer</h1>
                <span className="brand-badge">Beta</span>
              </div>
              <p className="brand-subtitle">
                Upload your resume and get clear, actionable feedback in seconds.
              </p>
            </div>
            <div className="user-section">
              <span className="user-name">{user.name}</span>
              <button onClick={logout} className="button button-secondary">
                Sign out
              </button>
            </div>
          </div>
        </header>

        <main className="main-grid">
          <section className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Analyze your resume</h2>
              <p className="panel-subtitle">PDF or Word. Best results with selectable text.</p>
            </div>

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

            {analysisResult && <AnalysisResults result={analysisResult} />}
          </section>

          <aside className="side-column">
            <ProfilePanel />

            {!analysisResult && !uploadLoading && (
              <div className="panel panel-muted">
                <div className="panel-header">
                  <h3 className="panel-title">Quick tips</h3>
                  <p className="panel-subtitle">Small changes that usually boost scores fast.</p>
                </div>
                <ul className="tips-list">
                  <li>Use clear section headings (Experience, Skills, Education).</li>
                  <li>Avoid images for key text. ATS prefers selectable text.</li>
                  <li>Tailor keywords to the role you’re applying for.</li>
                </ul>
              </div>
            )}
          </aside>
        </main>
      </div>
    </div>
  )
}

export default App

