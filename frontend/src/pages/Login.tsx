import { useNavigate } from 'react-router-dom'
import { LoginForm } from '../components/LoginForm.js'

export function Login() {
  const navigate = useNavigate()
  return <LoginForm onSuccess={() => navigate('/')} />
}
