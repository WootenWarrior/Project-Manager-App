import './styles/Global.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ProtectedRoute } from './utils/Protected.tsx'
import { Dashboard, Landing, Login, Signup } from './pages/index.ts'
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
  },
  {
    path:"/Dashboard",
    element: <ProtectedRoute />,
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
    ]
  }],
  {
    basename:"/Project-Manager-App/"
  }
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)