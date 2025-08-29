import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAppSelector } from '../../../app/hooks';
import LoginForm from './LoginForm';

export default function LoginScreen() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/home');
    }
  }, [isAuthenticated, setLocation]);

  return <LoginForm />;
}
