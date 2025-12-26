import React, { useState } from "react";
import { Brain, TrendingUp, AlertCircle, Sparkles, X, Check } from "lucide-react";

interface User {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    department: string | null;
    avatar_url: string | null;
    created_at: string;
}

interface Task {
    id: number;
    title: string;
    priority: "low" | "medium" | "high";
    due_date?: string;
    status: string;
    estimated_hours?: number;
    user_id?: string | null;
}

interface TaskData {
    title: string;
    description?: string;
    priority: string;
    dueDate?: string;
    estimatedHours?: number;
    projectId?: string;
}

interface AIRecommendation {
    employeeId: string;
    employeeName: string;
    score: number;
    reasons: string[];
    risks: string[];
    workloadAfter: number;
}

interface AIAssigneeSuggestProps {
    taskData: TaskData;
    availableUsers: User[];
    userTasks: Record<string, Task[]>;
    onSelect: (userId: string) => void;
    onClose: () => void;
}

export default function AIAssigneeSuggest({
    taskData,
    availableUsers,
    userTasks,
    onSelect,
    onClose,
}: AIAssigneeSuggestProps) {
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
    const [warnings, setWarnings] = useState<string[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const getWorkloadPercentage = (userId: string) => {
        const tasks = userTasks[userId] || [];
        const totalHours = tasks.reduce((sum, t) => sum + (t.estimated_hours || 8), 0);
        const capacity = 40;
        return Math.round((totalHours / capacity) * 100);
    };

    const getAIRecommendation = async () => {
        setLoading(true);
        setRecommendations([]);
        setWarnings([]);
        setSuggestions([]);

        try {
            const employeeData = availableUsers.map((user) => {
                const tasks = userTasks[user.id] || [];
                return {
                    id: user.id,
                    name: user.full_name || user.email,
                    email: user.email,
                    department: user.department || "N/A",
                    role: user.role,
                    currentWorkload: getWorkloadPercentage(user.id),
                    taskCount: tasks.length,
                    tasks: tasks.map((t) => ({
                        title: t.title,
                        priority: t.priority,
                        dueDate: t.due_date,
                        hours: t.estimated_hours || 8,
                        status: t.status,
                    })),
                };
            });

            const prompt = `Bạn là AI assistant chuyên phân tích workload và gợi ý phân công công việc.

Thông tin team members:
${JSON.stringify(employeeData, null, 2)}

Task mới cần giao:
- Tên: ${taskData.title}
- Mô tả: ${taskData.description || "Không có"}
- Ưu tiên: ${taskData.priority}
- Deadline: ${taskData.dueDate || "Chưa có"}
- Ước tính: ${taskData.estimatedHours || 8} giờ

Hãy phân tích và đề xuất:
1. Xếp hạng members phù hợp nhất (tối đa 3 người)
2. Lý do chi tiết cho mỗi đề xuất
3. Cảnh báo rủi ro nếu có
4. Gợi ý tối ưu

Trả về JSON thuần túy, KHÔNG có markdown, KHÔNG có backticks:
{
  "recommendations": [
    {
      "employeeId": "id",
      "employeeName": "tên",
      "score": 0-100,
      "reasons": ["lý do 1", "lý do 2"],
      "risks": ["rủi ro nếu có"],
      "workloadAfter": 85
    }
  ],
  "warnings": ["cảnh báo chung"],
  "suggestions": ["gợi ý tối ưu"]
}`;

            // Call through Next.js API route to avoid CORS
            const response = await fetch("/api/ai-suggest", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: [{ role: "user", content: prompt }],
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get AI recommendations");
            }

            const data = await response.json();
            const textContent = data.content.find((block: any) => block.type === "text")?.text || "";

            const cleanJson = textContent
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();
            const result = JSON.parse(cleanJson);

            setRecommendations(result.recommendations || []);
            setWarnings(result.warnings || []);
            setSuggestions(result.suggestions || []);
        } catch (error) {
            console.error("AI Error:", error);
            alert("Có lỗi xảy ra khi gọi AI. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (availableUsers.length > 0) {
            getAIRecommendation();
        }
    }, []);

    if (availableUsers.length === 0) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl max-w-md w-full p-6">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Available Members</h3>
                        <p className="text-sm text-slate-600 mb-4">
                            Please select a project first or add members to the project.
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-3xl w-full my-8">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">AI Assignment Suggestion</h2>
                            <p className="text-sm text-slate-600">Smart recommendations based on workload analysis</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-slate-600">AI is analyzing team workload...</p>
                        </div>
                    ) : (
                        <>
                            {/* Warnings */}
                            {warnings.length > 0 && (
                                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-semibold text-yellow-800 mb-2">⚠️ Warnings</div>
                                            {warnings.map((warning, idx) => (
                                                <p key={idx} className="text-sm text-yellow-700 mb-1">
                                                    {warning}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recommendations */}
                            {recommendations.length > 0 ? (
                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="w-5 h-5 text-indigo-600" />
                                        <h3 className="font-semibold text-slate-900">Recommended Assignees</h3>
                                    </div>

                                    {recommendations.map((rec, idx) => {
                                        const user = availableUsers.find((u) => u.id === rec.employeeId);
                                        const initials = rec.employeeName
                                            ? rec.employeeName
                                                  .split(" ")
                                                  .map((n) => n[0])
                                                  .join("")
                                                  .toUpperCase()
                                                  .slice(0, 2)
                                            : "NA";

                                        return (
                                            <div
                                                key={idx}
                                                className={`bg-white rounded-lg border-2 p-4 transition-all hover:shadow-md cursor-pointer ${
                                                    idx === 0
                                                        ? "border-green-400 ring-2 ring-green-100"
                                                        : "border-slate-200"
                                                }`}
                                                onClick={() => {
                                                    onSelect(rec.employeeId);
                                                    onClose();
                                                }}>
                                                {/* Member Header */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                            {initials}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-slate-900">
                                                                    {rec.employeeName}
                                                                </span>
                                                                {idx === 0 && (
                                                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                                                        Best Match
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {user && (
                                                                <p className="text-xs text-slate-600">
                                                                    {user.department || "N/A"} • {user.role || "N/A"}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-slate-600">Match Score</div>
                                                        <div className="text-2xl font-bold text-indigo-600">
                                                            {rec.score}%
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Reasons */}
                                                <div className="mb-3">
                                                    <div className="text-sm font-medium text-slate-700 mb-2">
                                                        ✅ Why this person:
                                                    </div>
                                                    <ul className="space-y-1">
                                                        {rec.reasons.map((reason, i) => (
                                                            <li
                                                                key={i}
                                                                className="text-sm text-slate-600 flex items-start gap-2">
                                                                <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                                                <span>{reason}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Risks */}
                                                {rec.risks && rec.risks.length > 0 && (
                                                    <div className="mb-3">
                                                        <div className="text-sm font-medium text-red-700 mb-2">
                                                            ⚠️ Potential risks:
                                                        </div>
                                                        <ul className="space-y-1">
                                                            {rec.risks.map((risk, i) => (
                                                                <li
                                                                    key={i}
                                                                    className="text-sm text-red-600 flex items-start gap-2">
                                                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                                    <span>{risk}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Workload After */}
                                                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                                                    <span className="text-sm text-slate-600">
                                                        Workload after assignment:
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-24 bg-slate-200 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full ${
                                                                    rec.workloadAfter >= 90
                                                                        ? "bg-red-500"
                                                                        : rec.workloadAfter >= 70
                                                                        ? "bg-orange-500"
                                                                        : "bg-green-500"
                                                                }`}
                                                                style={{
                                                                    width: `${Math.min(rec.workloadAfter, 100)}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span
                                                            className={`text-sm font-semibold ${
                                                                rec.workloadAfter >= 90
                                                                    ? "text-red-600"
                                                                    : rec.workloadAfter >= 70
                                                                    ? "text-orange-600"
                                                                    : "text-green-600"
                                                            }`}>
                                                            {rec.workloadAfter}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No recommendations available</p>
                                </div>
                            )}

                            {/* Suggestions */}
                            {suggestions.length > 0 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="font-semibold text-blue-900 mb-2">💡 Optimization Tips:</div>
                                    <ul className="space-y-1">
                                        {suggestions.map((suggestion, idx) => (
                                            <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                                                <span className="text-blue-600">•</span>
                                                <span>{suggestion}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-600">Click on a recommendation to assign the task</p>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
