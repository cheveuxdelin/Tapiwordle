import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div style={{width: "1px", position: "absolute", left: "50vw", height: "100vh", backgroundColor: "red", zIndex: "200"}}/>
    <div style={{height: "1px", position: "absolute", top: "50vh", width: "100vw", backgroundColor: "red", zIndex: "200"}}/>
    <App />
  </React.StrictMode>
)
