'use client'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function CreateEventPage() {
  const [formData, setFormData] = useState({
    title: 'Aloha Party',
    description: 'Join us for food, arts & crafts, and more!',
    location: '441 Wadsworth Blvd Ste 107, Lakewood, CO 80226',
    event_date: '2026-05-02T13:00'
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    const { error: insertError } = await supabase
      .from('events')
      .insert({
        title: formData.title,
        description: formData.description,
        location: formData.location,
        event_date: formData.event_date,
        created_by: user.id,
        cancelled: false
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '500', marginBottom: '12px' }}>Event created</h1>
        <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>Your event has been saved and is now visible to approved members.</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <a href="/admin/events/new" onClick={() => setSubmitted(false)} style={{ fontSize: '14px', padding: '10px 20px', borderRadius: '8px', border: '1px solid #ddd', color: '#666', textDecoration: 'none' }}>Create another</a>
          <a href="/admin" style={{ fontSize: '14px', padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#000', color: '#fff', textDecoration: 'none' }}>Back to admin</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <a href="/admin" style={{ fontSize: '13px', color: '#666', textDecoration: 'none' }}>← Back to admin</a>
        <h1 style={{ fontSize: '22px', fontWeight: '500' }}>Create event</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px' }}>Event title</label>
          <input
            name="title"
            type="text"
            required
            value={formData.title}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px' }}>Date and time</label>
          <input
            name="event_date"
            type="datetime-local"
            required
            value={formData.event_date}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px' }}>Location</label>
          <input
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px' }}>Description</label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', resize: 'vertical' }}
          />
        </div>

        {error && (
          <p style={{ color: '#c0392b', fontSize: '14px', marginBottom: '16px' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Creating event...' : 'Create event'}
        </button>
      </form>
    </div>
  )
}