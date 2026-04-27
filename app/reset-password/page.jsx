'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.replace('#', ''))
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const type = params.get('type')

      if (accessToken && type === 'recovery') {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        }).then(() => setReady(true))
      }
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div style={{ maxWidth: '400px', margin: '80px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '500', marginBottom: '12px' }}>Password updated</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>Your password has been changed. You can now log in.</p>
        <a href="/login" style={{ padding: '10px 20px', background: '#000', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' }}>Go to login</a>
      </div>
    )
  }

  if (!ready) {
    return (
      <div style={{ maxWidth: '400px', margin: '80px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '500', marginBottom: '12px' }}>Reset your password</h1>
        <p style={{ color: '#666' }}>Waiting for authentication... If you arrived here without clicking a reset link, please <a href="/login" style={{ color: '#000' }}>go to login</a>.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '500', marginBottom: '8px' }}>Set new password</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>Enter a new password for your account.</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px' }}>New password</label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px' }}>Confirm password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
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
          {loading ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </div>
  )
}