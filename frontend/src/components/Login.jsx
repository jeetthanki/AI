import { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './Auth.css'

function Login({ onSwitchToRegister, onForgotPassword }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useContext(AuthContext)
  const { showToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    
    if (!result.success) {
      setError(result.error)
      setLoading(false)
      showToast({ message: result.error || 'Login failed', type: 'error' })
      return
    }

    showToast({ message: 'Welcome back!', type: 'success' })
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <p className="auth-subtitle">Welcome back! Please login to continue.</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              minLength={6}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-footer-row">
          <span>
            Don't have an account?
            <button onClick={onSwitchToRegister} className="link-button">
              Register
            </button>
          </span>
          <button
            type="button"
            className="auth-inline-link"
            onClick={onForgotPassword}
          >
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login

