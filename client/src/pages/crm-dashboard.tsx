import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Sidebar from '@/components/sidebar';
import AttendancePanel from './panels/attendance-panel';
import TasksPanel from './panels/tasks-panel';
import HistoryPanel from './panels/history-panel';
import RegisterClientPanel from './panels/register-client-panel';
import ClientsPanel from './panels/clients-panel';
import LeadsPanel from './panels/leads-panel';
import ProjectsPanel from './panels/projects-panel';
import FollowupsPanel from './panels/followups-panel';
import ReportsPanel from './panels/reports-panel';

export default function CRMDashboard() {
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState('attendance');
  const [isEditingClient, setIsEditingClient] = useState(false);

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
        return <RegisterClientPanel isEditing={isEditingClient} onSave={() => setIsEditingClient(false)} />;
      case 'clients':
        return <ClientsPanel onNavigate={(section) => setActiveSection(section)} onEditMode={setIsEditingClient} />;
      case 'leads':
        return <LeadsPanel />;
      case 'projects':
        return <ProjectsPanel />;
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
          onSectionChange={(section) => {
            setActiveSection(section);
            if (section !== 'register-client') {
              setIsEditingClient(false);
            } else if (section === 'register-client' && !localStorage.getItem('editingClientData')) {
              setIsEditingClient(false);
            }
          }}
          onLogout={handleLogout}
        />
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {renderPanel()}
      </div>
    </div>
  );
}
