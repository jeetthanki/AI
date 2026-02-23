import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { useToast } from '../context/ToastContext'
import './Auth.css'

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const { showToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match'
      setMessage(msg)
      showToast({ message: msg, type: 'error' })
      return
    }

    if (!token) {
      const msg = 'Reset token is missing.'
      setMessage(msg)
      showToast({ message: msg, type: 'error' })
      return
    }

    setSubmitting(true)

    try {
      const response = await axios.post('/api/auth/reset-password', {
        token,
        password
      })
      const msg = response.data?.message || 'Password reset successfully.'
      setMessage(msg)
      showToast({ message: msg, type: 'success' })
    } catch (error) {
      const msg =
        error.response?.data?.error || 'Failed to reset password. Try again.'
      setMessage(msg)
      showToast({ message: msg, type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Set new password</h2>
        <p className="auth-subtitle">
          Choose a strong password you do not use elsewhere.
        </p>

        {message && <div className="auth-error">{message}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="password"
              minLength={6}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-new-password">Confirm password</label>
            <input
              id="confirm-new-password"
              type="password"
              minLength={6}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your new password"
            />
          </div>

          <button type="submit" className="auth-button" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword

