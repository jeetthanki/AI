import { useState } from 'react'
import axios from 'axios'
import { useToast } from '../context/ToastContext'
import './Auth.css'

function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [serverMessage, setServerMessage] = useState('')
  const { showToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setServerMessage('')

    try {
      const response = await axios.post('/api/auth/forgot-password', { email })
      const message =
        response.data?.message ||
        'If this email exists, a reset link has been created.'
      setServerMessage(message)
      showToast({ message, type: 'info' })
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to start reset. Try again.'
      setServerMessage(msg)
      showToast({ message: msg, type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot password</h2>
        <p className="auth-subtitle">
          Enter your email and we will create a reset link for you.
        </p>

        {serverMessage && <div className="auth-error">{serverMessage}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter the email you registered with"
            />
          </div>

          <button type="submit" className="auth-button" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <div className="auth-footer-row">
          <button type="button" className="auth-inline-link" onClick={onBackToLogin}>
            Back to login
          </button>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

