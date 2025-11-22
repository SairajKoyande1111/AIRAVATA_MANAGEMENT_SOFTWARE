import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Clock, Coffee, LogOut as ClockOut } from 'lucide-react';

export default function Attendance() {
  const [, setLocation] = useLocation();
  const [attendance, setAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLocation('/');
      return;
    }
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    const token = localStorage.getItem('token');
    const today = new Date().toISOString().split('T')[0];

    try {
      const response = await fetch(`/api/attendance?date=${today}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.attendance && data.attendance.length > 0) {
        setAttendance(data.attendance[0]);
      }
    } catch (error) {
      console.error('Failed to fetch attendance');
    }
  };

  const handleAction = async (action: string) => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/attendance/${action}`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Action failed');
      }

      toast({
        title: 'Success',
        description: data.message,
      });

      await fetchTodayAttendance();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Attendance Tracking</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Today's Status</CardTitle>
              <CardDescription>Track your work hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Clock In</p>
                <p className="text-lg font-semibold" data-testid="text-clockin">
                  {attendance?.clockIn
                    ? new Date(attendance.clockIn).toLocaleTimeString()
                    : 'Not clocked in'}
                </p>
              </div>

              {attendance?.breakStart && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Break Started</p>
                  <p className="text-lg font-semibold">
                    {new Date(attendance.breakStart).toLocaleTimeString()}
                  </p>
                </div>
              )}

              {attendance?.breakEnd && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Break Ended</p>
                  <p className="text-lg font-semibold">
                    {new Date(attendance.breakEnd).toLocaleTimeString()}
                  </p>
                </div>
              )}

              {attendance?.clockOut && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Clock Out</p>
                  <p className="text-lg font-semibold">
                    {new Date(attendance.clockOut).toLocaleTimeString()}
                  </p>
                </div>
              )}

              {attendance?.totalWorkMinutes > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Total Work Time</p>
                  <p className="text-2xl font-bold text-primary">
                    {Math.floor(attendance.totalWorkMinutes / 60)}h {attendance.totalWorkMinutes % 60}m
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your attendance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                data-testid="button-clockin"
                onClick={() => handleAction('clockin')}
                disabled={loading || attendance?.clockIn}
                className="w-full"
              >
                <Clock className="w-4 h-4 mr-2" />
                Clock In
              </Button>

              <Button
                data-testid="button-break-start"
                onClick={() => handleAction('break/start')}
                disabled={loading || !attendance?.clockIn || attendance?.breakStart}
                variant="outline"
                className="w-full"
              >
                <Coffee className="w-4 h-4 mr-2" />
                Start Break
              </Button>

              <Button
                data-testid="button-break-end"
                onClick={() => handleAction('break/end')}
                disabled={loading || !attendance?.breakStart || attendance?.breakEnd}
                variant="outline"
                className="w-full"
              >
                <Coffee className="w-4 h-4 mr-2" />
                End Break
              </Button>

              <Button
                data-testid="button-clockout"
                onClick={() => handleAction('clockout')}
                disabled={loading || !attendance?.clockIn || attendance?.clockOut || (attendance?.breakStart && !attendance?.breakEnd)}
                variant="destructive"
                className="w-full"
              >
                <ClockOut className="w-4 h-4 mr-2" />
                Clock Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
