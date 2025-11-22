import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Eye, Calendar, Search, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function HistoryPanel() {
  const [archives, setArchives] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const { toast } = useToast();

  const fetchArchives = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const response = await fetch('/api/tasks/archive/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setArchives(data.archives || {});
    } catch (error) {
      console.error('Failed to fetch archives');
      toast({ title: 'Error', description: 'Failed to fetch task history' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  const toggleDateExpand = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
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

  const getFilteredArchives = () => {
    let filtered = { ...archives };

    // Filter by date
    if (selectedDate) {
      const dateString = new Date(selectedDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      filtered = Object.keys(filtered).reduce((acc, key) => {
        if (key === dateString) {
          acc[key] = filtered[key];
        }
        return acc;
      }, {} as { [key: string]: any[] });
    }

    // Filter by search text
    if (searchText.trim()) {
      const lowerSearch = searchText.toLowerCase();
      Object.keys(filtered).forEach(date => {
        filtered[date] = filtered[date].filter(task =>
          task.title.toLowerCase().includes(lowerSearch) ||
          task.description.toLowerCase().includes(lowerSearch) ||
          (task.assignedTo?.name || task.assignedTo?.email || '').toLowerCase().includes(lowerSearch)
        );
      });

      // Remove empty date groups
      filtered = Object.keys(filtered).reduce((acc, key) => {
        if (filtered[key].length > 0) {
          acc[key] = filtered[key];
        }
        return acc;
      }, {} as { [key: string]: any[] });
    }

    return filtered;
  };

  const filteredArchives = getFilteredArchives();

  return (
    <div className="space-y-6 px-6 py-4">
      <div>
        <h2 className="text-2xl font-bold">Tasks History</h2>
        <p className="text-gray-600 mt-1">View all archived tasks organized by date</p>
      </div>

      {/* Search and Filter Controls */}
      {!loading && Object.keys(archives).length > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by task title, description, or assignee..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-10 pr-10"
                  data-testid="input-search-history"
                />
                {searchText && (
                  <button
                    onClick={() => setSearchText('')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    data-testid="button-clear-search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-48"
                  data-testid="input-date-filter"
                />
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate('')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    data-testid="button-clear-date"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card>
          <CardContent className="flex justify-center py-8">
            <p className="text-gray-500">Loading history...</p>
          </CardContent>
        </Card>
      ) : Object.keys(archives).length === 0 ? (
        <Card>
          <CardContent className="flex justify-center py-8">
            <p className="text-gray-500">No archived tasks yet</p>
          </CardContent>
        </Card>
      ) : Object.keys(filteredArchives).length === 0 ? (
        <Card>
          <CardContent className="flex justify-center py-8">
            <p className="text-gray-500">No tasks match your search or date filter</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(filteredArchives)
            .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
            .map(([date, tasks]) => (
              <Card key={date}>
                <Collapsible
                  open={expandedDates.has(date)}
                  onOpenChange={() => toggleDateExpand(date)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between px-6 py-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <div className="text-left">
                          <p className="font-semibold">{date}</p>
                          <p className="text-sm text-gray-600">{tasks.length} task(s) archived</p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          expandedDates.has(date) ? 'rotate-180' : ''
                        }`}
                      />
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-6 pb-4">
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead>Title</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Assigned To</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tasks.map((task) => (
                              <TableRow key={task._id}>
                                <TableCell className="font-medium">{task.title}</TableCell>
                                <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                                  {task.description}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {task.assignedTo?.name || task.assignedTo?.email || 'Unknown'}
                                </TableCell>
                                <TableCell>
                                  <Badge className={getStatusColor(task.status)}>
                                    {task.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-gray-500">
                                  {new Date(task.taskCreatedAt).toLocaleDateString('en-IN')}
                                </TableCell>
                                <TableCell>
                                  <Dialog open={openTaskDialog && selectedTask?._id === task._id} 
                                    onOpenChange={(open) => {
                                      setOpenTaskDialog(open);
                                      if (!open) setSelectedTask(null);
                                    }}>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedTask(task);
                                          setOpenTaskDialog(true);
                                        }}
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                    </DialogTrigger>
                                    {openTaskDialog && selectedTask && selectedTask._id === task._id && (
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
                                              <p className="mt-1">{selectedTask.assignedTo?.name || selectedTask.assignedTo?.email}</p>
                                            </div>
                                            <div>
                                              <label className="text-xs font-semibold text-gray-600">Assigned By</label>
                                              <p className="mt-1">{selectedTask.assignedBy?.name || selectedTask.assignedBy?.email}</p>
                                            </div>
                                          </div>

                                          <div>
                                            <label className="text-xs font-semibold text-gray-600">Status</label>
                                            <Badge className={`mt-2 ${getStatusColor(selectedTask.status)}`}>
                                              {selectedTask.status}
                                            </Badge>
                                          </div>

                                          {selectedTask.isApproved && selectedTask.approvedBy && (
                                            <div className="bg-green-50 p-3 rounded border border-green-200">
                                              <p className="text-sm font-medium text-green-800">Approved By:</p>
                                              <p className="text-sm text-green-700">{selectedTask.approvedBy?.name || selectedTask.approvedBy?.email}</p>
                                              <p className="text-xs text-green-600 mt-1">{formatDate(selectedTask.approvedAt)}</p>
                                            </div>
                                          )}

                                          {selectedTask.notes && selectedTask.notes.length > 0 && (
                                            <div className="border-t pt-4">
                                              <label className="text-xs font-semibold text-gray-600">Notes</label>
                                              <div className="space-y-2 mt-3">
                                                {selectedTask.notes.map((note: any, idx: number) => (
                                                  <div key={idx} className="bg-gray-50 p-2 rounded text-sm">
                                                    <p className="text-xs text-gray-500">{formatDate(note.date)}</p>
                                                    <p className="text-gray-700 mt-1">{note.content}</p>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          <div className="text-xs text-gray-500 border-t pt-4">
                                            <p>Archived on: {formatDate(selectedTask.archivedAt)}</p>
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
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
