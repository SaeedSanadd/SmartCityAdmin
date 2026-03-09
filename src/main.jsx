import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthContextProvider from './Context/AuthContext.jsx'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthContextProvider>
        <App />
      <Toaster
        position="top-center"
        gutter={8}
        toastOptions={{
          duration: 2500,
          style: {
            borderRadius: "16px",
            padding: "12px 16px",
            fontSize: "14px",
            background: "#0f172a",   // slate-900
            color: "#fff",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          },
          success: {
            iconTheme: {
              primary: "#22c55e",   // green-500
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",   // red-500
              secondary: "#fff",
            },
          },
        }}
      />
    </AuthContextProvider>
  </StrictMode>,
)
