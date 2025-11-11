import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Task } from "../../../../packages/shared/src/types/task";
import { LinearGradient } from "expo-linear-gradient";

interface TaskCardProps {
    task: Task;
    onPress: () => void;
}

const PRIORITY_COLORS = {
    low: { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" },
    medium: { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
    high: { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
};

const STATUS_COLORS = {
    todo: "#64748b",
    "in-progress": "#f59e0b",
    review: "#8b5cf6",
    done: "#10b981",
};

export default function TaskCard({ task, onPress }: TaskCardProps) {
    const priorityColor = PRIORITY_COLORS[task.priority];
    const statusColor = STATUS_COLORS[task.status];
    const isUnassigned = !task.user_id;

    const getDaysUntilDue = () => {
        if (!task.due_date) return null;

        const due = new Date(task.due_date);
        const now = new Date();
        const diffTime = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: "Overdue", color: "#ef4444", icon: "alert-circle" };
        if (diffDays === 0) return { text: "Due today", color: "#f59e0b", icon: "time" };
        if (diffDays === 1) return { text: "Due tomorrow", color: "#f59e0b", icon: "time" };
        return { text: `${diffDays}d left`, color: "#64748b", icon: "calendar" };
    };

    const dueInfo = getDaysUntilDue();

    return (
        <TouchableOpacity
            style={[styles.card, isUnassigned && styles.cardUnassigned, { borderLeftColor: statusColor }]}
            onPress={onPress}
            activeOpacity={0.7}>
            {/* Unassigned Warning */}
            {isUnassigned && (
                <View style={styles.unassignedBanner}>
                    <Ionicons name="person-remove-outline" size={14} color="#f59e0b" />
                    <Text style={styles.unassignedText}>Not assigned</Text>
                </View>
            )}

            {/* Title */}
            <Text style={styles.title} numberOfLines={2}>
                {task.title}
            </Text>

            {/* Description */}
            {task.description && (
                <Text style={styles.description} numberOfLines={2}>
                    {task.description}
                </Text>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
                <View style={styles.tags}>
                    {task.tags.slice(0, 3).map((tag, index) => (
                        <View key={index} style={styles.tag}>
                            <Ionicons name="pricetag" size={10} color="#3b82f6" />
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                    {task.tags.length > 3 && <Text style={styles.tagMore}>+{task.tags.length - 3}</Text>}
                </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
                {/* Priority Badge */}
                <View
                    style={[
                        styles.priorityBadge,
                        {
                            backgroundColor: priorityColor.bg,
                            borderColor: priorityColor.border,
                        },
                    ]}>
                    <Text style={[styles.priorityText, { color: priorityColor.text }]}>
                        {task.priority.toUpperCase()}
                    </Text>
                </View>

                {/* Due Date */}
                {dueInfo && (
                    <View style={styles.dueDate}>
                        <Ionicons name={dueInfo.icon as any} size={12} color={dueInfo.color} />
                        <Text style={[styles.dueDateText, { color: dueInfo.color }]}>{dueInfo.text}</Text>
                    </View>
                )}
            </View>

            {/* Assignee */}
            {task.profiles ? (
                <View style={styles.assignee}>
                    <LinearGradient colors={["#3b82f6", "#8b5cf6"]} style={styles.assigneeAvatar}>
                        <Text style={styles.assigneeAvatarText}>
                            {task.profiles.full_name?.[0]?.toUpperCase() || task.profiles.email[0].toUpperCase()}
                        </Text>
                    </LinearGradient>
                    <View style={styles.assigneeInfo}>
                        <Text style={styles.assigneeName} numberOfLines={1}>
                            {task.profiles.full_name || task.profiles.email}
                        </Text>
                        {task.profiles.department && (
                            <Text style={styles.assigneeDepartment} numberOfLines={1}>
                                {task.profiles.department}
                            </Text>
                        )}
                    </View>
                </View>
            ) : isUnassigned ? (
                <View style={styles.assignee}>
                    <View style={styles.assigneeAvatarUnassigned}>
                        <Ionicons name="person-add-outline" size={16} color="#f59e0b" />
                    </View>
                    <Text style={styles.assigneeUnassignedText}>Click to assign</Text>
                </View>
            ) : null}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardUnassigned: {
        borderColor: "#fbbf24",
        backgroundColor: "#fffbeb",
    },
    unassignedBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fef3c7",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 8,
        gap: 4,
        alignSelf: "flex-start",
    },
    unassignedText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#f59e0b",
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1e293b",
        marginBottom: 8,
        lineHeight: 22,
    },
    description: {
        fontSize: 14,
        color: "#64748b",
        marginBottom: 12,
        lineHeight: 20,
    },
    tags: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginBottom: 12,
    },
    tag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#dbeafe",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    tagText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#1e40af",
    },
    tagMore: {
        fontSize: 11,
        fontWeight: "600",
        color: "#64748b",
        paddingHorizontal: 8,
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
        marginBottom: 12,
    },
    priorityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    priorityText: {
        fontSize: 11,
        fontWeight: "bold",
    },
    dueDate: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    dueDateText: {
        fontSize: 12,
        fontWeight: "600",
    },
    assignee: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    assigneeAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    assigneeAvatarText: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
    },
    assigneeAvatarUnassigned: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#fef3c7",
        alignItems: "center",
        justifyContent: "center",
    },
    assigneeInfo: {
        flex: 1,
    },
    assigneeName: {
        fontSize: 13,
        fontWeight: "600",
        color: "#334155",
    },
    assigneeDepartment: {
        fontSize: 11,
        color: "#64748b",
    },
    assigneeUnassignedText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#f59e0b",
    },
});
