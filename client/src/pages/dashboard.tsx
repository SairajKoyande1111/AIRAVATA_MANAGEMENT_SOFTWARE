import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function Dashboard() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLocation('/');
    } else {
      setLocation('/crm');
    }
  }, [setLocation]);

  return null;
}
