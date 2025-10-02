const API_URL = 'http://localhost:8000'

export interface Seat {
  id: string
  label: string
  x: number
  y: number
}

export interface Layout {
  seats: Seat[]
  background_image: string | null
}

export interface User {
  id: number
  email: string
  name: string
  role: 'user' | 'superadmin'
  created_at: string
}

export interface Booking {
  id: number
  seat_id: string
  seat_label?: string
  user_id: number
  user_name?: string
  user_email?: string
  booked_for_name?: string
  booked_for_email?: string
  notes?: string
  status: 'pending' | 'approved' | 'rejected'
  weekday: number  // 0=Monday, 6=Sunday
  created_at: string
}

function getAuthHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || 'Login failed')
    }
    return res.json()
  },

  async getMe(token: string): Promise<User> {
    const res = await fetch(`${API_URL}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to fetch user')
    return res.json()
  },

  async resetPassword(oldPassword: string, newPassword: string, token: string) {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || 'Password reset failed')
    }
    return res.json()
  },

  // User management (SuperAdmin)
  async getUsers(token: string): Promise<User[]> {
    const res = await fetch(`${API_URL}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to fetch users')
    return res.json()
  },

  async createUser(email: string, name: string, password: string, role: string, token: string): Promise<User> {
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ email, name, password, role })
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || 'Failed to create user')
    }
    return res.json()
  },

  async deleteUser(userId: number, token: string) {
    const res = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to delete user')
    return res.json()
  },

  async adminResetPassword(userId: number, newPassword: string, token: string) {
    const res = await fetch(`${API_URL}/auth/admin-reset-password`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ user_id: userId, new_password: newPassword })
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || 'Password reset failed')
    }
    return res.json()
  },

  // Layout
  async getLayout(): Promise<Layout> {
    const res = await fetch(`${API_URL}/layout`)
    if (!res.ok) throw new Error('Failed to fetch layout')
    return res.json()
  },

  async saveLayout(seats: Seat[], backgroundImage: string | null, token: string): Promise<Layout> {
    const res = await fetch(`${API_URL}/layout`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ 
        seats,
        background_image: backgroundImage
      })
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || 'Failed to save layout')
    }
    return res.json()
  },

  async getBookedSeats(weekday: number): Promise<Record<string, any>> {
    const res = await fetch(`${API_URL}/seats/booked?weekday=${weekday}`)
    if (!res.ok) throw new Error('Failed to fetch booked seats')
    const data = await res.json()
    return data.booked_seats
  },

  // Bookings
  async createBooking(
    seatIds: string[],
    weekday: number,
    bookedForName: string,
    bookedForEmail: string,
    notes: string,
    token: string
  ): Promise<Booking[]> {
    const res = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({
        seat_ids: seatIds,
        weekday: weekday,
        booked_for_name: bookedForName || null,
        booked_for_email: bookedForEmail || null,
        notes: notes || null
      })
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || 'Failed to create booking')
    }
    return res.json()
  },

  async getBookings(token: string): Promise<Booking[]> {
    const res = await fetch(`${API_URL}/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to fetch bookings')
    return res.json()
  },

  async updateBookingStatus(bookingId: number, status: string, token: string): Promise<Booking> {
    const res = await fetch(`${API_URL}/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ status })
    })
    if (!res.ok) throw new Error('Failed to update booking')
    return res.json()
  },

  async approveBooking(bookingId: number, token: string) {
    const res = await fetch(`${API_URL}/bookings/${bookingId}/approve`, {
      method: 'PATCH',
      headers: getAuthHeaders(token)
    })
    if (!res.ok) throw new Error('Failed to approve booking')
    return res.json()
  },

  async rejectBooking(bookingId: number, token: string) {
    const res = await fetch(`${API_URL}/bookings/${bookingId}/reject`, {
      method: 'PATCH',
      headers: getAuthHeaders(token)
    })
    if (!res.ok) throw new Error('Failed to reject booking')
    return res.json()
  },

  async cancelBooking(bookingId: number, token: string): Promise<void> {
    const res = await fetch(`${API_URL}/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to cancel booking')
  }
}
