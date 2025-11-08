import { useState } from 'react'
import { LoginPage } from './pages/LoginPage'
import { WelcomePage } from './pages/WelcomePage'
import { Layout } from './components/ui/Layout'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState<'welcome' | 'login'>('welcome')

  const renderPage = () => {
    switch (currentPage) {
      case 'welcome':
        return <WelcomePage onGetStarted={() => setCurrentPage('login')} />
      case 'login':
        return <LoginPage onSignupClick={() => setCurrentPage('welcome')} onBackClick={() => setCurrentPage('welcome')} />
      default:
        return <WelcomePage onGetStarted={() => setCurrentPage('login')} />
    }
  }

  return (
    <Layout>
      {renderPage()}
    </Layout>
  )
}

export default App
