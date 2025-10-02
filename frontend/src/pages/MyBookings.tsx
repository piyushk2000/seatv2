import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/api'
import type { Booking } from '../api/api'

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function MyBookings() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    if (!token) return
    try {
      setLoading(true)
      const data = await api.getBookings(token)
      setBookings(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel this booking?')) return
    if (!token) return

    try {
      await api.cancelBooking(id, token)
      setSuccess('Booking cancelled!')
      setTimeout(() => setSuccess(''), 3000)
      loadBookings()
    } catch (err: any) {
      setError(err.message)
      setTimeout(() => setError(''), 5000)
    }
  }

  const groupedBookings = bookings.reduce((acc, booking) => {
    const day = booking.weekday
    if (!acc[day]) acc[day] = []
    acc[day].push(booking)
    return acc
  }, {} as Record<number, Booking[]>)

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
              📋 My Bookings
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              View and manage your seat reservations
            </p>
          </div>
          <button
            onClick={() => navigate('/seats')}
            className="btn btn-primary"
          >
            🪑 Book New Seat
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
            gap: '0.5rem'
          }}>
            <span>⚠️</span>
            <span>{error}</span>
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

        {/* Content */}
        {loading ? (
          <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ 
              display: 'inline-block',
              width: '3rem',
              height: '3rem',
              border: '3px solid var(--bg-tertiary)',
              borderTopColor: 'var(--accent-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🪑</div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem'
            }}>
              No bookings yet
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Start by booking your favorite seat!
            </p>
            <button
              onClick={() => navigate('/seats')}
              className="btn btn-primary"
            >
              🗺️ Go to Seat Map
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {Object.keys(groupedBookings)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map((weekdayStr) => {
                const weekday = parseInt(weekdayStr)
                const dayBookings = groupedBookings[weekday]
                
                return (
                  <div key={weekday} className="card">
                    {/* Day Header */}
                    <div style={{
                      padding: '1.25rem 1.5rem',
                      borderBottom: '1px solid var(--border-primary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <h2 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span>📅</span>
                        {WEEKDAYS[weekday]}
                      </h2>
                      <span style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-muted)'
                      }}>
                        {dayBookings.length} {dayBookings.length === 1 ? 'booking' : 'bookings'}
                      </span>
                    </div>
                    
                    {/* Bookings */}
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {dayBookings.map((booking) => (
                        <div 
                          key={booking.id} 
                          style={{
                            padding: '1.25rem',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: '1rem'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                              <div style={{
                                width: '3rem',
                                height: '3rem',
                                borderRadius: '8px',
                                background: 'var(--accent-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.125rem',
                                fontWeight: '700',
                                color: 'white'
                              }}>
                                {booking.seat_label || booking.seat_id}
                              </div>
                              <div>
                                <div style={{
                                  fontSize: '1rem',
                                  fontWeight: '600',
                                  color: 'var(--text-primary)',
                                  marginBottom: '0.25rem'
                                }}>
                                  Seat {booking.seat_label || booking.seat_id}
                                </div>
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: 'var(--text-muted)'
                                }}>
                                  Booked on {new Date(booking.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>

                            {(booking.booked_for_name || booking.booked_for_email || booking.notes) && (
                              <div style={{
                                padding: '0.75rem',
                                background: 'var(--bg-secondary)',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                color: 'var(--text-secondary)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem'
                              }}>
                                {booking.booked_for_name && (
                                  <div>
                                    <span style={{ color: 'var(--text-muted)' }}>For:</span> {booking.booked_for_name}
                                  </div>
                                )}
                                {booking.booked_for_email && (
                                  <div>
                                    <span style={{ color: 'var(--text-muted)' }}>Email:</span> {booking.booked_for_email}
                                  </div>
                                )}
                                {booking.notes && (
                                  <div>
                                    <span style={{ color: 'var(--text-muted)' }}>Note:</span> {booking.notes}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                            <span className={`badge badge-${booking.status}`}>
                              {booking.status}
                            </span>
                            <button
                              onClick={() => handleCancel(booking.id)}
                              className="btn btn-danger"
                              style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
                            >
                              ✕ Cancel
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Layout>
  )
}
