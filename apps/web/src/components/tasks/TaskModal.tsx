"use client";

import { useState, useEffect, useMemo } from "react";
import { Task, Project } from "@taskpro/shared";
import { useTasks } from "@/hook/useTasks";
import { useProjects } from "@taskpro/shared";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { UserProfile } from "@taskpro/shared";
import { Search, Briefcase, Brain } from "lucide-react";
import AIAssigneeSuggest from "./AIAssigneeSuggest";

interface TaskModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task?: Task;
    defaultStatus?: Task["status"];
    defaultDueDate?: string;
    defaultProjectId?: string;
}

export default function TaskModal({ 
    open, 
    onOpenChange, 
    task, 
    defaultStatus, 
    defaultDueDate,
    defaultProjectId 
}: TaskModalProps) {
    const { createTask, updateTask, currentUser, tasks } = useTasks();
    const { projects, addMember } = useProjects();
    const supabase = createClient();
    const [users, setUsers] = useState<Pick<UserProfile, "id" | "email" | "full_name">[]>([]);
    const [projectSearchQuery, setProjectSearchQuery] = useState("");
    const [showProjectDropdown, setShowProjectDropdown] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [showAISuggest, setShowAISuggest] = useState(false);
    const [newMemberData, setNewMemberData] = useState({
        userId: "",
        role: "developer",
    });
    const isEdit = !!task;

    const canCreateTask = currentUser?.profile?.role === "admin" || currentUser?.profile?.role === "manager";

    const [formData, setFormData] = useState({
        title: task?.title || "",
        description: task?.description || "",
        status: task?.status || defaultStatus || "todo",
        priority: task?.priority || "medium",
        dueDate: task?.due_date || defaultDueDate || "",
        tags: task?.tags?.join(", ") || "",
        user_id: task?.user_id || "",
        project_id: task?.project_id || defaultProjectId || "",
    });

    // Group tasks by user_id for AI analysis
    const tasksByUser = useMemo(() => {
        if (!tasks || !Array.isArray(tasks)) return {};
        
        const grouped: Record<string, any[]> = {};
        tasks.forEach(task => {
            if (task.user_id) {
                if (!grouped[task.user_id]) {
                    grouped[task.user_id] = [];
                }
                grouped[task.user_id].push(task);
            }
        });
        return grouped;
    }, [tasks]);

    useEffect(() => {
        if (defaultDueDate && !task) {
            setFormData((prev) => ({
                ...prev,
                dueDate: defaultDueDate,
            }));
        }
    }, [defaultDueDate, task]);

    useEffect(() => {
        if (defaultProjectId && !task) {
            setFormData((prev) => ({
                ...prev,
                project_id: defaultProjectId,
            }));
        }
    }, [defaultProjectId, task]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter projects based on search query
    const filteredProjects = useMemo(() => {
        if (!projectSearchQuery) return projects;
        const query = projectSearchQuery.toLowerCase();
        return projects.filter(
            (project) =>
                project.name.toLowerCase().includes(query) ||
                project.description?.toLowerCase().includes(query)
        );
    }, [projects, projectSearchQuery]);

    // Get selected project
    const selectedProject = useMemo(() => {
        return projects.find((p) => p.id === formData.project_id);
    }, [projects, formData.project_id]);

    // Filter users based on selected project (only show project members)
    const availableUsers = useMemo(() => {
        if (!formData.project_id || !selectedProject) {
            return users;
        }
        
        const projectMemberIds = selectedProject.members?.map((m) => m.user_id) || [];
        const filtered = users.filter((user) => projectMemberIds.includes(user.id));
        
        if (filtered.length === 0) {
            return users;
        }
        
        return filtered;
    }, [users, formData.project_id, selectedProject]);

    useEffect(() => {
        async function fetchUsers() {
            const { data, error } = await supabase
                .from("profiles")
                .select("id, email, full_name")
                .order("full_name");

            if (!error && data) {
                setUsers(data);
            }
        }

        if (open) {
            fetchUsers();
        }
    }, [open, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const taskData = {
                title: formData.title,
                description: formData.description,
                status: formData.status as Task["status"],
                priority: formData.priority as Task["priority"],
                due_date: formData.dueDate || undefined,
                tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
                user_id: formData.user_id || undefined,
                project_id: formData.project_id || undefined,
            };

            if (isEdit && task) {
                await updateTask.mutateAsync({
                    id: task.id,
                    updates: taskData,
                });
            } else {
                await createTask.mutateAsync(taskData);
            }

            onOpenChange(false);
            resetForm();
        } catch (error) {
            console.error("Failed to save task:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            status: defaultStatus || "todo",
            priority: "medium",
            dueDate: "",
            tags: "",
            user_id: "",
            project_id: defaultProjectId || "",
        });
        setProjectSearchQuery("");
    };

    const handleProjectSelect = (projectId: string) => {
        setFormData({ ...formData, project_id: projectId, user_id: "" });
        setShowProjectDropdown(false);
        setProjectSearchQuery("");
    };

    const handleAddMember = async () => {
        if (!newMemberData.userId || !formData.project_id) return;

        try {
            await addMember.mutateAsync({
                projectId: formData.project_id,
                userId: newMemberData.userId,
                role: newMemberData.role,
            });

            setFormData({ ...formData, user_id: newMemberData.userId });
            setShowAddMember(false);
            setNewMemberData({ userId: "", role: "developer" });
            
            alert("Member added successfully!");
        } catch (error: any) {
            console.error("Failed to add member:", error);
            alert(error.message || "Failed to add member");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {!canCreateTask && !isEdit ? (
                <DialogContent>
                    <p className="p-4 text-center text-slate-500">You do not have permission to create tasks.</p>
                </DialogContent>
            ) : (
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? "Edit Task" : "Create New Task"}</DialogTitle>
                        <DialogDescription>
                            {isEdit ? "Update the task details below" : "Fill in the details to create a new task"}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter task title"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter task description"
                                rows={3}
                            />
                        </div>

                        {/* Project Selection with Search */}
                        <div className="space-y-2">
                            <Label htmlFor="project">
                                Project <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <div
                                    className="flex items-center gap-2 w-full px-3 py-2 border border-slate-200 rounded-md cursor-pointer hover:border-slate-300 transition-colors bg-white"
                                    onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                                >
                                    <Briefcase className="w-4 h-4 text-slate-400" />
                                    <div className="flex-1 min-w-0">
                                        {selectedProject ? (
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: selectedProject.color }}
                                                />
                                                <span className="text-sm truncate">{selectedProject.name}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                    selectedProject.status === 'active' ? 'bg-green-100 text-green-700' :
                                                    selectedProject.status === 'planning' ? 'bg-gray-100 text-gray-700' :
                                                    selectedProject.status === 'on_hold' ? 'bg-yellow-100 text-yellow-700' :
                                                    selectedProject.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {selectedProject.status}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-slate-500">Select a project</span>
                                        )}
                                    </div>
                                </div>

                                {showProjectDropdown && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-hidden">
                                        <div className="p-2 border-b border-slate-200">
                                            <div className="relative">
                                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <Input
                                                    placeholder="Search projects..."
                                                    value={projectSearchQuery}
                                                    onChange={(e) => setProjectSearchQuery(e.target.value)}
                                                    className="pl-8 h-8 text-sm"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>

                                        <div className="max-h-48 overflow-y-auto">
                                            {filteredProjects.length > 0 ? (
                                                filteredProjects.map((project) => (
                                                    <div
                                                        key={project.id}
                                                        onClick={() => handleProjectSelect(project.id)}
                                                        className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors hover:bg-slate-50 ${
                                                            project.id === formData.project_id ? 'bg-blue-50' : ''
                                                        }`}
                                                    >
                                                        <div
                                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                                            style={{ backgroundColor: project.color }}
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-slate-900 truncate">
                                                                {project.name}
                                                            </p>
                                                            {project.description && (
                                                                <p className="text-xs text-slate-500 truncate">
                                                                    {project.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                                                            project.status === 'active' ? 'bg-green-100 text-green-700' :
                                                            project.status === 'planning' ? 'bg-gray-100 text-gray-700' :
                                                            project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-700' :
                                                            project.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                            {project.status}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-3 py-4 text-center text-sm text-slate-500">
                                                    No projects found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {selectedProject && (
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <span>{selectedProject.members?.length || 0} members</span>
                                    <span>•</span>
                                    <span>{selectedProject.tasks_count || 0} tasks</span>
                                </p>
                            )}
                        </div>

                        {/* Status & Priority */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value as Task["status"] })}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todo">To Do</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="review">Review</SelectItem>
                                        <SelectItem value="done">Done</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value) => setFormData({ ...formData, priority: value as Task["priority"] })}
                                >
                                    <SelectTrigger id="priority">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Assignee with AI Button */}
                        <div className="space-y-2">
                            <Label htmlFor="user">
                                Assign To
                                {formData.project_id && selectedProject && (
                                    <span className="text-xs text-slate-500 ml-1">
                                        (from {selectedProject.name})
                                    </span>
                                )}
                            </Label>
                            <div className="flex gap-2">
                                <Select
                                    value={formData.user_id}
                                    onValueChange={(value) => {
                                        if (value === "add_new") {
                                            setShowAddMember(true);
                                        } else {
                                            setFormData({ ...formData, user_id: value });
                                        }
                                    }}
                                    disabled={!formData.project_id}
                                >
                                    <SelectTrigger id="user" className="flex-1">
                                        <SelectValue placeholder={
                                            !formData.project_id 
                                                ? "Select project first" 
                                                : availableUsers.length === 0
                                                ? "No members in project"
                                                : "Select user"
                                        } />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableUsers.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.full_name || user.email}
                                            </SelectItem>
                                        ))}
                                        {formData.project_id && (
                                            <>
                                                <div className="my-1 border-t border-slate-200" />
                                                <SelectItem value="add_new" className="text-blue-600 font-medium">
                                                    + Add New Member to Project
                                                </SelectItem>
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>

                                <Button
                                    type="button"
                                    onClick={() => setShowAISuggest(true)}
                                    disabled={!formData.project_id || availableUsers.length === 0 || !formData.title}
                                    className="px-3 bg-black"
                                    title="Get AI recommendation for best assignee"
                                >
                                    AI
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input
                                id="dueDate"
                                type="datetime-local"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags</Label>
                            <Input
                                id="tags"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                placeholder="design, ui/ux, backend (comma separated)"
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isSubmitting || !formData.project_id}
                            >
                                {isSubmitting ? "Saving..." : isEdit ? "Update Task" : "Create Task"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            )}

            {/* Add Member Dialog */}
            <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Add Member to {selectedProject?.name}</DialogTitle>
                        <DialogDescription>
                            Add a new member to this project and assign the task
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="newUser">
                                Select User <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={newMemberData.userId}
                                onValueChange={(value) => setNewMemberData({ ...newMemberData, userId: value })}
                            >
                                <SelectTrigger id="newUser">
                                    <SelectValue placeholder="Select user" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users
                                        .filter((user) => !availableUsers.find((u) => u.id === user.id))
                                        .map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.full_name || user.email}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="memberRole">
                                Role <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={newMemberData.role}
                                onValueChange={(value) => setNewMemberData({ ...newMemberData, role: value })}
                            >
                                <SelectTrigger id="memberRole">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="project_manager">Project Manager</SelectItem>
                                    <SelectItem value="tech_lead">Tech Lead</SelectItem>
                                    <SelectItem value="developer">Developer</SelectItem>
                                    <SelectItem value="designer">Designer</SelectItem>
                                    <SelectItem value="qa_tester">QA Tester</SelectItem>
                                    <SelectItem value="devops">DevOps</SelectItem>
                                    <SelectItem value="business_analyst">Business Analyst</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowAddMember(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleAddMember}
                            disabled={!newMemberData.userId || addMember.isPending}
                        >
                            {addMember.isPending ? "Adding..." : "Add Member"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* AI Suggestion Modal */}
            {showAISuggest && (
                <AIAssigneeSuggest
                    taskData={{
                        title: formData.title,
                        description: formData.description,
                        priority: formData.priority,
                        dueDate: formData.dueDate,
                        estimatedHours: 8, // You can add this to form if needed
                        projectId: formData.project_id
                    }}
                    availableUsers={availableUsers as any}
                    userTasks={tasksByUser}
                    onSelect={(userId) => {
                        setFormData({ ...formData, user_id: userId });
                        setShowAISuggest(false);
                    }}
                    onClose={() => setShowAISuggest(false)}
                />
            )}
        </Dialog>
    );
}