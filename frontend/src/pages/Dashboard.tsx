import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const quickActions = [
    {
      title: 'Book a Seat',
      description: 'Reserve your seat for any weekday',
      icon: '🪑',
      action: () => navigate('/seats'),
      color: 'var(--accent-primary)',
      primary: true
    },
    {
      title: 'My Bookings',
      description: 'View and manage your reservations',
      icon: '📋',
      action: () => navigate('/my-bookings'),
      color: 'var(--accent-success)'
    },
    ...(user?.role === 'superadmin' ? [{
      title: 'Pending Approvals',
      description: 'Review and approve booking requests',
      icon: '✓',
      action: () => navigate('/admin'),
      color: 'var(--accent-warning)'
    }] : []),
    ...(user?.role === 'superadmin' ? [{
      title: 'Manage Users',
      description: 'Create and manage user accounts',
      icon: '👥',
      action: () => navigate('/users'),
      color: 'var(--text-muted)'
    }] : [])
  ]

  return (
    <Layout>
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem'
          }}>
            Welcome back, {user?.name}! 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Here's what you can do today
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="card card-hover"
              style={{
                padding: '1.5rem',
                textAlign: 'left',
                cursor: 'pointer',
                border: action.primary ? `2px solid ${action.color}` : undefined
              }}
            >
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '12px',
                background: `${action.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '1rem'
              }}>
                {action.icon}
              </div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem'
              }}>
                {action.title}
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                lineHeight: '1.5'
              }}>
                {action.description}
              </p>
            </button>
          ))}
        </div>

        {/* Info Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* How it Works */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>💡</span>
              How it Works
            </h3>
            <ol style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.8',
              paddingLeft: '1.25rem'
            }}>
              <li>Select a weekday (Monday-Sunday)</li>
              <li>Choose an available seat on the map</li>
              <li>Submit your booking request</li>
              <li>Wait for admin approval</li>
              <li>Your seat is reserved for that weekday!</li>
            </ol>
          </div>

          {/* Account Info */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>👤</span>
              Account Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Name
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  {user?.name}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Email
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  {user?.email}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Role
                </div>
                <div style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  background: user?.role === 'superadmin' 
                    ? 'rgba(59, 130, 246, 0.1)' 
                    : 'rgba(100, 116, 139, 0.1)',
                  color: user?.role === 'superadmin' 
                    ? 'var(--accent-primary)' 
                    : 'var(--text-muted)',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  {user?.role}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>📌</span>
              Quick Tips
            </h3>
            <ul style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.8',
              paddingLeft: '1.25rem',
              listStyle: 'disc'
            }}>
              <li>You can book one seat per weekday</li>
              <li>Bookings are indefinite (every week)</li>
              <li>Green seats are available</li>
              <li>Red seats are already booked</li>
              <li>You can cancel anytime before approval</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}
