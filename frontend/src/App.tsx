import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { WelcomePage } from './pages/WelcomePage'
import { HomePage } from './pages/HomePage'
import { Layout } from './components/ui/Layout'
import './App.css'

function AppRoutes() {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<WelcomePage onGetStarted={() => navigate('/login')} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
