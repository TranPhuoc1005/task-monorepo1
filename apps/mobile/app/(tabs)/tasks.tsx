import React, { useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Animated,
    Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Task } from "../../../../packages/shared/src/types/task";
import { LinearGradient } from "expo-linear-gradient";
import TaskCard from "@/tasks/TaskCard";
import TaskModal from "@/tasks/TaskModal";
import { useTasks } from "@/useTasks";
import { useAuth } from "@/useAuth";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = width;

const COLUMNS = [
    { id: "todo", title: "To Do", color: "#64748b", icon: "list-outline" },
    { id: "in-progress", title: "In Progress", color: "#f59e0b", icon: "time-outline" },
    { id: "review", title: "Review", color: "#8b5cf6", icon: "eye-outline" },
    { id: "done", title: "Done", color: "#10b981", icon: "checkmark-circle-outline" },
];

export default function TasksScreen() {
    const { tasks, isLoading } = useTasks();
    const { currentUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [defaultStatus, setDefaultStatus] = useState<Task["status"]>("todo");
    const scrollViewRef = useRef<ScrollView>(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const canCreateTask = currentUser?.profile?.role === "admin" || currentUser?.profile?.role === "manager";

    const getTasksByStatus = (status: Task["status"]) => {
        return tasks.filter((task) => task.status === status);
    };

    const handleCreateTask = (status: Task["status"]) => {
        setSelectedTask(null);
        setDefaultStatus(status);
        setIsModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={["#ffffff", "#f8fafc"]} style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Tasks Board</Text>
                        <Text style={styles.headerSubtitle}>Manage your tasks with drag and drop</Text>
                    </View>

                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="filter-outline" size={20} color="#64748b" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="options-outline" size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Column Indicators */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={styles.indicatorsScroll}
                    contentContainerStyle={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        paddingHorizontal: 16,
                        paddingBottom: 12,
                        rowGap: 12,
                    }}>
                    {COLUMNS.map((column) => {
                        const taskCount = getTasksByStatus(column.id as Task["status"]).length;
                        return (
                            <TouchableOpacity
                                key={column.id}
                                style={styles.indicator}
                                onPress={() => {
                                    scrollViewRef.current?.scrollTo({
                                        x: COLUMN_WIDTH,
                                        animated: true,
                                    });
                                }}>
                                <View style={[styles.indicatorDot, { backgroundColor: column.color }]} />
                                <Text style={styles.indicatorText}>
                                    {column.title} ({taskCount})
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </LinearGradient>

            {/* Kanban Columns */}
            <Animated.ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                bounces={false}
                overScrollMode="never"
                nestedScrollEnabled={true}
                scrollEventThrottle={16}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                    useNativeDriver: false,
                })}
                contentContainerStyle={{
                    paddingRight: 3,
                }}>
                {COLUMNS.map((column) => {
                    const columnTasks = getTasksByStatus(column.id as Task["status"]);

                    return (
                        <View key={column.id} style={[styles.column, { width: COLUMN_WIDTH }]}>
                            {/* Column Header */}
                            <View style={styles.columnHeader}>
                                <View style={styles.columnHeaderLeft}>
                                    <View style={[styles.columnIcon, { backgroundColor: `${column.color}20` }]}>
                                        <Ionicons name={column.icon as any} size={20} color={column.color} />
                                    </View>
                                    <Text style={styles.columnTitle}>{column.title}</Text>
                                    <View style={[styles.columnBadge, { backgroundColor: `${column.color}20` }]}>
                                        <Text style={[styles.columnBadgeText, { color: column.color }]}>
                                            {columnTasks.length}
                                        </Text>
                                    </View>
                                </View>

                                {canCreateTask && (
                                    <TouchableOpacity
                                        style={[styles.addButton, { backgroundColor: `${column.color}20` }]}
                                        onPress={() => handleCreateTask(column.id as Task["status"])}>
                                        <Ionicons name="add" size={20} color={column.color} />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Tasks List */}
                            <ScrollView
                                style={styles.tasksList}
                                showsVerticalScrollIndicator={false}
                                overScrollMode="never"
                                bounces={false}
                                refreshControl={<RefreshControl refreshing={isLoading} />}
                                contentContainerStyle={styles.tasksListContent}>
                                {columnTasks.length === 0 ? (
                                    <View style={styles.emptyState}>
                                        <Ionicons name="folder-open-outline" size={48} color="#cbd5e1" />
                                        <Text style={styles.emptyStateText}>No tasks</Text>
                                        {canCreateTask && (
                                            <TouchableOpacity
                                                style={styles.emptyStateButton}
                                                onPress={() => handleCreateTask(column.id as Task["status"])}>
                                                <Text style={styles.emptyStateButtonText}>Add Task</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ) : (
                                    columnTasks.map((task) => (
                                        <TaskCard key={task.id} task={task} onPress={() => handleEditTask(task)} />
                                    ))
                                )}
                            </ScrollView>
                        </View>
                    );
                })}
            </Animated.ScrollView>

            {/* Floating Action Button */}
            {canCreateTask && (
                <TouchableOpacity style={styles.fab} onPress={() => handleCreateTask("todo")}>
                    <LinearGradient colors={["#3b82f6", "#2563eb"]} style={styles.fabGradient}>
                        <Ionicons name="add" size={28} color="white" />
                    </LinearGradient>
                </TouchableOpacity>
            )}

            {/* Task Modal */}
            <TaskModal
                visible={isModalOpen}
                task={selectedTask}
                defaultStatus={defaultStatus}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedTask(null);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    header: {
        paddingTop: 60,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
    },
    headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1e293b",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#64748b",
        marginTop: 4,
    },
    headerActions: {
        flexDirection: "row",
        gap: 8,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: "#f1f5f9",
        alignItems: "center",
        justifyContent: "center",
    },
    indicatorsScroll: {
        paddingHorizontal: 20,
    },
    indicators: {
        flexDirection: "row",
        gap: 12,
    },
    indicator: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#f1f5f9",
        borderRadius: 20,
        gap: 6,
    },
    indicatorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    indicatorText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#475569",
    },
    column: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    columnHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    columnHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    columnIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    columnTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1e293b",
    },
    columnBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    columnBadgeText: {
        fontSize: 12,
        fontWeight: "bold",
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    tasksList: {
        flex: 1,
    },
    tasksListContent: {
        paddingBottom: 80,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 14,
        color: "#94a3b8",
        marginTop: 12,
        marginBottom: 16,
    },
    emptyStateButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: "#3b82f6",
        borderRadius: 8,
    },
    emptyStateButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
    },
    fab: {
        position: "absolute",
        bottom: 24,
        right: 24,
        borderRadius: 28,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
    },
});
