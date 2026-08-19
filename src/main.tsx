import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { ToastProvider } from './hooks/useToast'
import { authService } from './services/api/auth.service'
import './styles/index.css'

// A page reload drops the in-memory access token but not the httpOnly
// refresh cookie — try to silently restore the session before the app (and
// AppDataProvider's org/user fetches) mounts, so a refresh doesn't look
// like a logout. Failure here just means "not logged in" — no error to show.
authService.bootstrapSession().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </StrictMode>,
  )
})
