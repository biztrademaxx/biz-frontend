// lib/api-utils.ts
export const getAuthHeaders = () => {
  if (typeof window === 'undefined') {
    return {}
  }

  // Try to get token from localStorage first
  let token = localStorage.getItem('superAdminToken') || localStorage.getItem('adminToken')
  
  // If not in localStorage, try cookies
  if (!token) {
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('superAdminToken=') || row.startsWith('adminToken='))
      ?.split('=')[1]
    
    if (cookieToken) {
      token = cookieToken
    }
  }

  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }
  return response.json()
}