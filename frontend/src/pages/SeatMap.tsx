import { useState, useEffect, useRef } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/api'
import type { Seat } from '../api/api'

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function SeatMap() {
  const { user, token } = useAuth()
  const [seats, setSeats] = useState<Seat[]>([])
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [selectedWeekday, setSelectedWeekday] = useState<number | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [selectedSeatsForDeletion, setSelectedSeatsForDeletion] = useState<string[]>([])
  const [bookedSeats, setBookedSeats] = useState<Record<string, any>>({})
  const [prefix, setPrefix] = useState('A')
  const [seatSize, setSeatSize] = useState(10)
  const [bgImage, setBgImage] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [bookedForName, setBookedForName] = useState('')
  const [bookedForEmail, setBookedForEmail] = useState('')
  const [notes, setNotes] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    loadLayout()
  }, [])

  useEffect(() => {
    drawCanvas()
  }, [seats, selectedSeats, bgImage, bookedSeats, selectedSeatsForDeletion, mode, seatSize])

  useEffect(() => {
    if (selectedWeekday !== null) {
      loadBookedSeats()
    }
  }, [selectedWeekday])

  const loadBookedSeats = async () => {
    if (selectedWeekday === null) return
    try {
      const data = await api.getBookedSeats(selectedWeekday)
      setBookedSeats(data)
    } catch (err: any) {
      console.error('Failed to load booked seats:', err)
    }
  }

  const loadLayout = async () => {
    try {
      const data = await api.getLayout()
      setSeats(data.seats)
      setBgImage(data.background_image)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (bgImage) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        drawSeats(ctx)
      }
      img.onerror = () => {
        ctx.fillStyle = '#141b3a'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        drawSeats(ctx)
      }
      img.src = bgImage
    } else {
      ctx.fillStyle = '#141b3a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      drawSeats(ctx)
    }
  }

  const drawSeats = (ctx: CanvasRenderingContext2D) => {
    seats.forEach(seat => {
      const x = (seat.x / 100) * 800
      const y = (seat.y / 100) * 600

      const isSelected = selectedSeats.includes(seat.id)
      const isBooked = bookedSeats[seat.id]
      const isSelectedForDeletion = selectedSeatsForDeletion.includes(seat.id)

      ctx.beginPath()
      ctx.arc(x, y, seatSize, 0, 2 * Math.PI)

      if (mode === 'edit' && isSelectedForDeletion) {
        ctx.fillStyle = '#ef4444'
      } else if (isBooked) {
        ctx.fillStyle = '#ef4444'
      } else {
        ctx.fillStyle = '#10b981'
      }
      ctx.fill()

      if (isSelected && mode === 'view') {
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = Math.max(2, seatSize / 5)
        ctx.stroke()
      }

      ctx.fillStyle = 'white'
      const fontSize = Math.max(8, Math.floor(seatSize * 0.9))
      ctx.font = `bold ${fontSize}px Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(seat.label, x, y)
    })
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (mode === 'edit') {
      const clickedSeat = seats.find(seat => {
        const sx = (seat.x / 100) * 800
        const sy = (seat.y / 100) * 600
        const distance = Math.sqrt((x - sx) ** 2 + (y - sy) ** 2)
        return distance < seatSize
      })

      if (clickedSeat) {
        if (selectedSeatsForDeletion.includes(clickedSeat.id)) {
          setSelectedSeatsForDeletion(selectedSeatsForDeletion.filter(id => id !== clickedSeat.id))
        } else {
          setSelectedSeatsForDeletion([...selectedSeatsForDeletion, clickedSeat.id])
        }
      } else {
        const xPercent = (x / 800) * 100
        const yPercent = (y / 600) * 100
        const nextNum = getNextNumber()
        const newSeat: Seat = {
          id: Date.now().toString(),
          label: `${prefix}${nextNum}`,
          x: xPercent,
          y: yPercent
        }
        setSeats([...seats, newSeat])
      }
    } else {
      if (selectedWeekday === null) {
        setError('Please select a weekday first')
        setTimeout(() => setError(''), 3000)
        return
      }

      const clickedSeat = seats.find(seat => {
        const sx = (seat.x / 100) * 800
        const sy = (seat.y / 100) * 600
        const distance = Math.sqrt((x - sx) ** 2 + (y - sy) ** 2)
        return distance < seatSize
      })

      if (clickedSeat) {
        if (bookedSeats[clickedSeat.id]) {
          const bookedBy = bookedSeats[clickedSeat.id]
          setError(`Seat booked by ${bookedBy.user_name}`)
          setTimeout(() => setError(''), 3000)
          return
        }

        if (selectedSeats.includes(clickedSeat.id)) {
          setSelectedSeats(selectedSeats.filter(id => id !== clickedSeat.id))
        } else {
          setSelectedSeats([...selectedSeats, clickedSeat.id])
        }
      }
    }
  }

  const getNextNumber = () => {
    const nums = seats
      .filter(s => s.label.startsWith(prefix))
      .map(s => parseInt(s.label.slice(prefix.length)))
      .filter(n => !isNaN(n))
    let i = 1
    while (nums.includes(i)) i++
    return i
  }

  const handleSave = async () => {
    if (!token) return
    try {
      await api.saveLayout(seats, bgImage, token)
      setSuccess('Layout saved!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image too large (max 5MB)')
        setTimeout(() => setError(''), 5000)
        return
      }

      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        setTimeout(() => setError(''), 5000)
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        setBgImage(dataUrl)
        setSuccess('Floor plan uploaded!')
        setTimeout(() => setSuccess(''), 3000)
      }
      reader.onerror = () => {
        setError('Failed to read image')
        setTimeout(() => setError(''), 5000)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBook = async () => {
    if (!token || selectedSeats.length === 0 || selectedWeekday === null) return

    try {
      await api.createBooking(
        selectedSeats,
        selectedWeekday,
        bookedForName,
        bookedForEmail,
        notes,
        token
      )
      setSuccess(`${selectedSeats.length} seat(s) booked!`)
      setShowBookingDialog(false)
      setSelectedSeats([])
      setBookedForName('')
      setBookedForEmail('')
      setNotes('')
      loadBookedSeats()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
      setTimeout(() => setError(''), 5000)
    }
  }

  const handleDeleteSelected = () => {
    setSeats(seats.filter(s => !selectedSeatsForDeletion.includes(s.id)))
    setSelectedSeatsForDeletion([])
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
              {mode === 'edit' ? '✏️ Edit Seat Layout' : '🪑 Book a Seat'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {mode === 'edit'
                ? 'Click to add seats, click existing seats to delete'
                : 'Select a weekday, then choose your seat'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {user?.role === 'superadmin' && (
              <button
                onClick={() => {
                  if (mode === 'edit') {
                    setMode('view')
                    setSelectedSeatsForDeletion([])
                  } else {
                    setMode('edit')
                  }
                  setSelectedSeats([])
                }}
                className={mode === 'edit' ? 'btn btn-success' : 'btn btn-secondary'}
              >
                {mode === 'edit' ? '✓ Done Editing' : '✏️ Edit Layout'}
              </button>
            )}
          </div>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          {/* Main Canvas Area */}
          <div>
            {/* Weekday Selector (View Mode Only) */}
            {mode === 'view' && (
              <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.75rem'
                }}>
                  Step 1: Select Weekday
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {WEEKDAYS.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedWeekday(index)
                        setSelectedSeats([])
                      }}
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
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Canvas */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: '0.75rem'
              }}>
                {mode === 'edit' ? 'Seat Layout Editor' : 'Step 2: Choose Your Seat'}
              </div>
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                onClick={handleCanvasClick}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: '1px solid var(--border-primary)'
                }}
              />

              {/* Legend */}
              <div style={{
                display: 'flex',
                gap: '1.5rem',
                marginTop: '1rem',
                fontSize: '0.875rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '1rem',
                    height: '1rem',
                    borderRadius: '50%',
                    background: '#10b981'
                  }}></div>
                  <span style={{ color: 'var(--text-secondary)' }}>Available</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '1rem',
                    height: '1rem',
                    borderRadius: '50%',
                    background: '#ef4444'
                  }}></div>
                  <span style={{ color: 'var(--text-secondary)' }}>Booked</span>
                </div>
                {mode === 'view' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '1rem',
                      height: '1rem',
                      borderRadius: '50%',
                      background: '#10b981',
                      border: '2px solid #3b82f6'
                    }}></div>
                    <span style={{ color: 'var(--text-secondary)' }}>Selected</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {mode === 'view' ? (
              /* Booking Summary */
              <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '1.5rem' }}>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '1rem'
                }}>
                  Booking Summary
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginBottom: '0.5rem'
                  }}>
                    Selected Weekday
                  </div>
                  <div style={{
                    padding: '0.75rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: selectedWeekday !== null ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}>
                    {selectedWeekday !== null ? WEEKDAYS[selectedWeekday] : 'Not selected'}
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginBottom: '0.5rem'
                  }}>
                    Selected Seats
                  </div>
                  {selectedSeats.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {selectedSeats.map(seatId => {
                        const seat = seats.find(s => s.id === seatId)
                        return (
                          <div
                            key={seatId}
                            style={{
                              padding: '0.5rem 0.75rem',
                              background: 'var(--accent-primary)',
                              color: 'white',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              fontWeight: '600'
                            }}
                          >
                            {seat?.label}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div style={{
                      padding: '0.75rem',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      color: 'var(--text-muted)',
                      textAlign: 'center'
                    }}>
                      No seats selected
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowBookingDialog(true)}
                  disabled={selectedSeats.length === 0 || selectedWeekday === null}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.875rem', fontSize: '0.875rem', fontWeight: '600' }}
                >
                  Continue to Book
                </button>

                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6'
                }}>
                  <strong style={{ color: 'var(--accent-primary)' }}>💡 Tip:</strong> You can book one seat per weekday. The booking is indefinite (every week).
                </div>
              </div>
            ) : (
              /* Edit Controls */
              <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '1.5rem' }}>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '1rem'
                }}>
                  Layout Controls
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginBottom: '0.5rem'
                  }}>
                    Seat Prefix
                  </label>
                  <input
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                    maxLength={2}
                    style={{ width: '100%', padding: '0.75rem', fontSize: '0.875rem' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginBottom: '0.5rem'
                  }}>
                    Seat Size: {seatSize}px
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={seatSize}
                    onChange={(e) => setSeatSize(Number(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: 'var(--accent-primary)'
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.625rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.25rem'
                  }}>
                    <span>Small (5px)</span>
                    <span>Large (30px)</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginBottom: '0.5rem'
                  }}>
                    Floor Plan Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                <button
                  onClick={handleSave}
                  className="btn btn-primary"
                  style={{ width: '100%', marginBottom: '0.5rem' }}
                >
                  💾 Save Layout
                </button>

                {bgImage && (
                  <button
                    onClick={() => setBgImage(null)}
                    className="btn btn-secondary"
                    style={{ width: '100%', marginBottom: '0.5rem' }}
                  >
                    🗑️ Clear Image
                  </button>
                )}

                {selectedSeatsForDeletion.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="btn btn-danger"
                    style={{ width: '100%', marginBottom: '0.5rem' }}
                  >
                    Delete {selectedSeatsForDeletion.length} Seat(s)
                  </button>
                )}

                <button
                  onClick={() => {
                    if (confirm('Clear all seats?')) {
                      setSeats([])
                    }
                  }}
                  className="btn btn-danger"
                  style={{ width: '100%' }}
                >
                  ⚠️ Clear All Seats
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Booking Dialog */}
        {showBookingDialog && selectedSeats.length > 0 && selectedWeekday !== null && (
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
            <div className="card" style={{
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
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
                  Confirm Booking
                </h2>
                <button
                  onClick={() => {
                    setShowBookingDialog(false)
                    setBookedForName('')
                    setBookedForEmail('')
                    setNotes('')
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Weekday
                  </div>
                  <div style={{
                    padding: '0.75rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                  }}>
                    {WEEKDAYS[selectedWeekday]}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Selected Seats
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {selectedSeats.map(seatId => {
                      const seat = seats.find(s => s.id === seatId)
                      return (
                        <div
                          key={seatId}
                          style={{
                            padding: '0.5rem 0.75rem',
                            background: 'var(--accent-primary)',
                            color: 'white',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                          }}
                        >
                          {seat?.label}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginBottom: '0.5rem'
                  }}>
                    Booked For (Optional)
                  </label>
                  <input
                    type="text"
                    value={bookedForName}
                    onChange={(e) => setBookedForName(e.target.value)}
                    placeholder="Name"
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
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={bookedForEmail}
                    onChange={(e) => setBookedForEmail(e.target.value)}
                    placeholder="email@example.com"
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
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requirements..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setShowBookingDialog(false)
                      setBookedForName('')
                      setBookedForEmail('')
                      setNotes('')
                    }}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBook}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    ✓ Confirm Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
