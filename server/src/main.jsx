import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';

// COLE SEU ID DO GOOGLE AQUI EMBAIXO ENTRE AS ASPAS
const clientId = "82709820990-k9lqi3iokjge6p2jqufqq7asajm6g6gc.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)