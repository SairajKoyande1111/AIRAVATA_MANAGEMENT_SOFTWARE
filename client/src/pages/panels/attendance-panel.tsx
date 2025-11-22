import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Clock, Coffee, LogOut as ClockOut, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AttendancePanel() {
  // Initialize with today's date in IST
  const getTodayIST = () => {
    const now = new Date();
    const istDate = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    return istDate.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTodayIST());
  const [allAttendance, setAllAttendance] = useState<any[]>([]);
  const [myAttendance, setMyAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchAllAttendance();
    const interval = setInterval(fetchAllAttendance, 10000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const fetchAllAttendance = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/attendance?date=${selectedDate}`, {
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
          'Content-Type': 'application/json',
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

  const handleDateChange = (days: number) => {
    const date = new Date(selectedDate + 'T00:00:00');
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const formatTime = (date: string | null) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getIndianDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00Z');
    const istDate = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));
    return istDate.toISOString().split('T')[0];
  };

  const calculateWorkTime = (attendance: any) => {
    if (!attendance.clockIn || !attendance.clockOut) return 0;
    
    const clockIn = new Date(attendance.clockIn).getTime();
    const clockOut = new Date(attendance.clockOut).getTime();
    let workMinutes = (clockOut - clockIn) / (1000 * 60);
    
    if (attendance.breakStart && attendance.breakEnd) {
      const breakStart = new Date(attendance.breakStart).getTime();
      const breakEnd = new Date(attendance.breakEnd).getTime();
      const breakMinutes = (breakEnd - breakStart) / (1000 * 60);
      workMinutes -= breakMinutes;
    }
    
    return Math.floor(workMinutes);
  };

  const getStatus = (attendance: any) => {
    if (attendance.clockOut) return { label: 'Completed', variant: 'secondary' as const };
    if (attendance.breakStart && !attendance.breakEnd) return { label: 'On Break', variant: 'default' as const };
    if (attendance.clockIn) return { label: 'Working', variant: 'default' as const };
    return { label: 'Not Started', variant: 'outline' as const };
  };

  const now = new Date();
  const istDate = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  const todayIST = istDate.toISOString().split('T')[0];
  const isToday = selectedDate === todayIST;
  
  const dateObj = new Date(selectedDate + 'T00:00:00Z');
  const istDateTime = new Date(dateObj.getTime() + (5.5 * 60 * 60 * 1000));
  const dayName = istDateTime.toLocaleDateString('en-IN', { weekday: 'long' });
  const formattedDate = istDateTime.toLocaleDateString('en-IN');

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">Manage your work hours and breaks</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchAllAttendance()}
          data-testid="button-refresh"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDateChange(-1)}
          data-testid="button-prev-date"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="min-w-[200px]">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            data-testid="input-date"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDateChange(1)}
          disabled={!isToday}
          data-testid="button-next-date"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <span className="text-sm text-muted-foreground">{dayName}</span>
      </div>

      {isToday && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
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
                <CardTitle>Your Status</CardTitle>
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
                {calculateWorkTime(myAttendance) > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">Total Work Time</p>
                    <p className="text-2xl font-bold text-primary">
                      {Math.floor(calculateWorkTime(myAttendance) / 60)}h {calculateWorkTime(myAttendance) % 60}m
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Team Attendance - {dayName}, {formattedDate}</CardTitle>
          <CardDescription>View everyone's attendance records</CardDescription>
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
                allAttendance.filter(a => a.userId).map((attendance) => {
                  const status = getStatus(attendance);
                  const workTime = calculateWorkTime(attendance);
                  const userId = typeof attendance.userId === 'object' ? attendance.userId._id : attendance.userId;
                  const userName = typeof attendance.userId === 'object' ? attendance.userId.name : 'Unknown';
                  
                  return (
                    <TableRow key={attendance._id} data-testid={`row-attendance-${userId}`}>
                      <TableCell className="font-medium">
                        {userName}
                        {userId === currentUser.id && (
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
                        {workTime > 0 ? (
                          <span className="font-semibold">
                            {Math.floor(workTime / 60)}h {workTime % 60}m
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
                    No attendance records for this date
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
