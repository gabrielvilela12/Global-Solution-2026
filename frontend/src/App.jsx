import { useState } from 'react'
import LoginScreen    from './screens/LoginScreen.jsx'
import HomeScreen     from './screens/HomeScreen.jsx'
import DetailScreen   from './screens/DetailScreen.jsx'
import CheckoutScreen from './screens/CheckoutScreen.jsx'
import DashboardScreen from './screens/DashboardScreen.jsx'

export default function App() {
  const [screen, setScreen] = useState('login')
  const [selSat, setSelSat] = useState(null)
  const [flash,  setFlash]  = useState(null)

  const go = (s) => { setScreen(s); window.scrollTo({ top: 0 }) }

  const handleLogin   = () => go('home')
  const handleOpen    = (sat) => { setSelSat(sat); go('details') }
  const handleRequest = (sat) => { setSelSat(sat); go('checkout') }
  const handleConfirm = (sol) => { setFlash(sol); go('dashboard') }
  const nav = (s) => { if (s === 'login') setFlash(null); go(s) }

  if (screen === 'login')     return <LoginScreen    onLogin={handleLogin} />
  if (screen === 'home')      return <HomeScreen     onNav={nav} onOpen={handleOpen} />
  if (screen === 'details')   return <DetailScreen   sat={selSat} onNav={nav} onRequest={handleRequest} />
  if (screen === 'checkout')  return <CheckoutScreen sat={selSat} onNav={nav} onConfirm={handleConfirm} />
  if (screen === 'dashboard') return <DashboardScreen onNav={nav} flash={flash} />
  return null
}
