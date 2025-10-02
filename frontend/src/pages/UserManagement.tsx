import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/api'
import type { User } from '../api/api'

export default function UserManagement() {
  const { token } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    if (!token) return
    try {
      const data = await api.getUsers(token)
      setUsers(data)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleCreate = async () => {
    if (!token) return
    try {
      await api.createUser(email, name, password, role, token)
      setSuccess('User created successfully!')
      setShowCreateDialog(false)
      setEmail('')
      setName('')
      setPassword('')
      setRole('user')
      loadUsers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDelete = async (userId: number) => {
    if (!token || !confirm('Are you sure you want to delete this user?')) return
    try {
      await api.deleteUser(userId, token)
      setSuccess('User deleted successfully!')
      loadUsers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleResetPassword = async () => {
    if (!token || !selectedUser) return
    try {
      await api.adminResetPassword(selectedUser.id, newPassword, token)
      setSuccess(`Password reset for ${selectedUser.email}`)
      setShowResetDialog(false)
      setSelectedUser(null)
      setNewPassword('')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <Layout>
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '1.875rem', 
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '0.25rem'
            }}>
              👥 User Management
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Create and manage user accounts
            </p>
          </div>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="btn btn-primary"
          >
            ➕ Create User
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--accent-danger)',
            padding: '0.875rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            <button 
              onClick={() => setError('')}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                fontSize: '1.25rem',
                cursor: 'pointer',
                padding: '0',
                width: '1.5rem',
                height: '1.5rem'
              }}
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            color: 'var(--accent-success)',
            padding: '0.875rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>✓</span>
            <span>{success}</span>
          </div>
        )}

        {/* Users Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)' }}>
                  <th style={{ 
                    padding: '1rem 1.5rem', 
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Name
                  </th>
                  <th style={{ 
                    padding: '1rem 1.5rem', 
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Email
                  </th>
                  <th style={{ 
                    padding: '1rem 1.5rem', 
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Role
                  </th>
                  <th style={{ 
                    padding: '1rem 1.5rem', 
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Created
                  </th>
                  <th style={{ 
                    padding: '1rem 1.5rem', 
                    textAlign: 'right',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr 
                    key={user.id}
                    style={{ 
                      borderBottom: '1px solid var(--border-primary)',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ 
                      padding: '1rem 1.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: 'var(--text-primary)'
                    }}>
                      {user.name}
                    </td>
                    <td style={{ 
                      padding: '1rem 1.5rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)'
                    }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        background: user.role === 'superadmin' 
                          ? 'rgba(59, 130, 246, 0.1)' 
                          : 'rgba(100, 116, 139, 0.1)',
                        color: user.role === 'superadmin' 
                          ? 'var(--accent-primary)' 
                          : 'var(--text-muted)',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ 
                      padding: '1rem 1.5rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-muted)'
                    }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowResetDialog(true)
                          }}
                          className="btn btn-warning"
                          style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
                        >
                          🔑 Reset
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="btn btn-danger"
                          style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create User Dialog */}
      {showCreateDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          zIndex: 1000
        }}>
          <div className="card" style={{ padding: '2rem', maxWidth: '500px', width: '100%' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700',
                color: 'var(--text-primary)'
              }}>
                Create New User
              </h2>
              <button
                onClick={() => setShowCreateDialog(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0',
                  width: '2rem',
                  height: '2rem'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginBottom: '0.5rem'
                }}>
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginBottom: '0.5rem'
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginBottom: '0.5rem'
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginBottom: '0.5rem'
                }}>
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.875rem' }}
                >
                  <option value="user">User</option>
                  <option value="superadmin">SuperAdmin</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Dialog */}
      {showResetDialog && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          zIndex: 1000
        }}>
          <div className="card" style={{ padding: '2rem', maxWidth: '500px', width: '100%' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700',
                color: 'var(--text-primary)'
              }}>
                Reset Password
              </h2>
              <button
                onClick={() => {
                  setShowResetDialog(false)
                  setSelectedUser(null)
                  setNewPassword('')
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0',
                  width: '2rem',
                  height: '2rem'
                }}
              >
                ×
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Reset password for: <strong style={{ color: 'var(--text-primary)' }}>{selectedUser.email}</strong>
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: '0.5rem'
              }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setShowResetDialog(false)
                  setSelectedUser(null)
                  setNewPassword('')
                }}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="btn btn-warning"
                style={{ flex: 1 }}
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
