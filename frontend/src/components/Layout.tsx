import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard', roles: ['user', 'superadmin'] },
    { path: '/seats', icon: '🪑', label: 'Book Seat', roles: ['user', 'superadmin'] },
    { path: '/my-bookings', icon: '📋', label: 'My Bookings', roles: ['user', 'superadmin'] },
    { path: '/admin', icon: '✓', label: 'Approvals', roles: ['superadmin'] },
    { path: '/users', icon: '👥', label: 'Users', roles: ['superadmin'] },
  ]

  const filteredNavItems = navItems.filter(item =>
    item.roles.includes(user?.role || 'user')
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 200,
          display: 'none',
          padding: '0.5rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: '8px',
          color: 'var(--text-primary)',
          cursor: 'pointer'
        }}
        className="mobile-menu-btn"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside 
        style={{
          width: '260px',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-primary)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 100,
          transition: 'left 0.3s ease'
        }}
        className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}
      >
        {/* Logo */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--border-primary)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer'
          }} onClick={() => navigate('/dashboard')}>
            <div style={{ fontSize: '2rem' }}>🪑</div>
            <div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'var(--text-primary)'
              }}>
                Seat Manager
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}>
                Booking System
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{
          flex: 1,
          padding: '1rem',
          overflowY: 'auto'
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '0.5rem 0.75rem',
              marginBottom: '0.25rem'
            }}>
              Menu
            </div>
            {filteredNavItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  marginBottom: '0.25rem',
                  background: isActive(item.path) ? 'var(--accent-primary)' : 'transparent',
                  color: isActive(item.path) ? 'white' : 'var(--text-secondary)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: isActive(item.path) ? '600' : '500',
                  textAlign: 'left',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.background = 'var(--bg-hover)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* User Info & Logout */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid var(--border-primary)'
        }}>
          <div style={{
            background: 'var(--bg-tertiary)',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.25rem'
            }}>
              {user?.name}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginBottom: '0.5rem'
            }}>
              {user?.email}
            </div>
            <div style={{
              display: 'inline-block',
              padding: '0.25rem 0.5rem',
              background: user?.role === 'superadmin'
                ? 'rgba(59, 130, 246, 0.1)'
                : 'rgba(100, 116, 139, 0.1)',
              color: user?.role === 'superadmin'
                ? 'var(--accent-primary)'
                : 'var(--text-muted)',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: '600',
              textTransform: 'capitalize'
            }}>
              {user?.role}
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-secondary)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-danger)'
              e.currentTarget.style.color = 'white'
              e.currentTarget.style.borderColor = 'var(--accent-danger)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)'
              e.currentTarget.style.color = 'var(--text-secondary)'
              e.currentTarget.style.borderColor = 'var(--border-secondary)'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: '260px',
        minHeight: '100vh',
        background: 'var(--bg-primary)'
      }}>
        {children}
      </main>
    </div>
  )
}
