import axios from 'axios'

const http = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Inyectar JWT en cada request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('aljaba_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Manejar 401 globalmente
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('aljaba_token')
      localStorage.removeItem('aljaba_auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export default http
