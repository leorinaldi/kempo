'use client';

import { useState, useEffect } from 'react';

interface BacklogItem {
  id: string;
  title: string;
  context: string | null;
  status: string;
  priority: string;
  effort: string | null;
  tags: string | null;
  sortOrder: number;
  projectId: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

interface BacklogProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  sortOrder: number;
  createdAt: string;
  completedAt: string | null;
  items: BacklogItem[];
}

const priorityColors: Record<string, string> = {
  critical: 'bg-red-600',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

const statusColors: Record<string, string> = {
  pending: 'bg-gray-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-600',
  cancelled: 'bg-red-400',
};

export default function BacklogPage() {
  const [projects, setProjects] = useState<BacklogProject[]>([]);
  const [unassignedItems, setUnassignedItems] = useState<BacklogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<BacklogItem | null>(null);
  const [selectedProject, setSelectedProject] = useState<BacklogProject | null>(null);
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dragOverProjectId, setDragOverProjectId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'project' | 'task'; id: string; name: string } | null>(null);
  const [addingTaskToProject, setAddingTaskToProject] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());

  const fetchData = () => {
    fetch('/api/backlog')
      .then(res => res.json())
      .then(data => {
        setProjects(data.projects || []);
        setUnassignedItems(data.unassigned || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch backlog:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/backlog', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        fetchData();
        if (selectedItem?.id === id) {
          const updated = await res.json();
          setSelectedItem(updated);
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      await fetch('/api/backlog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'project', name: newProjectName.trim() }),
      });
      setNewProjectName('');
      setShowNewProject(false);
      fetchData();
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const createTask = async (projectId: string) => {
    if (!newTaskTitle.trim()) return;
    try {
      // Get the max sortOrder for this project
      const project = projects.find(p => p.id === projectId);
      const maxOrder = project?.items.reduce((max, item) => Math.max(max, item.sortOrder), -1) ?? -1;

      await fetch('/api/backlog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          projectId,
          sortOrder: maxOrder + 1,
        }),
      });
      setNewTaskTitle('');
      setAddingTaskToProject(null);
      fetchData();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const showDeleteConfirm = (type: 'project' | 'task', id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({ type, id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;
    try {
      if (type === 'project') {
        await fetch(`/api/backlog?id=${id}&type=project`, { method: 'DELETE' });
        if (selectedProject?.id === id) setSelectedProject(null);
      } else {
        await fetch(`/api/backlog?id=${id}`, { method: 'DELETE' });
        if (selectedItem?.id === id) setSelectedItem(null);
      }
      fetchData();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
    setDeleteConfirm(null);
  };

  const updateProject = async (id: string, updates: Partial<BacklogProject>) => {
    try {
      const res = await fetch('/api/backlog', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type: 'project', ...updates }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedProject(prev => prev ? { ...prev, ...updated } : null);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update project:', err);
    }
  };

  const updateTask = async (id: string, updates: Partial<BacklogItem>) => {
    try {
      const res = await fetch('/api/backlog', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedItem(prev => prev ? { ...prev, ...updated } : null);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const getProgressStats = (items: BacklogItem[]) => {
    const total = items.length;
    const completed = items.filter(i => i.status === 'completed').length;
    const inProgress = items.filter(i => i.status === 'in_progress').length;
    return { total, completed, inProgress, pending: total - completed - inProgress };
  };

  const toggleProjectCollapse = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedProjects(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggedProjectId(projectId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, projectId: string) => {
    e.preventDefault();
    if (draggedProjectId && draggedProjectId !== projectId) {
      setDragOverProjectId(projectId);
    }
  };

  const handleDragLeave = () => {
    setDragOverProjectId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetProjectId: string) => {
    e.preventDefault();
    if (!draggedProjectId || draggedProjectId === targetProjectId) {
      setDraggedProjectId(null);
      setDragOverProjectId(null);
      return;
    }

    // Reorder projects
    const draggedIndex = projects.findIndex(p => p.id === draggedProjectId);
    const targetIndex = projects.findIndex(p => p.id === targetProjectId);

    const newProjects = [...projects];
    const [draggedProject] = newProjects.splice(draggedIndex, 1);
    newProjects.splice(targetIndex, 0, draggedProject);

    // Update local state immediately for responsiveness
    setProjects(newProjects);
    setDraggedProjectId(null);
    setDragOverProjectId(null);

    // Save new order to database
    try {
      await fetch('/api/backlog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectOrder: newProjects.map(p => p.id) }),
      });
    } catch (err) {
      console.error('Failed to save project order:', err);
      fetchData(); // Revert on error
    }
  };

  const handleDragEnd = () => {
    setDraggedProjectId(null);
    setDragOverProjectId(null);
  };

  // Task drag handlers
  const handleTaskDragStart = (e: React.DragEvent, taskId: string) => {
    e.stopPropagation(); // Prevent project drag
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTaskDragOver = (e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedTaskId && draggedTaskId !== taskId) {
      setDragOverTaskId(taskId);
    }
  };

  const handleTaskDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setDragOverTaskId(null);
  };

  const handleTaskDrop = async (e: React.DragEvent, targetTaskId: string, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedTaskId || draggedTaskId === targetTaskId) {
      setDraggedTaskId(null);
      setDragOverTaskId(null);
      return;
    }

    // Find the project and reorder its tasks
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return;

    const project = projects[projectIndex];
    const tasks = [...project.items].sort((a, b) => a.sortOrder - b.sortOrder);
    const draggedIndex = tasks.findIndex(t => t.id === draggedTaskId);
    const targetIndex = tasks.findIndex(t => t.id === targetTaskId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [draggedTask] = tasks.splice(draggedIndex, 1);
    tasks.splice(targetIndex, 0, draggedTask);

    // Update local state immediately
    const newProjects = [...projects];
    newProjects[projectIndex] = {
      ...project,
      items: tasks.map((t, i) => ({ ...t, sortOrder: i })),
    };
    setProjects(newProjects);
    setDraggedTaskId(null);
    setDragOverTaskId(null);

    // Save to database
    try {
      await fetch('/api/backlog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskOrder: tasks.map(t => t.id),
          projectId,
        }),
      });
    } catch (err) {
      console.error('Failed to save task order:', err);
      fetchData();
    }
  };

  const handleTaskDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="animate-pulse">Loading backlog...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Backlog</h1>
          <button
            onClick={() => setShowNewProject(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
          >
            + New Project
          </button>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">New Project</h2>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createProject()}
              placeholder="Project name..."
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setShowNewProject(false); setNewProjectName(''); }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                disabled={!newProjectName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-2">Delete {deleteConfirm.type === 'project' ? 'Project' : 'Task'}?</h2>
            <p className="text-gray-400 mb-2">
              <span className="text-white font-medium">{deleteConfirm.name}</span>
            </p>
            {deleteConfirm.type === 'project' && (
              <p className="text-gray-500 text-sm mb-4">Tasks in this project will become unassigned.</p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 flex gap-4">
        {/* Projects and Tasks List */}
        <div className="flex-1 space-y-6">
          {projects.map(project => {
            const stats = getProgressStats(project.items);
            const progressPercent = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
            const isDragging = draggedProjectId === project.id;
            const isDragOver = dragOverProjectId === project.id;
            const isCollapsed = collapsedProjects.has(project.id);

            return (
              <div
                key={project.id}
                draggable
                onDragStart={(e) => handleDragStart(e, project.id)}
                onDragOver={(e) => handleDragOver(e, project.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, project.id)}
                onDragEnd={handleDragEnd}
                className={`bg-gray-800 rounded-lg overflow-hidden transition-all ${
                  isDragging ? 'opacity-50 scale-[0.98]' : ''
                } ${isDragOver ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900' : ''}`}
              >
                {/* Project Header */}
                <div
                  className="p-4 border-b border-gray-700 cursor-grab hover:bg-gray-750 active:cursor-grabbing"
                  onClick={() => setSelectedProject(selectedProject?.id === project.id ? null : project)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Collapse/Expand */}
                      <button
                        onClick={(e) => toggleProjectCollapse(project.id, e)}
                        className="text-gray-500 hover:text-gray-300 p-0.5"
                      >
                        <svg
                          className={`w-5 h-5 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      {/* Drag Handle */}
                      <div className="text-gray-500 hover:text-gray-300 select-none">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-white">{project.name}</h2>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                          <span>{stats.completed}/{stats.total} tasks</span>
                          {stats.inProgress > 0 && (
                            <span className="text-blue-400">{stats.inProgress} in progress</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-white">{Math.round(progressPercent)}%</div>
                      <button
                        onClick={(e) => showDeleteConfirm('project', project.id, project.name, e)}
                        className="p-1 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded"
                        title="Delete project"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Tasks */}
                {!isCollapsed && (
                <div className="divide-y divide-gray-700">
                  {project.items
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((item) => {
                      const isTaskDragging = draggedTaskId === item.id;
                      const isTaskDragOver = dragOverTaskId === item.id;

                      return (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleTaskDragStart(e, item.id)}
                          onDragOver={(e) => handleTaskDragOver(e, item.id)}
                          onDragLeave={handleTaskDragLeave}
                          onDrop={(e) => handleTaskDrop(e, item.id, project.id)}
                          onDragEnd={handleTaskDragEnd}
                          onClick={() => setSelectedItem(item)}
                          className={`group p-4 cursor-grab active:cursor-grabbing transition-all flex items-start gap-3 ${
                            selectedItem?.id === item.id
                              ? 'bg-gray-700 ring-2 ring-inset ring-blue-500'
                              : 'hover:bg-gray-750'
                          } ${item.status === 'completed' ? 'opacity-60' : ''} ${
                            isTaskDragging ? 'opacity-50' : ''
                          } ${isTaskDragOver ? 'border-t-2 border-blue-500' : ''}`}
                        >
                          {/* Drag Handle */}
                          <div className="text-gray-500 hover:text-gray-300 select-none mt-0.5">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                            </svg>
                          </div>

                          {/* Checkbox */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(item.id, item.status === 'completed' ? 'pending' : 'completed');
                            }}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors ${
                              item.status === 'completed'
                                ? 'bg-green-600 border-green-600 text-white'
                                : item.status === 'in_progress'
                                ? 'border-blue-500 bg-blue-500/20'
                                : 'border-gray-500 hover:border-gray-400'
                            }`}
                          >
                            {item.status === 'completed' && (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-medium ${item.status === 'completed' ? 'line-through text-gray-400' : 'text-white'}`}>
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-xs text-white ${priorityColors[item.priority] || 'bg-gray-600'}`}>
                                {item.priority}
                              </span>
                              {item.effort && (
                                <span className="px-2 py-0.5 rounded text-xs bg-purple-600 text-white">
                                  {item.effort}
                                </span>
                              )}
                              {item.status !== 'pending' && item.status !== 'completed' && (
                                <span className={`px-2 py-0.5 rounded text-xs text-white ${statusColors[item.status]}`}>
                                  {item.status.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={(e) => showDeleteConfirm('task', item.id, item.title, e)}
                            className="p-1 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete task"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}

                  {/* Add Task */}
                  {addingTaskToProject === project.id ? (
                    <div className="p-4 flex items-center gap-3">
                      <div className="w-4" /> {/* Spacer for drag handle */}
                      <div className="w-5" /> {/* Spacer for checkbox */}
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') createTask(project.id);
                          if (e.key === 'Escape') { setAddingTaskToProject(null); setNewTaskTitle(''); }
                        }}
                        placeholder="Task title..."
                        className="flex-1 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => createTask(project.id)}
                        disabled={!newTaskTitle.trim()}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm disabled:opacity-50"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => { setAddingTaskToProject(null); setNewTaskTitle(''); }}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingTaskToProject(project.id)}
                      className="w-full p-3 text-left text-gray-500 hover:text-gray-300 hover:bg-gray-750 text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add task
                    </button>
                  )}
                </div>
                )}
              </div>
            );
          })}

          {/* Unassigned Items */}
          {unassignedItems.length > 0 && (
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-gray-400">Unassigned Tasks</h2>
              </div>
              <div className="divide-y divide-gray-700">
                {unassignedItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`group p-4 cursor-pointer transition-all flex items-start gap-3 ${
                      selectedItem?.id === item.id
                        ? 'bg-gray-700 ring-2 ring-inset ring-blue-500'
                        : 'hover:bg-gray-750'
                    } ${item.status === 'completed' ? 'opacity-60' : ''}`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateStatus(item.id, item.status === 'completed' ? 'pending' : 'completed');
                      }}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors ${
                        item.status === 'completed'
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'border-gray-500 hover:border-gray-400'
                      }`}
                    >
                      {item.status === 'completed' && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1">
                      <h3 className={`font-medium ${item.status === 'completed' ? 'line-through text-gray-400' : 'text-white'}`}>
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded text-xs text-white ${priorityColors[item.priority]}`}>
                          {item.priority}
                        </span>
                        {item.status !== 'pending' && item.status !== 'completed' && (
                          <span className={`px-2 py-0.5 rounded text-xs text-white ${statusColors[item.status]}`}>
                            {item.status}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => showDeleteConfirm('task', item.id, item.title, e)}
                      className="p-1 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete task"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {(selectedItem || selectedProject) && (
          <div className="w-1/2 bg-gray-800 rounded-lg p-6 sticky top-4 max-h-[calc(100vh-120px)] overflow-y-auto">
            {selectedProject && !selectedItem ? (
              // Project Detail (Editable)
              <>
                <div className="flex items-start justify-between mb-4">
                  <input
                    type="text"
                    defaultValue={selectedProject.name}
                    onBlur={(e) => {
                      if (e.target.value !== selectedProject.name) {
                        updateProject(selectedProject.id, { name: e.target.value });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    }}
                    className="text-xl font-bold bg-transparent border-b border-transparent hover:border-gray-600 focus:border-blue-500 focus:outline-none w-full"
                  />
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="text-gray-500 hover:text-white ml-2"
                  >
                    ✕
                  </button>
                </div>
                <div>
                  <label className="text-gray-500 text-sm block mb-2">Description</label>
                  <textarea
                    defaultValue={selectedProject.description || ''}
                    onBlur={(e) => {
                      if (e.target.value !== (selectedProject.description || '')) {
                        updateProject(selectedProject.id, { description: e.target.value || null });
                      }
                    }}
                    placeholder="Add a description..."
                    className="w-full p-3 bg-gray-900 rounded-lg text-sm font-mono leading-relaxed border border-gray-700 focus:border-blue-500 focus:outline-none resize-y min-h-[150px]"
                  />
                </div>
              </>
            ) : selectedItem ? (
              // Task Detail (Editable)
              <>
                <div className="flex items-start justify-between mb-4">
                  <input
                    type="text"
                    defaultValue={selectedItem.title}
                    onBlur={(e) => {
                      if (e.target.value !== selectedItem.title) {
                        updateTask(selectedItem.id, { title: e.target.value });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    }}
                    className="text-xl font-bold bg-transparent border-b border-transparent hover:border-gray-600 focus:border-blue-500 focus:outline-none w-full"
                  />
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-500 hover:text-white ml-2"
                  >
                    ✕
                  </button>
                </div>

                {/* Status Actions */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  {selectedItem.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(selectedItem.id, 'in_progress')}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                    >
                      Start Work
                    </button>
                  )}
                  {selectedItem.status === 'in_progress' && (
                    <>
                      <button
                        onClick={() => updateStatus(selectedItem.id, 'completed')}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => updateStatus(selectedItem.id, 'pending')}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
                      >
                        Pause
                      </button>
                    </>
                  )}
                  {selectedItem.status === 'completed' && (
                    <button
                      onClick={() => updateStatus(selectedItem.id, 'pending')}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
                    >
                      Reopen
                    </button>
                  )}
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <label className="text-gray-500 block mb-1">Priority</label>
                    <select
                      value={selectedItem.priority}
                      onChange={(e) => updateTask(selectedItem.id, { priority: e.target.value })}
                      className={`px-2 py-1 rounded text-white text-sm ${priorityColors[selectedItem.priority]} cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="low" className="bg-gray-800">low</option>
                      <option value="medium" className="bg-gray-800">medium</option>
                      <option value="high" className="bg-gray-800">high</option>
                      <option value="critical" className="bg-gray-800">critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">Effort</label>
                    <select
                      value={selectedItem.effort || ''}
                      onChange={(e) => updateTask(selectedItem.id, { effort: e.target.value || null })}
                      className="px-2 py-1 rounded bg-gray-700 text-white text-sm cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Not set</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">Status</label>
                    <select
                      value={selectedItem.status}
                      onChange={(e) => updateStatus(selectedItem.id, e.target.value)}
                      className={`px-2 py-1 rounded text-white text-sm ${statusColors[selectedItem.status]} cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="pending" className="bg-gray-800">pending</option>
                      <option value="in_progress" className="bg-gray-800">in progress</option>
                      <option value="completed" className="bg-gray-800">completed</option>
                      <option value="cancelled" className="bg-gray-800">cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">Order</label>
                    <span className="text-gray-300">#{selectedItem.sortOrder}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <label className="text-gray-500 text-sm block mb-1">Tags</label>
                  <input
                    type="text"
                    defaultValue={selectedItem.tags || ''}
                    onBlur={(e) => {
                      if (e.target.value !== (selectedItem.tags || '')) {
                        updateTask(selectedItem.id, { tags: e.target.value || null });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    }}
                    placeholder="comma, separated, tags"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Context */}
                <div>
                  <label className="text-gray-500 text-sm block mb-1">Context</label>
                  <textarea
                    defaultValue={selectedItem.context || ''}
                    onBlur={(e) => {
                      if (e.target.value !== (selectedItem.context || '')) {
                        updateTask(selectedItem.id, { context: e.target.value || null });
                      }
                    }}
                    placeholder="Add detailed context or instructions..."
                    className="w-full p-3 bg-gray-900 rounded-lg text-sm font-mono leading-relaxed border border-gray-700 focus:border-blue-500 focus:outline-none resize-y min-h-[200px]"
                  />
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
