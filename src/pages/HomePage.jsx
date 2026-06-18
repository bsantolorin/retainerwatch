import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import RoleGatePage from './RoleGatePage';
import AttorneyDashboard from './AttorneyDashboard';
import ClientDashboard from './ClientDashboard';
import { useOutletContext } from 'react-router-dom';

export default function HomePage() {
  const { user } = useOutletContext();
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => { setCurrentUser(user); }, [user]);

  if (!currentUser?.role) {
    return <RoleGatePage onRoleSet={async () => {
      const u = await base44.auth.me();
      setCurrentUser(u);
    }} />;
  }

  if (currentUser.role === 'attorney' || currentUser.role === 'admin') return <AttorneyDashboard />;
  return <ClientDashboard />;
}