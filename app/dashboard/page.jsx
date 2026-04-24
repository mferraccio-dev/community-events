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
      await supabase.from('rsvps').update({ response }).eq('user_id', authUser.id).eq('event_id', eventId)
    } else {
      await supabase.from('rsvps').insert({ user_id: authUser.id, event_id: eventId, response })
    }
    setRsvps({ ...rsvps, [eventId]: response })
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true
    })
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f7', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#999' }}>Loading...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f7', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#111' }}>Community Events</div>
          <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>Welcome back, {user?.full_name}</div>
        </div>
        <button
          onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login' }}
          style={{ fontSize: '13px', padding: '7px 16px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', color: '#555' }}
        >
          Sign out
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111', marginBottom: '20px' }}>Upcoming Events</h2>

        {events.length === 0 && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '48px', textAlign: 'center', color: '#999', fontSize: '14px', border: '1px solid #eee' }}>
            No upcoming events yet. Check back soon.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {events.map(event => (
            <div key={event.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              {/* Event color bar */}
              <div style={{ height: '6px', background: 'linear-gradient(90deg, #f97316, #fb923c)' }} />

              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111', margin: 0 }}>{event.title}</h3>
                  {rsvps[event.id] && (
                    <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', background: rsvps[event.id] === 'yes' ? '#dcfce7' : rsvps[event.id] === 'maybe' ? '#fef9c3' : '#fee2e2', color: rsvps[event.id] === 'yes' ? '#166534' : rsvps[event.id] === 'maybe' ? '#854d0e' : '#991b1b', fontWeight: '500' }}>
                      {rsvps[event.id] === 'yes' ? '✓ Going' : rsvps[event.id] === 'maybe' ? '? Maybe' : '✗ Not going'}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#555' }}>
                    <span>📅</span>
                    <span>{formatDate(event.event_date)} at {formatTime(event.event_date)}</span>
                  </div>
                  {event.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#555' }}>
                      <span>📍</span>
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>

                {event.description && (
                  <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>{event.description}</p>
                )}

                <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: '13px', color: '#888', marginRight: '4px', alignSelf: 'center' }}>RSVP:</span>
                  {[['yes', '✓ Going'], ['maybe', '? Maybe'], ['no', '✗ Can\'t go']].map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => handleRsvp(event.id, val)}
                      style={{
                        padding: '7px 16px', borderRadius: '20px', fontSize