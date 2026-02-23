import { useState, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

function ProfilePanel() {
  const { user, setUser } = useContext(AuthContext)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  if (!user) return null

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await axios.put('/api/auth/profile', { name, email })
      const updatedUser = response.data?.user
      if (updatedUser) {
        setUser(updatedUser)
        showToast({ message: 'Profile updated.', type: 'success' })
        setEditing(false)
      } else {
        showToast({ message: 'Profile updated, but response was unexpected.', type: 'info' })
      }
    } catch (error) {
      const msg =
        error.response?.data?.error || 'Failed to update profile. Please try again.'
      showToast({ message: msg, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="profile-panel">
      <div className="profile-header-row">
        <div className="profile-label-column">
          <span className="profile-label">Profile</span>
          <span className="profile-subtext">Manage your basic account information.</span>
        </div>
        <button
          type="button"
          className="profile-toggle-button"
          onClick={() => setEditing((prev) => !prev)}
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <form className="profile-form" onSubmit={handleSave}>
        <div className="profile-fields">
          <div className="profile-field">
            <label htmlFor="profile-name">Name</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!editing}
              required
            />
          </div>
          <div className="profile-field">
            <label htmlFor="profile-email">Email</label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!editing}
              required
            />
          </div>
        </div>

        {editing && (
          <div className="profile-actions">
            <button type="submit" className="profile-save-button" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        )}
      </form>
    </section>
  )
}

export default ProfilePanel

