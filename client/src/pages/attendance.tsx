import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Clock, Coffee, LogOut as ClockOut, RefreshCw } from 'lucide-react';

export default function Attendance() {
  const [, setLocation] = useLocation();
  const [allAttendance, setAllAttendance] = useState<any[]>([]);
  const [myAttendance, setMyAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLocation('/');
      return;
    }
    fetchAllAttendance();
    const interval = setInterval(fetchAllAttendance, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllAttendance = async () => {
    const token = localStorage.getItem('token');
    const today = new Date().toISOString().split('T')[0];

    try {
      const response = await fetch(`/api/attendance?date=${today}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setAllAttendance(data.attendance || []);
      
      const mine = data.attendance?.find((a: any) => a.userId._id === currentUser.id);
      setMyAttendance(mine || null);
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

      await fetchAllAttendance();
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

  const formatTime = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatus = (attendance: any) => {
    if (attendance.clockOut) return { label: 'Completed', variant: 'secondary' as const };
    if (attendance.breakStart && !attendance.breakEnd) return { label: 'On Break', variant: 'default' as const };
    if (attendance.clockIn) return { label: 'Working', variant: 'default' as const };
    return { label: 'Not Started', variant: 'outline' as const };
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <Button variant="ghost" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAllAttendance}
            data-testid="button-refresh"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Team Attendance</h1>

        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Actions</CardTitle>
              <CardDescription>Manage your attendance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                data-testid="button-clockin"
                onClick={() => handleAction('clockin')}
                disabled={loading || myAttendance?.clockIn}
                className="w-full"
              >
                <Clock className="w-4 h-4 mr-2" />
                Clock In
              </Button>

              <Button
                data-testid="button-break-start"
                onClick={() => handleAction('break/start')}
                disabled={loading || !myAttendance?.clockIn || myAttendance?.breakStart}
                variant="outline"
                className="w-full"
              >
                <Coffee className="w-4 h-4 mr-2" />
                Start Break
              </Button>

              <Button
                data-testid="button-break-end"
                onClick={() => handleAction('break/end')}
                disabled={loading || !myAttendance?.breakStart || myAttendance?.breakEnd}
                variant="outline"
                className="w-full"
              >
                <Coffee className="w-4 h-4 mr-2" />
                End Break
              </Button>

              <Button
                data-testid="button-clockout"
                onClick={() => handleAction('clockout')}
                disabled={loading || !myAttendance?.clockIn || myAttendance?.clockOut || (myAttendance?.breakStart && !myAttendance?.breakEnd)}
                variant="destructive"
                className="w-full"
              >
                <ClockOut className="w-4 h-4 mr-2" />
                Clock Out
              </Button>
            </CardContent>
          </Card>

          {myAttendance && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Your Today's Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Clock In</p>
                    <p className="text-lg font-semibold">{formatTime(myAttendance.clockIn)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Break Start</p>
                    <p className="text-lg font-semibold">{formatTime(myAttendance.breakStart)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Break End</p>
                    <p className="text-lg font-semibold">{formatTime(myAttendance.breakEnd)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Clock Out</p>
                    <p className="text-lg font-semibold">{formatTime(myAttendance.clockOut)}</p>
                  </div>
                </div>
                {myAttendance.totalWorkMinutes > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">Total Work Time</p>
                    <p className="text-2xl font-bold text-primary">
                      {Math.floor(myAttendance.totalWorkMinutes / 60)}h {myAttendance.totalWorkMinutes % 60}m
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Team Members - Live Status</CardTitle>
            <CardDescription>View everyone's attendance in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Break Start</TableHead>
                  <TableHead>Break End</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead className="text-right">Work Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allAttendance.length > 0 ? (
                  allAttendance.map((attendance) => {
                    const status = getStatus(attendance);
                    return (
                      <TableRow key={attendance._id} data-testid={`row-attendance-${attendance.userId._id}`}>
                        <TableCell className="font-medium">
                          {attendance.userId.name}
                          {attendance.userId._id === currentUser.id && (
                            <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>{formatTime(attendance.clockIn)}</TableCell>
                        <TableCell>{formatTime(attendance.breakStart)}</TableCell>
                        <TableCell>{formatTime(attendance.breakEnd)}</TableCell>
                        <TableCell>{formatTime(attendance.clockOut)}</TableCell>
                        <TableCell className="text-right">
                          {attendance.totalWorkMinutes > 0 ? (
                            <span className="font-semibold">
                              {Math.floor(attendance.totalWorkMinutes / 60)}h {attendance.totalWorkMinutes % 60}m
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No attendance records for today
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
