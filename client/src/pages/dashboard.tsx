import { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Target, MessageSquare, BarChart3, LogOut } from 'lucide-react';

export default function Dashboard() {
  const [, setLocation] = useLocation();

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

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menuItems = [
    {
      title: 'Attendance',
      description: 'Track your daily work hours and breaks',
      icon: Calendar,
      href: '/attendance',
      color: 'text-blue-600',
    },
    {
      title: 'Clients',
      description: 'Manage client information and contacts',
      icon: Users,
      href: '/clients',
      color: 'text-green-600',
    },
    {
      title: 'Leads',
      description: 'Track leads through the sales pipeline',
      icon: Target,
      href: '/leads',
      color: 'text-purple-600',
    },
    {
      title: 'Follow-ups',
      description: 'Schedule and manage client follow-ups',
      icon: MessageSquare,
      href: '/followups',
      color: 'text-orange-600',
    },
    {
      title: 'Reports',
      description: 'View analytics and sales funnel data',
      icon: BarChart3,
      href: '/reports',
      color: 'text-pink-600',
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Company Management</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user.name}</p>
          </div>
          <Button
            data-testid="button-logout"
            variant="outline"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/crm">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-primary text-primary-foreground" data-testid="card-crm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span>→</span>
                  Go to CRM
                </CardTitle>
                <CardDescription className="text-primary-foreground/70">Access the full management system</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
