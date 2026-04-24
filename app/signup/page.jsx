'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    date_of_birth: ''
  })
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  function calculateAge(dob) {
    const today = new Date()
    const birthDate = new Date(dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
    return age
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (calculateAge(formData.date_of_birth) < 18) {
      setError('You must be 18 or older to join.')
      setLoading(false)
      return
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: formData.email,
        full_name: formData.full_name,
        date_of_birth: formData.date_of_birth,
        status: 'pending',
        role: 'member'
      })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'pending',
        to: formData.email,
        name: formData.full_name
      })
    })

    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: '400px', margin: '80px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '500', marginBottom: '12px' }}>You're on the list</h1>
        <p style={{ color: '#666', lineHeight: '1.6' }}>Thanks for signing up. An admin will review your application and you'll receive an email once you're approved.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '500', marginBottom: '8px' }}>Create your account</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>Members must be 18 or older.</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px' }}>Full name</label>
          <input
            name="full_name"
            type="text"
            required
            value={formData.full_name}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px' }}>Email</label>
          <input
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px' }}>Password</label>
          <input
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px' }}>Date of birth</label>
          <input
            name="date_of_birth"
            type="date"
            required
            value={formData.date_of_birth}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
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
          {loading ? 'Creating account...' : 'Request access'}
        </button>
      </form>
    </div>
  )
}