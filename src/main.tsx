import './styles/Global.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ProtectedRoute } from './utils/Protected.tsx'
import { Dashboard, Landing, Login, Signup, Project, Error } from './pages/index.ts'
import { createBrowserRouter,RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path:"/",
    element:<Landing />,
    errorElement: <Error />
  },
  {
    path:"/Login",
    element:<Login />,
    errorElement: <Error />
  },
  {
    path:"/Signup",
    element:<Signup />,
    errorElement: <Error />
  },
  {
    path:"/Dashboard",
    element: <ProtectedRoute />,
    errorElement: <Error />,
    children: [
      {
        path: "",
        element: <Dashboard />,
        errorElement: <Error />
      },
    ]
  },
  {
    path: "Project/:projectID",
    element: <ProtectedRoute />,
    errorElement: <Error />,
    children: [
      {
        path: "",
        element: <Project />,
        errorElement: <Error />
      },
    ]
  },
  {
    path: "*",
    element: <Error header= 'Error 404' message='Page Not Found' />
  },
],)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)