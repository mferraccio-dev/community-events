'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function DashboardPage() {
  const [events, setEvents] = useState([])
  const [user, setUser] = useState(null)
  const [rsvps, setRsvps] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()
    setUser(profile)

    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .eq('cancelled', false)
      .order('event_date', { ascending: true })
    setEvents(eventsData || [])

    const { data: rsvpData } = await supabase
      .from('rsvps')
      .select('*')
      .eq('user_id', authUser.id)
    const rsvpMap = {}
    rsvpData?.forEach(r => { rsvpMap[r.event_id] = r.response })
    setRsvps(rsvpMap)

    setLoading(false)
  }

  async function handleRsvp(eventId, response) {
    const { data: { user: authUser } } = await supabase.auth.getUser()

    const existing = Object.keys(rsvps).includes(eventId)

    if (existing) {
      await supabase
        .from('rsvps')
        .update({ response })
        .eq('user_id', authUser.id)
        .eq('event_id', eventId)
    } else {
      await supabase
        .from('rsvps')
        .insert({ user_id: authUser.id, event_id: eventId, response })
    }

    setRsvps({ ...rsvps, [eventId]: response })
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) return <div style={{ padding: '80px 20px', fontFamily: 'sans-serif', color: '#666' }}>Loading...</div>

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '500', marginBottom: '4px' }}>Upcoming events</h1>
          <p style={{ fontSize: '14px', color: '#666' }}>Welcome, {user?.full_name}</p>
        </div>
        <button
          onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login' }}
          style={{ fontSize: '13px', padding: '6px 14px', borderRadius: '8px', border: '1px solid #ddd', background: 'transparent', cursor: 'pointer', color: '#666' }}
        >
          Sign out
        </button>
      </div>

      {events.length === 0 && (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
          No upcoming events yet. Check back soon.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {events.map(event => (
          <div key={event.id} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '20px', background: '#fff' }}>
            <div style={{ marginBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>{event.title}</h2>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>{formatDate(event.event_date)}</p>
              {event.location && <p style={{ fontSize: '13px', color: '#666' }}>{event.location}</p>}
            </div>

            {event.description && (
              <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.6', marginBottom: '16px' }}>{event.description}</p>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              {['yes', 'maybe', 'no'].map(response => (
                <button
                  key={response}
                  onClick={() => handleRsvp(event.id, response)}
                  style={{
                    padding: '6px 16px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
                    border: rsvps[event.id] === response ? '1px solid #000' : '1px solid #ddd',
                    background: rsvps[event.id] === response ? '#000' : 'transparent',
                    color: rsvps[event.id] === response ? '#fff' : '#666',
                    fontWeight: rsvps[event.id] === response ? '500' : '400'
                  }}
                >
                  {response.charAt(0).toUpperCase() + response.slice(1)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}