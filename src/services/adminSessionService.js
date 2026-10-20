const ADMIN_SESSION_KEY = 'sami_demo_admin_session_v1'

export function getDemoAdminSession() {
  try {
    const value = localStorage.getItem(ADMIN_SESSION_KEY)
    if (!value) return null
    const session = JSON.parse(value)
    return session?.kind === 'frontend-admin-demo'
      ? { ...session, role: 'admin' }
      : null
  } catch (error) {
    console.error('Unable to read the simulated admin session.', error)
    throw new Error('Admin demo storage is unavailable in this browser.')
  }
}

export function startDemoAdminSession() {
  const session = { kind: 'frontend-admin-demo', role: 'admin', startedAt: new Date().toISOString() }
  try {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
    return session
  } catch (error) {
    console.error('Unable to start the simulated admin session.', error)
    throw new Error('The admin demo session could not be started in this browser.')
  }
}

export function endDemoAdminSession() {
  try {
    localStorage.removeItem(ADMIN_SESSION_KEY)
  } catch (error) {
    console.error('Unable to end the simulated admin session.', error)
    throw new Error('Unable to sign out. Please try again.')
  }
}
