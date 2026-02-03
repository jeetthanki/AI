import { useState, useEffect } from 'react'
import axios from 'axios'
import './AdminDashboard.css'

function getScoreClass(score) {
  if (!score && score !== 0) return 'na'
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'fair'
  return 'poor'
}

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      const [statsRes, usersRes, resumesRes] = await Promise.all([
        axios.get('/api/admin/dashboard/stats'),
        axios.get('/api/admin/users?limit=100'),
        axios.get('/api/admin/resumes?limit=50')
      ])
      
      setStats(statsRes.data.stats)
      setUsers(usersRes.data.users)
      setResumes(resumesRes.data.resumes)
      setLoading(false)
      setRefreshing(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchUserActivity = async (userId) => {
    try {
      const response = await axios.get(`/api/admin/users/${userId}/activity`)
      setSelectedUser(response.data)
    } catch (error) {
      console.error('Error fetching user activity:', error)
    }
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Filter users and resumes based on search
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredResumes = resumes.filter(resume =>
    resume.originalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resume.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resume.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-top">
          <div>
            <h1>📊 Admin Dashboard</h1>
            <p className="header-subtitle">Manage users, view analytics, and monitor activity</p>
          </div>
          <button 
            className="refresh-button"
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            title="Refresh data"
          >
            {refreshing ? '🔄' : '↻'} {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <div className="dashboard-tabs">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => {
              setActiveTab('overview')
              setSearchQuery('')
            }}
          >
            📈 Overview
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => {
              setActiveTab('users')
              setSearchQuery('')
            }}
          >
            👥 Users ({users.length})
          </button>
          <button 
            className={activeTab === 'resumes' ? 'active' : ''}
            onClick={() => {
              setActiveTab('resumes')
              setSearchQuery('')
            }}
          >
            📄 Resumes ({resumes.length})
          </button>
        </div>
      </div>

      {activeTab === 'overview' && stats && (
        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>Total Users</h3>
                <p className="stat-value">{stats.totalUsers}</p>
                <p className="stat-change">+{stats.recentUsers} this week</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📄</div>
              <div className="stat-info">
                <h3>Total Resumes</h3>
                <p className="stat-value">{stats.totalResumes}</p>
                <p className="stat-change">+{stats.recentResumes} this week</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <h3>Avg Overall Score</h3>
                <p className="stat-value">
                  {Math.round(stats.averageScores.avgOverallScore || 0)}
                </p>
                <p className="stat-change">/ 100</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🤖</div>
              <div className="stat-info">
                <h3>Avg ATS Score</h3>
                <p className="stat-value">
                  {Math.round(stats.averageScores.avgAtsScore || 0)}
                </p>
                <p className="stat-change">/ 100</p>
              </div>
            </div>
          </div>

          <div className="charts-section">
            <div className="chart-card">
              <h3>Top Users by Resume Count</h3>
              <div className="top-users-list">
                {stats.topUsers && stats.topUsers.length > 0 ? (
                  stats.topUsers.map((user, index) => (
                    <div key={index} className="top-user-item">
                      <span className="user-rank">#{index + 1}</span>
                      <div className="user-details">
                        <p className="user-name">{user.name}</p>
                        <p className="user-email">{user.email}</p>
                      </div>
                      <span className="user-count">{user.resumeCount} resumes</span>
                    </div>
                  ))
                ) : (
                  <p>No data available</p>
                )}
              </div>
            </div>

            <div className="chart-card">
              <h3>Score Distribution</h3>
              <div className="score-distribution">
                {stats.scoreDistribution && stats.scoreDistribution.length > 0 ? (
                  stats.scoreDistribution.map((bucket, index) => (
                    <div key={index} className="distribution-item">
                      <span className="distribution-label">
                        {bucket._id === 'Other' ? 'Other' : `${bucket._id[0]}-${bucket._id[1]}`}
                      </span>
                      <div className="distribution-bar-container">
                        <div 
                          className="distribution-bar"
                          style={{ width: `${(bucket.count / stats.totalResumes) * 100}%` }}
                        ></div>
                      </div>
                      <span className="distribution-count">{bucket.count}</span>
                    </div>
                  ))
                ) : (
                  <p>No data available</p>
                )}
              </div>
            </div>
          </div>

          {stats.dailyActivity && stats.dailyActivity.length > 0 && (
            <div className="chart-card full-width">
              <h3>Daily Activity (Last 30 Days)</h3>
              <div className="activity-chart">
                {stats.dailyActivity.map((day, index) => (
                  <div key={index} className="activity-bar">
                    <div 
                      className="activity-bar-fill"
                      style={{ height: `${(day.count / Math.max(...stats.dailyActivity.map(d => d.count))) * 100}%` }}
                    ></div>
                    <span className="activity-count">{day.count}</span>
                    <span className="activity-date">{day._id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="dashboard-content">
          <div className="section-header">
            <h2>👥 User Management</h2>
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <p>{searchQuery ? 'No users found matching your search' : 'No users found'}</p>
            </div>
          ) : (
            <div className="table-container">
              <div className="table-info">
                Showing {filteredUsers.length} of {users.length} users
              </div>
              <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Resumes</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className="count-badge">{user.resumeCount || 0}</span>
                    </td>
                    <td className="date-cell">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="view-button"
                        onClick={() => {
                          setSelectedUser(user)
                          fetchUserActivity(user._id)
                          setActiveTab('user-activity')
                        }}
                      >
                        View Activity
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'resumes' && (
        <div className="dashboard-content">
          <div className="section-header">
            <h2>📄 Resume Analysis</h2>
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search resumes by filename or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          {filteredResumes.length === 0 ? (
            <div className="empty-state">
              <p>{searchQuery ? 'No resumes found matching your search' : 'No resumes found'}</p>
            </div>
          ) : (
            <div className="table-container">
              <div className="table-info">
                Showing {filteredResumes.length} of {resumes.length} resumes
              </div>
              <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Filename</th>
                  <th>Overall Score</th>
                  <th>ATS Score</th>
                  <th>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {filteredResumes.map((resume) => (
                  <tr key={resume._id}>
                    <td>
                      {resume.user?.name || 'Unknown'}
                      <br />
                      <small>{resume.user?.email}</small>
                    </td>
                    <td className="filename-cell">{resume.originalName}</td>
                    <td>
                      <span className={`score-badge score-${getScoreClass(resume.analysis?.overallScore)}`}>
                        {resume.analysis?.overallScore || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`score-badge score-${getScoreClass(resume.analysis?.atsScore)}`}>
                        {resume.analysis?.atsScore || 'N/A'}
                      </span>
                    </td>
                    <td className="date-cell">{new Date(resume.uploadedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'user-activity' && selectedUser && (
        <div className="dashboard-content">
          <button 
            className="back-button"
            onClick={() => {
              setActiveTab('users')
              setSelectedUser(null)
            }}
          >
            ← Back to Users
          </button>
          <div className="user-activity-header">
            <div className="user-info-card">
              <div className="user-avatar">{selectedUser.user?.name?.charAt(0).toUpperCase() || 'U'}</div>
              <div>
                <h2>{selectedUser.user?.name || 'Unknown User'}</h2>
                <p className="user-email">{selectedUser.user?.email}</p>
                <div className="user-stats">
                  <span className="stat-badge">
                    📄 {selectedUser.totalResumes || 0} Resumes
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="activity-resumes">
            {selectedUser.resumes && selectedUser.resumes.length > 0 ? (
              selectedUser.resumes.map((resume) => (
                <div key={resume._id} className="activity-resume-card">
                  <div className="resume-card-header">
                    <h4>{resume.originalName}</h4>
                    <span className="resume-badge">📄</span>
                  </div>
                  <div className="resume-scores">
                    <div className="score-item">
                      <span className="score-label">Overall</span>
                      <span className={`score-value score-${getScoreClass(resume.analysis?.overallScore)}`}>
                        {resume.analysis?.overallScore || 'N/A'}
                      </span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">ATS</span>
                      <span className={`score-value score-${getScoreClass(resume.analysis?.atsScore)}`}>
                        {resume.analysis?.atsScore || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <p className="resume-date">
                    📅 {new Date(resume.uploadedAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No resumes uploaded yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard

