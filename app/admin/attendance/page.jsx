'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function AttendancePage() {
  const [events, setEvents] = useState([])
  const [rsvps, setRsvps] = useState({})
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading] = useState(true)

useEffect(() => {
    checkAdminAndFetch()
  }, [])

  async function checkAdminAndFetch() {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) { window.location.href = '/login'; return }
    const { data: profile } = await supabase.from('users').select('role').eq('id', authUser.id).single()
    if (!profile || profile.role !== 'admin') { window.location.href = '/dashboard'; return }
    fetchData()
  }

  async function fetchData() {
    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })

    const { data: rsvpData } = await supabase
      .from('rsvps')
      .select('*, users(full_name, email)')

    const rsvpMap = {}
    rsvpData?.forEach(r => {
      if (!rsvpMap[r.event_id]) rsvpMap[r.event_id] = []
      rsvpMap[r.event_id].push(r)
    })

    setEvents(eventsData || [])
    setRsvps(rsvpMap)
    setLoading(false)
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    })
  }

  function getCount(eventId, response) {
    return (rsvps[eventId] || []).filter(r => r.response === response).length
  }

  function getResponses(eventId, response) {
    return (rsvps[eventId] || []).filter(r => r.response === response)
  }

  if (loading) return (
    <div style={{ padding: '80px 20px', fontFamily: 'sans-serif', color: '#666' }}>Loading...</div>
  )

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <a href="/admin" style={{ fontSize: '13px', color: '#666', textDecoration: 'none' }}>← Back to admin</a>
        <h1 style={{ fontSize: '22px', fontWeight: '500', margin: 0 }}>Event attendance</h1>
      </div>

      {events.length === 0 && (
        <div style={{ padding: '60px', textAlign: 'center', color: '#999', fontSize: '14px', border: '1px solid #eee', borderRadius: '12px' }}>
          No events yet.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {events.map(event => {
          const yesCount = getCount(event.id, 'yes')
          const maybeCount = getCount(event.id, 'maybe')
          const noCount = getCount(event.id, 'no')
          const total = yesCount + maybeCount + noCount
          const isExpanded = expanded === event.id

          return (
            <div key={event.id} style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
              {/* Event header */}
              <div
                onClick={() => setExpanded(isExpanded ? null : event.id)}
                style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', background: isExpanded ? '#f9f9f7' : '#fff' }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '500', color: '#111' }}>{event.title}</span>
                    {event.cancelled && (
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: '#fee2e2', color: '#991b1b', fontWeight: '500' }}>Cancelled</span>
                    )}
                  </div>
                  <div style={{ fontSize: '13px', color: '#444' }}>{formatDate(event.event_date)}</div>
                </div>

                {/* RSVP counts */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'center', padding: '6px 12px', borderRadius: '8px', background: '#dcfce7' }}>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#166534' }}>{yesCount}</div>
                    <div style={{ fontSize: '11px', color: '#166534' }}>Going</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '6px 12px', borderRadius: '8px', background: '#fef9c3' }}>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#854d0e' }}>{maybeCount}</div>
                    <div style={{ fontSize: '11px', color: '#854d0e' }}>Maybe</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '6px 12px', borderRadius: '8px', background: '#fee2e2' }}>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#991b1b' }}>{noCount}</div>
                    <div style={{ fontSize: '11px', color: '#991b1b' }}>Not going</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '6px 12px', borderRadius: '8px', background: '#f3f4f6' }}>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#374151' }}>{total}</div>
                    <div style={{ fontSize: '11px', color: '#374151' }}>Total</div>
                  </div>
                </div>

                <span style={{ color: '#999', fontSize: '18px' }}>{isExpanded ? '▲' : '▼'}</span>
              </div>

              {/* Expanded member list */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid #eee', padding: '16px 20px' }}>
                  {total === 0 && (
                    <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>No RSVPs yet for this event.</p>
                  )}

                  {[['yes', 'Going', '#166534', '#dcfce7'], ['maybe', 'Maybe', '#854d0e', '#fef9c3'], ['no', "Not going", '#991b1b', '#fee2e2']].map(([val, label, color, bg]) => {
                    const responses = getResponses(event.id, val)
                    if (responses.length === 0) return null
                    return (
                      <div key={val} style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {label} ({responses.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {responses.map(r => (
                            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', background: bg }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>
                                {r.users?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>{r.users?.full_name}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>{r.users?.email}</div>
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
          )
        })}
      </div>
    </div>
  )
}