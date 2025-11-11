import React from "react";
import { Download } from "lucide-react";
import { Task } from "@taskpro/shared";

export interface ExportButtonProps {
    stats: {
        totalTasks: number;
        inProgress: number;
        completed: number;
        overdue: number;
        totalChange?: number;
        inProgressChange?: number;
        completedChange?: number;
        overdueChange?: number;
    };
    tasks: Task[];
}

export default function ExportButton({ stats, tasks }: ExportButtonProps) {
    const handleExport = () => {
        const data = { stats, tasks };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "dashboard_export.json";
        link.click();
    };

    return (
        <button
            onClick={handleExport}
            className="px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2">
            <Download size={16} />
            Export
        </button>
    );
}
