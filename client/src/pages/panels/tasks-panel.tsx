import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Eye, ChevronDown, ChevronUp, CheckCircle, Calendar } from 'lucide-react';

export default function TasksPanel() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [pauseReason, setPauseReason] = useState('');
  const { toast } = useToast();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchUsers();
    fetchTasks();
    const interval = setInterval(fetchTasks, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const fetchTasks = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks');
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle || !newTaskDescription || !newTaskAssignedTo) {
      toast({ description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription,
          assignedToId: newTaskAssignedTo,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create task');
      }

      await response.json();
      toast({ description: 'Task created successfully' });
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskAssignedTo('');
      setOpenCreateDialog(false);
      fetchTasks();
    } catch (error) {
      toast({ description: String(error), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          pauseReason: status === 'pause' ? pauseReason : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update task');
      }

      const updatedTask = await response.json();
      toast({ description: 'Task status updated' });
      
      // Update selectedTask immediately to keep dialog open
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(updatedTask.task);
      }
      
      setPauseReason('');
      setNewStatus('');
      
      // Fetch tasks in background
      fetchTasks();
    } catch (error) {
      toast({ description: String(error), variant: 'destructive' });
    }
  };

  const handleApproveTask = async (taskId: string) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/tasks/${taskId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve task');
      }

      toast({ description: 'Task approved successfully' });
      setOpenTaskDialog(false);
      setSelectedTask(null);
      fetchTasks();
    } catch (error) {
      toast({ description: String(error), variant: 'destructive' });
    }
  };

  const handleAddNote = async (taskId: string) => {
    if (!newNote) {
      toast({ description: 'Please enter a note', variant: 'destructive' });
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/tasks/${taskId}/notes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newNote }),
      });

      if (!response.ok) throw new Error('Failed to add note');
      
      const updatedTask = await response.json();
      
      // Update selectedTask immediately to keep dialog open
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(updatedTask.task);
      }
      
      setNewNote('');
      toast({ description: 'Note added successfully' });
      fetchTasks();
    } catch (error) {
      toast({ description: String(error), variant: 'destructive' });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete task');

      toast({ description: 'Task deleted successfully' });
      setOpenTaskDialog(false);
      setSelectedTask(null);
      fetchTasks();
    } catch (error) {
      toast({ description: String(error), variant: 'destructive' });
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      started: 'bg-blue-100 text-blue-800',
      working: 'bg-cyan-100 text-cyan-800',
      pause: 'bg-orange-100 text-orange-800',
      completed: 'bg-purple-100 text-purple-800',
      approved: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const groupNotesByDate = (notes: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    notes.forEach((note) => {
      const dateKey = formatDate(note.date);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(note);
    });
    return grouped;
  };

  const getAssignmentLabel = (task: any) => {
    if (currentUser.id === task.assignedBy._id) {
      return 'Self';
    }
    return task.assignedBy?.name || task.assignedBy?.email;
  };

  const canApprove = (task: any) => {
    return task.status === 'completed' && currentUser.id !== task.assignedTo._id && !task.isApproved;
  };

  const activeTasks = tasks.filter(t => t.status !== 'approved');
  const completedTasks = tasks.filter(t => t.status === 'approved');

  const filteredActiveTasks = activeTasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const createdDate = formatDateOnly(task.createdAt);
    const matchesDate = searchDate ? createdDate.includes(searchDate) : true;
    return matchesSearch && matchesDate;
  });

  const filteredCompletedTasks = completedTasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const createdDate = formatDateOnly(task.createdAt);
    const matchesDate = searchDate ? createdDate.includes(searchDate) : true;
    return matchesSearch && matchesDate;
  });

  const groupedNotes = selectedTask ? groupNotesByDate(selectedTask.notes) : {};
  const dateKeys = Object.keys(groupedNotes).sort().reverse();

  const TaskTable = ({ taskList }: { taskList: any[] }) => {
    const groupedByUser = taskList.reduce((acc: any[], task: any) => {
      const existing = acc.find((g: any) => g.userId === task.assignedTo._id);
      if (existing) {
        existing.tasks.push(task);
      } else {
        acc.push({
          userId: task.assignedTo._id,
          userName: task.assignedTo.name || task.assignedTo.email,
          tasks: [task],
        });
      }
      return acc;
    }, [] as any[]);

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Assigned By</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedByUser.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                No tasks found
              </TableCell>
            </TableRow>
          ) : (
            groupedByUser.flatMap((group: any) => {
              const isExpanded = expandedUsers.has(group.userId);
              const rows: any[] = [
                <TableRow key={`group-${group.userId}`} className="bg-blue-50 hover:bg-blue-100">
                  <TableCell className="w-8">
                    {group.tasks.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newExpanded = new Set(expandedUsers);
                          if (newExpanded.has(group.userId)) {
                            newExpanded.delete(group.userId);
                          } else {
                            newExpanded.add(group.userId);
                          }
                          setExpandedUsers(newExpanded);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell colSpan={7} className="font-semibold py-3">
                    {group.userName} ({group.tasks.length} {group.tasks.length === 1 ? 'task' : 'tasks'})
                  </TableCell>
                </TableRow>,
              ];

              if (isExpanded || group.tasks.length === 1) {
                group.tasks.forEach((task: any) => {
                  rows.push(
                    <TableRow key={task._id} data-testid={`row-task-${task._id}`} className="hover:bg-gray-50">
                      <TableCell></TableCell>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell className="text-sm text-gray-600 max-w-xs truncate">{task.description}</TableCell>
                      <TableCell>
                        <span className="text-sm">{task.assignedTo.name || task.assignedTo.email}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{getAssignmentLabel(task)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          data-testid={`badge-status-${task._id}`}
                          className={getStatusColor(task.status)}
                        >
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDateOnly(task.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          data-testid={`button-view-${task._id}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTask(task);
                            setOpenTaskDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                });
              }
              return rows;
            })
          )}
        </TableBody>
      </Table>
    );
  };

  const handleArchiveTasks = async () => {
    const token = localStorage.getItem('token');
    const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'approved');
    
    if (completedTasks.length === 0) {
      toast({ description: 'No completed or approved tasks to archive', variant: 'destructive' });
      return;
    }

    const confirmed = window.confirm(`Archive ${completedTasks.length} completed/approved task(s)? Pending, working, and paused tasks will remain active.`);
    
    if (!confirmed) return;

    try {
      const response = await fetch('/api/tasks/archive/daily', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Archive failed');
      
      const data = await response.json();
      toast({ description: `${data.archivedCount} tasks archived successfully. Active tasks remain.` });
      fetchTasks();
      setSearchTerm('');
      setSearchDate('');
    } catch (error) {
      toast({ description: 'Failed to archive tasks', variant: 'destructive' });
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-gray-600">Manage team tasks and track daily progress</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleArchiveTasks}
            data-testid="button-archive-tasks"
            className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-300"
          >
            📦 Archive Daily Tasks
          </Button>
          <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
            <Button 
              data-testid="button-create-task"
              onClick={() => setOpenCreateDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Task Title</label>
                  <Input
                    data-testid="input-task-title"
                    placeholder="Enter task title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    data-testid="input-task-description"
                    placeholder="Enter task description"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Assign To</label>
                  <Select value={newTaskAssignedTo} onValueChange={setNewTaskAssignedTo}>
                    <SelectTrigger data-testid="select-assign-to">
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user._id === currentUser.id ? 'Self' : user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  data-testid="button-submit-task"
                  onClick={handleCreateTask}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search by task name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
          data-testid="input-search-tasks"
        />
        <div className="flex items-center gap-2">
          <input
            type="date"
            onChange={(e) => {
              const date = new Date(e.target.value);
              const formatted = date.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' });
              setSearchDate(formatted);
            }}
            className="hidden"
            id="task-date-filter"
            data-testid="input-search-date"
          />
          <label
            htmlFor="task-date-filter"
            className="cursor-pointer p-2 rounded hover:bg-gray-100 transition-colors flex items-center gap-2"
            title={searchDate ? `Filtering by ${searchDate}` : 'Click to filter by date'}
            data-testid="button-date-filter-tasks"
          >
            <Calendar className={`w-5 h-5 ${searchDate ? 'text-blue-600' : 'text-gray-600'}`} />
            {searchDate && <span className="text-xs text-gray-700 bg-blue-50 px-2 py-1 rounded">{searchDate}</span>}
          </label>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            Active Tasks ({filteredActiveTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed & Approved ({filteredCompletedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskTable taskList={filteredActiveTasks} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed & Approved Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskTable taskList={filteredCompletedTasks} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Detail Dialog - Moved outside table */}
      <Dialog open={openTaskDialog} onOpenChange={(open) => {
        setOpenTaskDialog(open);
        if (!open) {
          setSelectedTask(null);
          setNewNote('');
          setNewStatus('');
          setPauseReason('');
          setSelectedDateFilter(null);
        }
      }}>
        {selectedTask && (
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTask.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Assigned To</label>
                  <p className="mt-1">{selectedTask.assignedTo.name || selectedTask.assignedTo.email}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Assigned By</label>
                  <p className="mt-1">{getAssignmentLabel(selectedTask)}</p>
                </div>
              </div>

              {selectedTask.isApproved && selectedTask.approvedBy && (
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <p className="text-sm font-medium text-green-800">Approved By:</p>
                  <p className="text-sm text-green-700">{typeof selectedTask.approvedBy === 'object' ? (selectedTask.approvedBy.name || selectedTask.approvedBy.email) : selectedTask.approvedBy}</p>
                  <p className="text-xs text-green-600 mt-1">{formatDate(selectedTask.approvedAt)}</p>
                </div>
              )}

              {selectedTask.pauseReason && (
                <div className="bg-red-50 p-3 rounded border border-red-200">
                  <p className="text-sm font-medium text-red-800">Pause Reason:</p>
                  <p className="text-sm text-red-700">{selectedTask.pauseReason}</p>
                </div>
              )}

              {selectedTask.status !== 'approved' && (
                <div className="border-t pt-4 space-y-4">
                  <div>
                    <label className="text-sm font-semibold">Status</label>
                    <Select 
                      value={selectedTask.status} 
                      onValueChange={(status) => {
                        if (status === 'pause') {
                          setPauseReason('');
                          setNewStatus(status);
                        } else {
                          handleStatusChange(selectedTask._id, status);
                        }
                      }}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder={selectedTask.status} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="working">Working</SelectItem>
                        <SelectItem value="pause">Pause</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newStatus === 'pause' && (
                    <div>
                      <label className="text-sm font-semibold">Pause Reason</label>
                      <Input
                        placeholder="Enter reason for pause"
                        value={pauseReason}
                        onChange={(e) => setPauseReason(e.target.value)}
                        className="mt-2"
                      />
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => handleStatusChange(selectedTask._id, 'pause')}
                      >
                        Confirm Pause
                      </Button>
                    </div>
                  )}

                  {canApprove(selectedTask) && (
                    <Button
                      variant="default"
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleApproveTask(selectedTask._id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Task
                    </Button>
                  )}
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">Daily Progress Notes</h4>
                {dateKeys.length > 0 ? (
                  <div className="space-y-4 mb-6">
                    {dateKeys.map((dateKey) => (
                      <div
                        key={dateKey}
                        className="border rounded-lg p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                        onClick={() =>
                          setSelectedDateFilter(
                            selectedDateFilter === dateKey ? null : dateKey
                          )
                        }
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{dateKey}</p>
                          {selectedDateFilter === dateKey ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>

                        {selectedDateFilter === dateKey && (
                          <div className="mt-3 space-y-2 border-t pt-3">
                            {groupedNotes[dateKey].map((note: any, idx: number) => (
                              <div key={idx} className="text-sm whitespace-pre-wrap bg-white p-2 rounded">
                                {note.content}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-6">No notes yet</p>
                )}

                <div className="space-y-3">
                  <label className="text-sm font-semibold">Add Note for Today</label>
                  <Textarea
                    placeholder="Add a note (use • for pointers)"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1"
                    rows={3}
                  />
                  <Button
                    onClick={() => handleAddNote(selectedTask._id)}
                  >
                    Add Note
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 justify-between pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteTask(selectedTask._id);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Task
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
