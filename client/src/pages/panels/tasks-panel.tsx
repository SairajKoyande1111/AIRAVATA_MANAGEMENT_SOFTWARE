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
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Eye, ChevronDown, ChevronUp } from 'lucide-react';

export default function TasksPanel() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
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

      toast({ description: 'Task status updated' });
      setPauseReason('');
      setNewStatus('');
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add note');
      }

      toast({ description: 'Note added successfully' });
      setNewNote('');
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete task');
      }

      toast({ description: 'Task deleted successfully' });
      setSelectedTask(null);
      fetchTasks();
    } catch (error) {
      toast({ description: String(error), variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'started':
        return 'bg-blue-100 text-blue-800';
      case 'working':
        return 'bg-yellow-100 text-yellow-800';
      case 'pause':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
    });
  };

  const groupNotesByDate = (notes: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    notes.forEach((note) => {
      const dateKey = formatDateOnly(note.date);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(note);
    });
    return grouped;
  };

  const getAssignmentLabel = (task: any) => {
    const assignedToId = task.assignedTo._id?.toString() || task.assignedTo._id;
    const assignedById = task.assignedBy._id?.toString() || task.assignedBy._id;
    
    if (assignedToId === assignedById) {
      return 'Self';
    }
    return task.assignedBy.name || task.assignedBy.email;
  };

  const groupedNotes = selectedTask ? groupNotesByDate(selectedTask.notes) : {};
  const dateKeys = Object.keys(groupedNotes).sort().reverse();

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-gray-600">Manage team tasks and track daily progress</p>
        </div>
        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-task">
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </DialogTrigger>
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

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No tasks yet. Create one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Assigned By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task._id} data-testid={`row-task-${task._id}`} className="cursor-pointer hover:bg-gray-50">
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            data-testid={`button-view-${task._id}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTask(task)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        {selectedTask && selectedTask._id === task._id && (
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

                              {selectedTask.pauseReason && (
                                <div className="bg-red-50 p-3 rounded border border-red-200">
                                  <p className="text-sm font-medium text-red-800">Pause Reason:</p>
                                  <p className="text-sm text-red-700">{selectedTask.pauseReason}</p>
                                </div>
                              )}

                              <div className="border-t pt-4">
                                <label className="text-sm font-semibold">Update Status</label>
                                <div className="flex gap-2 mt-3 flex-wrap">
                                  <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger className="w-40">
                                      <SelectValue placeholder="Change status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="started">Started</SelectItem>
                                      <SelectItem value="working">Working</SelectItem>
                                      <SelectItem value="pause">Pause</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                  </Select>

                                  {newStatus === 'pause' && (
                                    <Input
                                      placeholder="Reason for pause"
                                      value={pauseReason}
                                      onChange={(e) => setPauseReason(e.target.value)}
                                      className="flex-1"
                                    />
                                  )}

                                  {newStatus && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleStatusChange(selectedTask._id, newStatus)}
                                    >
                                      Update
                                    </Button>
                                  )}
                                </div>
                              </div>

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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
