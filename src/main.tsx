import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppRoutes } from './routes'

document.body.style.margin = "0";
document.body.style.overflowX = "auto";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRoutes />
  </StrictMode>,
)
