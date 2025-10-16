import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import App from './App.tsx'
import { HomePage } from './pages/HomePage.tsx'

import './App.css'

// Cria o roteador
const router = createBrowserRouter([
  {
    path: '/',   
    element: <App />,
    children: [
      {
        path: '/',    
        element: <HomePage />, 
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)