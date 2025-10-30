import { View, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Card, Chip, ActivityIndicator } from "react-native-paper";
import { useTasks } from "@taskpro/shared";
import { supabase } from "@/lib/supabase";
import { Task, getDaysUntilDue } from "@taskpro/shared";

export default function TasksScreen() {
    const { tasksQuery } = useTasks(supabase);

    if (tasksQuery.isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const renderTask = ({ item: task }: { item: Task }) => {
        const dueInfo = getDaysUntilDue(task.due_date);
        const priorityColors = {
            low: "#10b981",
            medium: "#f59e0b",
            high: "#ef4444",
        };

        return (
            <TouchableOpacity style={styles.taskItem}>
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.taskHeader}>
                            <Text variant="titleMedium" style={styles.taskTitle}>
                                {task.title}
                            </Text>
                            <Chip
                                style={{ backgroundColor: priorityColors[task.priority] }}
                                textStyle={{ color: "white", fontSize: 10 }}>
                                {task.priority}
                            </Chip>
                        </View>

                        {task.description && (
                            <Text variant="bodySmall" style={styles.description}>
                                {task.description}
                            </Text>
                        )}

                        <View style={styles.taskFooter}>
                            <Chip style={styles.statusChip}>{task.status}</Chip>
                            {dueInfo && <Text style={styles.dueDate}>{dueInfo.text}</Text>}
                        </View>
                    </Card.Content>
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={tasksQuery.data || []}
                renderItem={renderTask}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    list: {
        padding: 16,
    },
    taskItem: {
        marginBottom: 12,
    },
    card: {
        backgroundColor: "white",
    },
    taskHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    taskTitle: {
        flex: 1,
        fontWeight: "bold",
    },
    description: {
        color: "#64748b",
        marginBottom: 12,
    },
    taskFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    statusChip: {
        height: 24,
    },
    dueDate: {
        fontSize: 12,
        color: "#64748b",
    },
});
