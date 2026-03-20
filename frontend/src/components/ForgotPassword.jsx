import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useToast } from '../context/ToastContext'
import './Auth.css'

function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [serverMessage, setServerMessage] = useState('')
  const [resetLink, setResetLink] = useState('')
  const { showToast } = useToast()
  const navigate = useNavigate()

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

      const token = response.data?.resetToken
      if (token) {
        setResetLink(`${window.location.origin}/reset-password?token=${token}`)
      } else {
        setResetLink('')
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to start reset. Try again.'
      setServerMessage(msg)
      showToast({ message: msg, type: 'error' })
      setResetLink('')
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

        {resetLink && (
          <div className="reset-link-card">
            <div className="reset-link-title">Reset link</div>
            <div className="reset-link-row">
              <input
                className="reset-link-input"
                value={resetLink}
                readOnly
                onFocus={(e) => e.target.select()}
              />
              <button
                type="button"
                className="reset-link-copy"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(resetLink)
                    showToast({ message: 'Reset link copied.', type: 'success' })
                  } catch {
                    showToast({ message: 'Copy failed. Please copy manually.', type: 'error' })
                  }
                }}
              >
                Copy
              </button>
            </div>
            <button
              type="button"
              className="reset-link-open"
              onClick={() => navigate(`/reset-password?token=${new URL(resetLink).searchParams.get('token')}`)}
            >
              Open reset page
            </button>
          </div>
        )}

        <div className="auth-footer-row">
          <button
            type="button"
            className="auth-inline-link"
            onClick={() => (onBackToLogin ? onBackToLogin() : navigate('/'))}
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

