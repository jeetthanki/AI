import { createContext, useContext, useCallback, useState, useEffect } from 'react'

const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(({ message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current, { id, message, type }])

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }

    return id
  }, [removeToast])

  // Optional: clear all toasts on route-level unmounts in future
  useEffect(() => {
    return () => setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            role="status"
            aria-live="polite"
          >
            <span className="toast-message">{toast.message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(toast.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

