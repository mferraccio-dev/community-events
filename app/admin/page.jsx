'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  async function updateStatus(id, status) {
    await supabase
      .from('users')
      .update({ status })
      .eq('id', id)

    const user = users.find(u => u.id === id)
    if (user) {
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: status === 'approved' ? 'approved' : 'removed',
          to: user.email,
          name: user.full_name
        })
      })
    }

    fetchUsers()
  }

  function calculateAge(dob) {
    const today = new Date()
    const birthDate = new Date(dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
    return age
  }

  function initials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const filtered = filter === 'all' ? users : users.filter(u => u.status === filter)

  const counts = {
    pending: users.filter(u => u.status === 'pending').length,
    approved: users.filter(u => u.status === 'approved').length,
    removed: users.filter(u => u.status === 'removed').length,
  }

  if (loading) return <div style={{ padding: '80px 20px', fontFamily: 'sans-serif', color: '#666' }}>Loading...</div>

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '500', marginBottom: '24px' }}>User management</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[['Pending review', counts.pending], ['Approved members', counts.approved], ['Removed', counts.removed]].map(([label, count]) => (
          <div key={label} style={{ background: '#f5f5f5', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '24px', fontWeight: '500' }}>{count}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['all', 'pending', 'approved', 'removed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid #ddd', background: filter === f ? '#000' : 'transparent', color: filter === f ? '#fff' : '#666', fontSize: '13px', cursor: 'pointer' }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '14px' }}>No users in this category</div>
        )}
        {filtered.map(user => (
          <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', border: '1px solid #eee', borderRadius: '12px', background: '#fff' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: user.status === 'pending' ? '#fef3c7' : user.status === 'approved' ? '#d1fae5' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '500', color: user.status === 'pending' ? '#92400e' : user.status === 'approved' ? '#065f46' : '#6b7280', flexShrink: 0 }}>
              {initials(user.full_name)}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{user.full_name}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{user.email} · Age {calculateAge(user.date_of_birth)} · Joined {new Date(user.created_at).toLocaleDateString()}</div>
            </div>

            <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '10px', fontWeight: '500', background: user.status === 'pending' ? '#fef3c7' : user.status === 'approved' ? '#d1fae5' : '#f3f4f6', color: user.status === 'pending' ? '#92400e' : user.status === 'approved' ? '#065f46' : '#6b7280' }}>
              {user.status}
            </span>

            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              {user.status === 'pending' && (
                <>
                  <button onClick={() => updateStatus(user.id, 'approved')} style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '6px', border: '1px solid #6ee7b7', background: 'transparent', color: '#065f46', cursor: 'pointer' }}>Approve</button>
                  <button onClick={() => updateStatus(user.id, 'removed')} style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '6px', border: '1px solid #fca5a5', background: 'transparent', color: '#991b1b', cursor: 'pointer' }}>Reject</button>
                </>
              )}
              {user.status === 'approved' && (
                <button onClick={() => updateStatus(user.id, 'removed')} style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '6px', border: '1px solid #fca5a5', background: 'transparent', color: '#991b1b', cursor: 'pointer' }}>Remove</button>
              )}
              {user.status === 'removed' && (
                <button onClick={() => updateStatus(user.id, 'approved')} style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '6px', border: '1px solid #93c5fd', background: 'transparent', color: '#1e40af', cursor: 'pointer' }}>Restore</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}