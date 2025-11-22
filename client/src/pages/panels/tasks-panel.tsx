import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, CheckCircle, Pause } from 'lucide-react';

const FIXED_USERS = [
  { id: '1', email: 'raneaniket23@gmail.com', name: 'Aniket Rane' },
  { id: '2', email: 'sairajkoyande@gmail.com', name: 'Sairaj Koyande' },
  { id: '3', email: 'sejalyadav351@gmail.com', name: 'Sejal Yadav' },
  { id: '4', email: 'pratikkadam2244@gmail.com', name: 'Pratik Kadam' },
  { id: '5', email: 'abhijeet18012001@gmail.com', name: 'Abhijeet' },
];

export default function TasksPanel() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [pauseReason, setPauseReason] = useState('');
  const { toast } = useToast();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 10000);
    return () => clearInterval(interval);
  }, []);

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
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAssignmentLabel = (task: any) => {
    if (task.assignedBy._id === currentUser.id) {
      return 'Self-assigned';
    }
    return `Assigned by ${task.assignedBy.name || task.assignedBy.email}`;
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-gray-600">Manage team tasks and track progress</p>
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
                    {FIXED_USERS.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.id === currentUser.id ? 'Self' : user.name}
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

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">No tasks yet. Create one to get started!</p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task._id} data-testid={`card-task-${task._id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle>{task.title}</CardTitle>
                    <CardDescription>{task.description}</CardDescription>
                    <div className="mt-2 space-y-1 text-sm">
                      <p data-testid={`text-assigned-to-${task._id}`}>
                        Assigned to: <strong>{task.assignedTo.name || task.assignedTo.email}</strong>
                      </p>
                      <p data-testid={`text-assignment-label-${task._id}`}>
                        {getAssignmentLabel(task)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      data-testid={`badge-status-${task._id}`}
                      className={getStatusColor(task.status)}
                    >
                      {task.status}
                    </Badge>
                    <Button
                      data-testid={`button-delete-${task._id}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTask(task._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {task.pauseReason && (
                  <div
                    data-testid={`text-pause-reason-${task._id}`}
                    className="bg-red-50 p-3 rounded border border-red-200"
                  >
                    <p className="text-sm font-medium text-red-800">Pause Reason:</p>
                    <p className="text-sm text-red-700">{task.pauseReason}</p>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger data-testid={`select-status-${task._id}`} className="w-40">
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
                      data-testid={`input-pause-reason-${task._id}`}
                      placeholder="Reason for pause"
                      value={pauseReason}
                      onChange={(e) => setPauseReason(e.target.value)}
                      className="flex-1"
                    />
                  )}

                  {newStatus && (
                    <Button
                      data-testid={`button-update-status-${task._id}`}
                      size="sm"
                      onClick={() => handleStatusChange(task._id, newStatus)}
                    >
                      Update
                    </Button>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Notes</h4>
                  {task.notes.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {task.notes.map((note: any, idx: number) => (
                        <div
                          key={idx}
                          data-testid={`div-note-${task._id}-${idx}`}
                          className="bg-gray-50 p-3 rounded"
                        >
                          <p data-testid={`text-note-date-${task._id}-${idx}`} className="text-xs text-gray-500 mb-1">
                            {formatDate(note.date)}
                          </p>
                          <p data-testid={`text-note-content-${task._id}-${idx}`} className="text-sm whitespace-pre-wrap">
                            {note.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Textarea
                      data-testid={`input-note-${task._id}`}
                      placeholder="Add a note (use • for pointers)"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="flex-1"
                      rows={3}
                    />
                    <Button
                      data-testid={`button-add-note-${task._id}`}
                      size="sm"
                      onClick={() => handleAddNote(task._id)}
                    >
                      Add Note
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
