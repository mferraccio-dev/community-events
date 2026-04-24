export default function PendingPage() {
  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '500', marginBottom: '12px' }}>You're on the list</h1>
      <p style={{ color: '#666', lineHeight: '1.6' }}>
        Your application is being reviewed. You'll receive an email once an admin approves your account.
      </p>
    </div>
  )
}