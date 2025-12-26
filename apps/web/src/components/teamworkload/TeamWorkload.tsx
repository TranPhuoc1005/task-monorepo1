import React, { useState, useMemo } from "react";
import { Users, Brain, TrendingUp, AlertCircle, Calendar, Clock, Loader2 } from "lucide-react";
import { Task } from "@taskpro/shared";

interface User {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    department: string | null;
    avatar_url: string | null;
    created_at: string;
}

interface TeamWorkloadProps {
    users: User[];
    tasks: Task[];
    isLoading?: boolean;
}

export default function TeamWorkload({ users, tasks, isLoading = false }: TeamWorkloadProps) {
    const [selectedMember, setSelectedMember] = useState<string | null>(null);

    // Group tasks by user_id
    const tasksByUser = useMemo(() => {
        if (!tasks || !Array.isArray(tasks)) return {};

        const grouped: Record<string, Task[]> = {};
        tasks.forEach((task) => {
            if (task.user_id) {
                if (!grouped[task.user_id]) {
                    grouped[task.user_id] = [];
                }
                grouped[task.user_id].push(task);
            }
        });
        return grouped;
    }, [tasks]);

    // Calculate workload for each member
    const membersWithWorkload = useMemo(() => {
        if (!users || !Array.isArray(users)) return [];

        return users.map((user) => {
            const userTasks = tasksByUser[user.id] || [];
            const totalHours = userTasks.reduce((sum, task) => sum + (task.estimated_hours || 8), 0);
            const capacity = 40; // 40 hours per week
            const workloadPercentage = Math.round((totalHours / capacity) * 100);

            const highPriorityCount = userTasks.filter((t) => t.priority === "high").length;
            const inProgressCount = userTasks.filter((t) => t.status === "in-progress").length;

            return {
                ...user,
                tasks: userTasks,
                totalHours,
                workloadPercentage,
                highPriorityCount,
                inProgressCount,
                capacity,
            };
        });
    }, [users, tasksByUser]);

    const getWorkloadStatus = (percentage: number) => {
        if (percentage >= 90)
            return { label: "Quá tải", color: "text-red-600", bg: "bg-red-100", ring: "ring-red-500" };
        if (percentage >= 70)
            return { label: "Bận", color: "text-orange-600", bg: "bg-orange-100", ring: "ring-orange-500" };
        if (percentage >= 40)
            return { label: "Bình thường", color: "text-blue-600", bg: "bg-blue-100", ring: "ring-blue-500" };
        return { label: "Nhàn rỗi", color: "text-green-600", bg: "bg-green-100", ring: "ring-green-500" };
    };

    const getInitials = (name?: string | null, email?: string) => {
        if (!name && !email) return "NA";
        const displayName = name || email || "";
        return (
            displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "NA"
        );
    };

    const overloadedMembers = membersWithWorkload.filter((m) => m.workloadPercentage >= 90);
    const availableMembers = membersWithWorkload.filter((m) => m.workloadPercentage < 70);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
                    <p className="text-slate-600">Loading team workload...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <Users className="w-8 h-8 text-blue-600" />
                            Team Workload
                        </h1>
                        <p className="text-slate-600 mt-2">Monitor team capacity and distribute work efficiently</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Total Members</p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">{membersWithWorkload.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Available</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">{availableMembers.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Overloaded</p>
                            <p className="text-3xl font-bold text-red-600 mt-2">{overloadedMembers.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Avg Workload</p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">
                                {Math.round(
                                    membersWithWorkload.reduce((sum, m) => sum + m.workloadPercentage, 0) /
                                        membersWithWorkload.length
                                )}
                                %
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Warnings */}
            {overloadedMembers.length > 0 && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-red-900 mb-2">⚠️ Team Members at Risk</h3>
                            <p className="text-sm text-red-700 mb-3">
                                {overloadedMembers.length} member{overloadedMembers.length > 1 ? "s are" : " is"}{" "}
                                overloaded (90%+ capacity). Consider redistributing tasks.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {overloadedMembers.map((member) => (
                                    <span
                                        key={member.id}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                        {member.full_name} - {member.workloadPercentage}%
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Team Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {membersWithWorkload.map((member) => {
                    const status = getWorkloadStatus(member.workloadPercentage);
                    const initials = getInitials(member.full_name, member.email);

                    return (
                        <div
                            key={member.id}
                            className={`bg-white rounded-xl border-2 p-6 transition-all cursor-pointer hover:shadow-lg ${
                                selectedMember === member.id ? `${status.ring} ring-2` : "border-slate-200"
                            }`}
                            onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}>
                            {/* Member Header */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                    {initials}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900">
                                        {member.full_name || member.email || "Unknown User"}
                                    </h3>
                                    <p className="text-xs text-slate-600 capitalize">
                                        {member.role || "N/A"} • {member.department || "N/A"}
                                    </p>
                                </div>
                            </div>

                            {/* Workload Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-600">Workload</span>
                                    <span className={`font-semibold ${status.color}`}>
                                        {member.workloadPercentage}%
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={`h-3 rounded-full transition-all ${
                                            member.workloadPercentage >= 90
                                                ? "bg-red-500"
                                                : member.workloadPercentage >= 70
                                                ? "bg-orange-500"
                                                : member.workloadPercentage >= 40
                                                ? "bg-blue-500"
                                                : "bg-green-500"
                                        }`}
                                        style={{ width: `${Math.min(member.workloadPercentage, 100)}%` }}
                                    />
                                </div>
                                <div
                                    className={`mt-2 inline-block px-2 py-1 rounded text-xs font-medium ${status.bg} ${status.color}`}>
                                    {status.label}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="text-center p-2 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-600">Tasks</p>
                                    <p className="text-lg font-bold text-slate-900">{member.tasks.length}</p>
                                </div>
                                <div className="text-center p-2 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-600">Hours</p>
                                    <p className="text-lg font-bold text-slate-900">{member.totalHours}h</p>
                                </div>
                                <div className="text-center p-2 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-600">High</p>
                                    <p className="text-lg font-bold text-red-600">{member.highPriorityCount}</p>
                                </div>
                            </div>

                            {/* Tasks List */}
                            {selectedMember === member.id && member.tasks.length > 0 && (
                                <div className="space-y-2 pt-4 border-t border-slate-200">
                                    <div className="text-sm font-semibold text-slate-700 mb-2">Current Tasks</div>
                                    {member.tasks.map((task) => (
                                        <div key={task.id} className="bg-slate-50 rounded-lg p-3 text-sm">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex-1 font-medium text-slate-800">{task.title}</div>
                                                <span
                                                    className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                                                        task.priority === "high"
                                                            ? "bg-red-100 text-red-700"
                                                            : task.priority === "medium"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-green-100 text-green-700"
                                                    }`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-600">
                                                {task.due_date && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(task.due_date).toLocaleDateString("vi-VN")}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {task.estimated_hours || 8}h
                                                </span>
                                                <span
                                                    className={`px-2 py-0.5 rounded ${
                                                        task.status === "done"
                                                            ? "bg-green-100 text-green-700"
                                                            : task.status === "in-progress"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : task.status === "review"
                                                            ? "bg-purple-100 text-purple-700"
                                                            : "bg-slate-100 text-slate-700"
                                                    }`}>
                                                    {task.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {membersWithWorkload.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                    <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No team members found</h3>
                    <p className="text-sm text-slate-600">Add members to your team to see their workload</p>
                </div>
            )}
        </div>
    );
}
