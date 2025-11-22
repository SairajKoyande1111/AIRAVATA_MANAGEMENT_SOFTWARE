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
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

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
        return <RegisterClientPanel editingClientId={editingClientId} onSave={() => setEditingClientId(null)} />;
      case 'clients':
        return <ClientsPanel onNavigate={setActiveSection} />;
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
      <div className="w-64 flex-shrink-0">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onLogout={handleLogout}
        />
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {renderPanel()}
      </div>
    </div>
  );
}
