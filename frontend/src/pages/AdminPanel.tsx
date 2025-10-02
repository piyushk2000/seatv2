import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/api'
import type { Booking } from '../api/api'

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function AdminPanel() {
  const { token } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedWeekday, setSelectedWeekday] = useState<number | null>(null)

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

  const handleApprove = async (id: number) => {
    if (!token) return
    try {
      await api.approveBooking(id, token)
      setSuccess('Booking approved!')
      setTimeout(() => setSuccess(''), 3000)
      loadBookings()
    } catch (err: any) {
      setError(err.message)
      setTimeout(() => setError(''), 5000)
    }
  }

  const handleReject = async (id: number) => {
    if (!token) return
    try {
      await api.rejectBooking(id, token)
      setSuccess('Booking rejected!')
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

  const filteredWeekdays = selectedWeekday !== null 
    ? { [selectedWeekday]: groupedBookings[selectedWeekday] || [] }
    : groupedBookings

  const pendingCount = bookings.filter(b => b.status === 'pending').length
  const approvedCount = bookings.filter(b => b.status === 'approved').length
  const rejectedCount = bookings.filter(b => b.status === 'rejected').length

  return (
    <Layout>
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '0.25rem'
          }}>
            ✓ Booking Approvals
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Review and manage booking requests
          </p>
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

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Pending
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent-warning)' }}>
              {pendingCount}
            </div>
          </div>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Approved
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent-success)' }}>
              {approvedCount}
            </div>
          </div>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Rejected
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent-danger)' }}>
              {rejectedCount}
            </div>
          </div>
        </div>

        {/* Weekday Filter */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ 
            fontSize: '0.875rem', 
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '0.75rem'
          }}>
            Filter by Weekday
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              onClick={() => setSelectedWeekday(null)}
              className="btn"
              style={{
                background: selectedWeekday === null ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: selectedWeekday === null ? 'white' : 'var(--text-secondary)',
                border: selectedWeekday === null ? 'none' : '1px solid var(--border-secondary)',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem'
              }}
            >
              All Days
            </button>
            {WEEKDAYS.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedWeekday(index)}
                className="btn"
                style={{
                  background: selectedWeekday === index ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: selectedWeekday === index ? 'white' : 'var(--text-secondary)',
                  border: selectedWeekday === index ? 'none' : '1px solid var(--border-secondary)',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem'
                }}
              >
                {day}
                {groupedBookings[index] && (
                  <span style={{
                    marginLeft: '0.5rem',
                    padding: '0.125rem 0.5rem',
                    background: selectedWeekday === index ? 'rgba(255,255,255,0.2)' : 'var(--bg-secondary)',
                    borderRadius: '9999px',
                    fontSize: '0.75rem'
                  }}>
                    {groupedBookings[index].length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

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
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem'
            }}>
              No bookings yet
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Bookings will appear here when users make requests
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {Object.keys(filteredWeekdays)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map((weekdayStr) => {
                const weekday = parseInt(weekdayStr)
                const dayBookings = filteredWeekdays[weekday]
                
                if (!dayBookings || dayBookings.length === 0) return null
                
                const dayPending = dayBookings.filter(b => b.status === 'pending').length
                
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
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                          {dayBookings.length} total
                        </span>
                        {dayPending > 0 && (
                          <span className="badge badge-pending">
                            {dayPending} pending
                          </span>
                        )}
                      </div>
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
                                  Requested by <strong style={{ color: 'var(--text-secondary)' }}>{booking.user_name}</strong> ({booking.user_email})
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
                            {booking.status === 'pending' && (
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  onClick={() => handleApprove(booking.id)}
                                  className="btn btn-success"
                                  style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  onClick={() => handleReject(booking.id)}
                                  className="btn btn-danger"
                                  style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
                                >
                                  ✕ Reject
                                </button>
                              </div>
                            )}
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
