import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Sidebar from '@/components/sidebar';
import AttendancePanel from './panels/attendance-panel';
import TasksPanel from './panels/tasks-panel';
import HistoryPanel from './panels/history-panel';
import RegisterClientPanel from './panels/register-client-panel';
import ClientsPanel from './panels/clients-panel';
import LeadsPanel from './panels/leads-panel';
import FollowupsPanel from './panels/followups-panel';
import ReportsPanel from './panels/reports-panel';

export default function CRMDashboard() {
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState('attendance');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLocation('/');
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setLocation('/');
  };

  const renderPanel = () => {
    switch (activeSection) {
      case 'attendance':
        return <AttendancePanel />;
      case 'tasks':
        return <TasksPanel />;
      case 'history':
        return <HistoryPanel />;
      case 'register-client':
        return <RegisterClientPanel />;
      case 'clients':
        return <ClientsPanel />;
      case 'leads':
        return <LeadsPanel />;
      case 'followups':
        return <FollowupsPanel />;
      case 'reports':
        return <ReportsPanel />;
      default:
        return <AttendancePanel />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={handleLogout}
      />
      <div className="flex-1 overflow-auto">
        {renderPanel()}
      </div>
    </div>
  );
}
