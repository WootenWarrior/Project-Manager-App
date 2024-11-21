import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Landing, Login, Signup } from './pages/index.ts'
import { createBrowserRouter,RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path:"/",
    element:<Landing />,
  },
  {
    path:"/Login",
    element:<Login />
  },
  {
    path:"/Signup",
    element:<Signup />
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
