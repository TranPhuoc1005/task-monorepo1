import React, { useState, useMemo, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import TaskModal from "../../components/tasks/TaskModal";
import { useAuth } from "@/useAuth";
import { useTasks } from "@/useTasks";

export default function CalendarScreen() {
    const { tasks, isLoading } = useTasks();
    const { currentUser } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedDateForTask, setSelectedDateForTask] = useState<string | undefined>(undefined);

    const canCreateTask = currentUser?.profile?.role === "admin" || currentUser?.profile?.role === "manager";

    // useEffect(() => {
    //     console.log("Calendar - Total tasks:", tasks?.length);
    //     console.log("Calendar - Tasks with due_date:", tasks?.filter((t) => t.due_date).length);
    // }, [tasks]);

    // ===== Calendar logic =====
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const calendarDays = useMemo(() => {
        const days = [];
        const endDate = new Date(monthEnd);
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
        let currentDay = new Date(startDate);
        while (currentDay <= endDate) {
            days.push(new Date(currentDay));
            currentDay.setDate(currentDay.getDate() + 1);
        }
        return days;
    }, [startDate, monthEnd]);

    const getTasksForDate = (date: Date) => {
        if (!tasks || tasks.length === 0) return [];

        return tasks.filter((task) => {
            if (!task.due_date) return false;

            try {
                const taskDate = new Date(task.due_date);
                const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
                return dateOnly.getTime() === taskDateOnly.getTime();
            } catch (error) {
                console.error("Error parsing date:", task.due_date, error);
                return false;
            }
        });
    };

    const formatMonthYear = () => currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    const isToday = (date: Date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth();

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "#ef4444";
            case "medium":
                return "#facc15";
            case "low":
                return "#3b82f6";
            default:
                return "#9ca3af";
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
                    <Ionicons name="chevron-back" size={24} color="#374151" />
                </TouchableOpacity>

                <Text style={styles.monthText}>{formatMonthYear()}</Text>

                <TouchableOpacity
                    onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
                    <Ionicons name="chevron-forward" size={24} color="#374151" />
                </TouchableOpacity>
            </View>

            {/* Weekdays */}
            <View style={styles.weekdays}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <Text key={d} style={styles.weekdayText}>
                        {d}
                    </Text>
                ))}
            </View>

            {/* Loading indicator */}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading tasks...</Text>
                </View>
            )}

            {/* Calendar grid */}
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.calendarGrid}>
                    {calendarDays.map((day, index) => {
                        const tasksForDay = getTasksForDate(day);
                        const today = isToday(day);
                        const current = isCurrentMonth(day);

                        return (
                            <TouchableOpacity
                                key={index}
                                style={[styles.dayBox, { backgroundColor: current ? "#fff" : "#f3f4f6" }]}
                                onPress={() => {
                                    setSelectedDate(day);
                                    setModalVisible(true);
                                }}>
                                <View style={[styles.dayCircle, today && { backgroundColor: "#2563eb" }]}>
                                    <Text style={[styles.dayText, today && { color: "#fff" }]}>{day.getDate()}</Text>
                                </View>

                                {tasksForDay.slice(0, 2).map((task) => (
                                    <View
                                        key={task.id}
                                        style={[styles.taskDot, { backgroundColor: getPriorityColor(task.priority) }]}
                                    />
                                ))}

                                {tasksForDay.length > 2 && (
                                    <Text style={styles.moreText}>+{tasksForDay.length - 2}</Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Day Task List Modal */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {selectedDate ? format(selectedDate, "EEE, MMM d, yyyy") : "Tasks"}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={22} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            {selectedDate && getTasksForDate(selectedDate).length > 0 ? (
                                getTasksForDate(selectedDate).map((task) => (
                                    <View key={task.id} style={styles.taskCard}>
                                        <Text style={styles.taskTitle}>{task.title}</Text>
                                        {task.description ? (
                                            <Text style={styles.taskDesc} numberOfLines={2}>
                                                {task.description}
                                            </Text>
                                        ) : null}
                                        <View style={styles.taskMeta}>
                                            <View
                                                style={[
                                                    styles.priorityBadge,
                                                    { backgroundColor: getPriorityColor(task.priority) },
                                                ]}>
                                                <Text style={styles.priorityText}>{task.priority}</Text>
                                            </View>
                                            {task.due_date && (
                                                <View style={styles.timeRow}>
                                                    <Ionicons name="time-outline" size={14} color="#6b7280" />
                                                    <Text style={styles.timeText}>
                                                        {format(new Date(task.due_date), "hh:mm a")}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.noTaskContainer}>
                                    <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
                                    <Text style={styles.noTaskText}>No tasks for this day</Text>
                                </View>
                            )}
                        </ScrollView>

                        {canCreateTask && (
                            <TouchableOpacity
                                style={styles.addTaskButton}
                                onPress={() => {
                                    setModalVisible(false);
                                    setSelectedDateForTask(selectedDate?.toISOString());
                                    setIsTaskModalOpen(true);
                                }}>
                                <Text style={styles.addTaskText}>Add Task</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>

            {/* ✅ Task Modal */}
            <TaskModal
                visible={isTaskModalOpen}
                defaultStatus="todo"
                defaultDueDate={selectedDateForTask}
                onClose={() => {
                    setIsTaskModalOpen(false);
                    setSelectedDateForTask(undefined);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 60,
        marginBottom: 16,
    },
    monthText: { fontSize: 18, fontWeight: "bold", color: "#1f2937" },
    weekdays: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    weekdayText: { flex: 1, textAlign: "center", color: "#4b5563", fontWeight: "600" },
    loadingContainer: {
        padding: 16,
        alignItems: "center",
    },
    loadingText: {
        color: "#6b7280",
        fontSize: 14,
    },
    calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
    dayBox: {
        width: "14.28%",
        aspectRatio: 1,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        padding: 4,
        minHeight: 60,
    },
    dayCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
    },
    dayText: { fontSize: 12, color: "#1f2937" },
    taskDot: {
        height: 6,
        borderRadius: 4,
        marginTop: 2,
        marginHorizontal: 2,
    },
    moreText: {
        fontSize: 10,
        color: "#6b7280",
        textAlign: "center",
        marginTop: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        alignItems: "center",
        justifyContent: "center",
    },
    modalContainer: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 16,
        width: "90%",
        maxHeight: "70%",
    },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    modalTitle: { fontSize: 18, fontWeight: "bold" },
    taskCard: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 6,
        padding: 12,
        marginBottom: 8,
    },
    taskTitle: { fontWeight: "600", color: "#1f2937", fontSize: 15 },
    taskDesc: { fontSize: 13, color: "#4b5563", marginTop: 4 },
    taskMeta: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        gap: 8,
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    priorityText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "600",
        textTransform: "uppercase",
    },
    timeRow: { flexDirection: "row", alignItems: "center" },
    timeText: { fontSize: 12, color: "#4b5563", marginLeft: 4 },
    noTaskContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 32 },
    noTaskText: { color: "#6b7280", marginTop: 8 },
    addTaskButton: {
        backgroundColor: "#2563eb",
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 12,
    },
    addTaskText: { color: "#fff", textAlign: "center", fontWeight: "600" },
});
