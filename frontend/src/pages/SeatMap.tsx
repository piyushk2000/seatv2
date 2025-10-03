import { useState, useEffect, useRef, useCallback } from 'react'
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
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [bookedForName, setBookedForName] = useState('')
  const [bookedForEmail, setBookedForEmail] = useState('')
  const [notes, setNotes] = useState('')
  
  // New state for improvements
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [history, setHistory] = useState<Seat[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: 'success' | 'error'}>>([])
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadLayout()
  }, [])

  useEffect(() => {
    drawCanvas()
  }, [seats, selectedSeats, bgImage, bookedSeats, selectedSeatsForDeletion, mode, seatSize, zoom, pan, hoveredSeat])

  useEffect(() => {
    if (selectedWeekday !== null) {
      loadBookedSeats()
    }
  }, [selectedWeekday])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowBookingDialog(false)
        setShowExportDialog(false)
      }
      if (e.key === 'Enter' && showBookingDialog) {
        handleBook()
      }
      if (e.ctrlKey && e.key === 'z' && mode === 'edit') {
        e.preventDefault()
        handleUndo()
      }
      if (e.ctrlKey && e.key === 'y' && mode === 'edit') {
        e.preventDefault()
        handleRedo()
      }
      if (e.key === 'ArrowLeft' && selectedWeekday !== null && selectedWeekday > 0) {
        setSelectedWeekday(selectedWeekday - 1)
        setSelectedSeats([])
      }
      if (e.key === 'ArrowRight' && selectedWeekday !== null && selectedWeekday < 6) {
        setSelectedWeekday(selectedWeekday + 1)
        setSelectedSeats([])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showBookingDialog, showExportDialog, mode, selectedWeekday, seats, historyIndex])

  const addNotification = (message: string, type: 'success' | 'error') => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 3000)
  }

  const saveToHistory = useCallback(() => {
    setHistory(prev => [...prev.slice(0, historyIndex + 1), JSON.parse(JSON.stringify(seats))])
    setHistoryIndex(prev => prev + 1)
  }, [seats, historyIndex])

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setSeats(JSON.parse(JSON.stringify(history[historyIndex - 1])))
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setSeats(JSON.parse(JSON.stringify(history[historyIndex + 1])))
    }
  }

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
      setHistory([JSON.parse(JSON.stringify(data.seats))])
      setHistoryIndex(0)
    } catch (err: any) {
      addNotification(err.message, 'error')
    }
  }

  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear the entire canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Save context state
    ctx.save()
    
    // Apply zoom and pan transformations
    ctx.translate(pan.x, pan.y)
    ctx.scale(zoom, zoom)

    if (bgImage) {
      const img = new Image()
      img.onload = () => {
        // Clear and redraw with transform
        ctx.clearRect(-pan.x / zoom, -pan.y / zoom, canvas.width / zoom, canvas.height / zoom)
        ctx.drawImage(img, 0, 0, 800, 600)
        drawSeats(ctx)
        ctx.restore()
      }
      img.onerror = () => {
        ctx.fillStyle = '#141b3a'
        ctx.fillRect(0, 0, 800, 600)
        drawSeats(ctx)
        ctx.restore()
      }
      img.src = bgImage
    } else {
      ctx.fillStyle = '#141b3a'
      ctx.fillRect(0, 0, 800, 600)
      drawSeats(ctx)
      ctx.restore()
    }
  }

  const drawSeats = (ctx: CanvasRenderingContext2D) => {
    const filteredSeats = searchQuery 
      ? seats.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()))
      : seats

    filteredSeats.forEach(seat => {
      const x = (seat.x / 100) * 800
      const y = (seat.y / 100) * 600

      const isSelected = selectedSeats.includes(seat.id)
      const isBooked = bookedSeats[seat.id]
      const isSelectedForDeletion = selectedSeatsForDeletion.includes(seat.id)
      const isHovered = hoveredSeat === seat.id

      ctx.beginPath()
      ctx.arc(x, y, seatSize * (isHovered ? 1.2 : 1), 0, 2 * Math.PI)

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

      if (isHovered) {
        ctx.strokeStyle = '#feca57'
        ctx.lineWidth = 2
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

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - pan.x) / zoom
    const y = (e.clientY - rect.top - pan.y) / zoom
    return { x, y }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      })
      return
    }

    const coords = getCanvasCoordinates(e)
    if (!coords) return

    const hoveredSeat = seats.find(seat => {
      const sx = (seat.x / 100) * 800
      const sy = (seat.y / 100) * 600
      const distance = Math.sqrt((coords.x - sx) ** 2 + (coords.y - sy) ** 2)
      return distance < seatSize
    })

    setHoveredSeat(hoveredSeat?.id || null)
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Middle mouse button or Ctrl+Click always pans
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      e.preventDefault()
      return
    }

    // Left click - check if clicking on a seat
    if (e.button === 0) {
      const coords = getCanvasCoordinates(e)
      if (!coords) return

      const clickedSeat = seats.find(seat => {
        const sx = (seat.x / 100) * 800
        const sy = (seat.y / 100) * 600
        const distance = Math.sqrt((coords.x - sx) ** 2 + (coords.y - sy) ** 2)
        return distance < seatSize
      })

      // If not clicking on a seat, start panning
      if (!clickedSeat) {
        setIsPanning(true)
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      }
    }
  }

  const handleCanvasMouseUp = () => {
    setIsPanning(false)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) return

    const coords = getCanvasCoordinates(e)
    if (!coords) return

    if (mode === 'edit') {
      const clickedSeat = seats.find(seat => {
        const sx = (seat.x / 100) * 800
        const sy = (seat.y / 100) * 600
        const distance = Math.sqrt((coords.x - sx) ** 2 + (coords.y - sy) ** 2)
        return distance < seatSize
      })

      if (clickedSeat) {
        if (selectedSeatsForDeletion.includes(clickedSeat.id)) {
          setSelectedSeatsForDeletion(selectedSeatsForDeletion.filter(id => id !== clickedSeat.id))
        } else {
          setSelectedSeatsForDeletion([...selectedSeatsForDeletion, clickedSeat.id])
        }
      } else {
        const xPercent = (coords.x / 800) * 100
        const yPercent = (coords.y / 600) * 100
        const nextNum = getNextNumber()
        const newSeat: Seat = {
          id: Date.now().toString(),
          label: `${prefix}${nextNum}`,
          x: xPercent,
          y: yPercent
        }
        saveToHistory()
        setSeats([...seats, newSeat])
      }
    } else {
      if (selectedWeekday === null) {
        addNotification('Please select a weekday first', 'error')
        return
      }

      const clickedSeat = seats.find(seat => {
        const sx = (seat.x / 100) * 800
        const sy = (seat.y / 100) * 600
        const distance = Math.sqrt((coords.x - sx) ** 2 + (coords.y - sy) ** 2)
        return distance < seatSize
      })

      if (clickedSeat) {
        if (bookedSeats[clickedSeat.id]) {
          const bookedBy = bookedSeats[clickedSeat.id]
          addNotification(`Seat booked by ${bookedBy.user_name}`, 'error')
          return
        }

        if (e.shiftKey && selectedSeats.length > 0) {
          // Bulk selection with shift
          if (selectedSeats.includes(clickedSeat.id)) {
            setSelectedSeats(selectedSeats.filter(id => id !== clickedSeat.id))
          } else {
            setSelectedSeats([...selectedSeats, clickedSeat.id])
          }
        } else {
          if (selectedSeats.includes(clickedSeat.id)) {
            setSelectedSeats(selectedSeats.filter(id => id !== clickedSeat.id))
          } else {
            setSelectedSeats([...selectedSeats, clickedSeat.id])
          }
        }
      }
    }
  }

  // Scroll wheel zoom disabled - use zoom buttons instead
  // const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
  //   e.preventDefault()
  //   const delta = e.deltaY > 0 ? 0.9 : 1.1
  //   const newZoom = Math.min(Math.max(0.5, zoom * delta), 3)
  //   setZoom(newZoom)
  // }

  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const selectAllAvailable = () => {
    if (selectedWeekday === null) {
      addNotification('Please select a weekday first', 'error')
      return
    }
    const available = seats.filter(s => !bookedSeats[s.id]).map(s => s.id)
    setSelectedSeats(available)
    addNotification(`Selected ${available.length} available seats`, 'success')
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
      addNotification('Layout saved!', 'success')
    } catch (err: any) {
      addNotification(err.message, 'error')
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addNotification('Image too large (max 5MB)', 'error')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        addNotification('Please select an image file', 'error')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        setBgImage(dataUrl)
        addNotification('Floor plan uploaded!', 'success')
      }
      reader.onerror = () => {
        addNotification('Failed to read image', 'error')
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
      addNotification(`${selectedSeats.length} seat(s) booked!`, 'success')
      setShowBookingDialog(false)
      setSelectedSeats([])
      setBookedForName('')
      setBookedForEmail('')
      setNotes('')
      loadBookedSeats()
    } catch (err: any) {
      addNotification(err.message, 'error')
    }
  }

  const handleDeleteSelected = () => {
    saveToHistory()
    setSeats(seats.filter(s => !selectedSeatsForDeletion.includes(s.id)))
    setSelectedSeatsForDeletion([])
  }

  const exportLayout = () => {
    const data = {
      seats,
      bgImage,
      exportDate: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `seat-layout-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    addNotification('Layout exported!', 'success')
  }

  const importLayout = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        if (data.seats && Array.isArray(data.seats)) {
          saveToHistory()
          setSeats(data.seats)
          if (data.bgImage) setBgImage(data.bgImage)
          addNotification('Layout imported!', 'success')
        } else {
          addNotification('Invalid layout file', 'error')
        }
      } catch (err) {
        addNotification('Failed to import layout', 'error')
      }
    }
    reader.readAsText(file)
  }

  return (
    <Layout>
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Toast Notifications */}
        <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {notifications.map(notif => (
            <div
              key={notif.id}
              className="animate-slide-down"
              style={{
                padding: '1rem 1.5rem',
                borderRadius: '8px',
                background: notif.type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '500',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(10px)',
                minWidth: '250px'
              }}
            >
              {notif.message}
            </div>
          ))}
        </div>

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
                ? 'Click to add seats, click existing seats to delete. Ctrl+Z to undo, Ctrl+Y to redo'
                : 'Select a weekday, then choose your seat. Use Shift+Click for multiple seats'}
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          {/* Main Canvas Area */}
          <div>
            {/* Search and Filters */}
            {mode === 'view' && (
              <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="🔍 Search seats (e.g., A1, B2)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ 
                      flex: 1, 
                      padding: '0.625rem 1rem', 
                      fontSize: '0.875rem',
                      borderRadius: '8px'
                    }}
                  />
                  <button
                    onClick={selectAllAvailable}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.625rem 1rem', whiteSpace: 'nowrap' }}
                  >
                    Select All Available
                  </button>
                </div>
              </div>
            )}

            {/* Weekday Selector (View Mode Only) */}
            {mode === 'view' && (
              <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.75rem'
                }}>
                  Step 1: Select Weekday (Use ← → arrow keys)
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

            {/* Canvas with Zoom Controls */}
            <div className="card" style={{ padding: '1.5rem', position: 'relative' }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>{mode === 'edit' ? 'Seat Layout Editor' : 'Step 2: Choose Your Seat'}</span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    onClick={() => setZoom(Math.min(3, zoom + 0.2))}
                    className="btn btn-secondary"
                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                    title="Zoom In"
                  >
                    🔍+
                  </button>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '3rem', textAlign: 'center' }}>
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
                    className="btn btn-secondary"
                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                    title="Zoom Out"
                  >
                    🔍-
                  </button>
                  <button
                    onClick={resetView}
                    className="btn btn-secondary"
                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                    title="Reset View"
                  >
                    ↺
                  </button>
                </div>
              </div>
              
              <div 
                ref={containerRef}
                style={{ 
                  position: 'relative', 
                  overflow: 'hidden',
                  borderRadius: '8px',
                  border: '1px solid var(--border-primary)',
                  cursor: isPanning ? 'grabbing' : 'default'
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  onClick={handleCanvasClick}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  style={{
                    width: '100%',
                    height: 'auto',
                    cursor: isPanning ? 'grabbing' : 'pointer'
                  }}
                />
                
                {/* Hover Tooltip */}
                {hoveredSeat && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    padding: '0.75rem 1rem',
                    background: 'rgba(0, 0, 0, 0.9)',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    pointerEvents: 'none',
                    zIndex: 10,
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      Seat {seats.find(s => s.id === hoveredSeat)?.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                      {bookedSeats[hoveredSeat] 
                        ? `Booked by ${bookedSeats[hoveredSeat].user_name}`
                        : 'Available'}
                    </div>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div style={{
                display: 'flex',
                gap: '1.5rem',
                marginTop: '1rem',
                fontSize: '0.875rem',
                flexWrap: 'wrap'
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
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  💡 Click and drag empty space to pan • Use zoom buttons above
                </div>
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
                    Selected Seats ({selectedSeats.length})
                  </div>
                  {selectedSeats.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
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
                  Continue to Book ({selectedSeats.length})
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
                  <strong style={{ color: 'var(--accent-primary)' }}>💡 Tips:</strong>
                  <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
                    <li>Use Shift+Click for multiple seats</li>
                    <li>Press Esc to close dialogs</li>
                    <li>Use ← → keys to switch weekdays</li>
                  </ul>
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

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <button
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '0.75rem', padding: '0.5rem' }}
                    title="Undo (Ctrl+Z)"
                  >
                    ↶ Undo
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '0.75rem', padding: '0.5rem' }}
                    title="Redo (Ctrl+Y)"
                  >
                    ↷ Redo
                  </button>
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
                      saveToHistory()
                      setSeats([])
                    }
                  }}
                  className="btn btn-danger"
                  style={{ width: '100%', marginBottom: '0.5rem' }}
                >
                  ⚠️ Clear All Seats
                </button>

                <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '1rem', marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    IMPORT/EXPORT
                  </div>
                  <button
                    onClick={exportLayout}
                    className="btn btn-secondary"
                    style={{ width: '100%', marginBottom: '0.5rem', fontSize: '0.75rem' }}
                  >
                    📤 Export Layout
                  </button>
                  <label className="btn btn-secondary" style={{ width: '100%', display: 'block', textAlign: 'center', fontSize: '0.75rem', cursor: 'pointer' }}>
                    📥 Import Layout
                    <input
                      type="file"
                      accept=".json"
                      onChange={importLayout}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
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
            <div className="card animate-scale-in" style={{
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
                    Selected Seats ({selectedSeats.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '100px', overflowY: 'auto' }}>
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
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Press Enter to confirm, Esc to cancel
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
