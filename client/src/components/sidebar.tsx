import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Users, Target, MessageSquare, BarChart3, LogOut } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ activeSection, onSectionChange, onLogout }: SidebarProps) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const sections = [
    { id: 'attendance', label: 'Attendance', icon: Calendar, color: 'text-blue-600' },
    { id: 'clients', label: 'Clients', icon: Users, color: 'text-green-600' },
    { id: 'leads', label: 'Leads', icon: Target, color: 'text-purple-600' },
    { id: 'followups', label: 'Follow-ups', icon: MessageSquare, color: 'text-orange-600' },
    { id: 'reports', label: 'Reports', icon: BarChart3, color: 'text-pink-600' },
  ];

  return (
    <div className="w-64 border-r bg-background flex flex-col h-screen">
      <div className="p-6 border-b">
        <Link href="/dashboard">
          <h2 className="text-xl font-bold cursor-pointer hover:text-primary">Company</h2>
        </Link>
        <p className="text-xs text-muted-foreground mt-1">{user.name}</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              data-testid={`sidebar-${section.id}`}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <Icon className={`w-5 h-5 ${!isActive && section.color}`} />
              <span className="font-medium">{section.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onLogout}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
