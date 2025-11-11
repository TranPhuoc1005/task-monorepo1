import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
import { useDashboard } from "../../../../packages/shared/src/hooks/useDashboard";
import { CheckSquare, Clock, AlertCircle } from "lucide-react-native";
import { Card } from "react-native-paper";
import { BarChart, PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function DashboardScreen() {
    const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("7d");
    const { data, isLoading, error } = useDashboard();

    const stats = data?.stats ?? { totalTasks: 0, inProgress: 0, completed: 0, overdue: 0, totalChange: 0, inProgressChange: 0, completedChange: 0, overdueChange: 0 };
    const tasksByStatus = data?.tasksByStatus ?? [];
    const tasksByPriority = data?.tasksByPriority ?? [];
    const recentTasks = data?.recentTasks ?? [];

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error loading dashboard data</Text>
            </View>
        );
    }

    const statsData = [
        { title: "Total Tasks", value: stats.totalTasks, icon: CheckSquare, color: "#3b82f6" },
        { title: "In Progress", value: stats.inProgress, icon: Clock, color: "#f97316" },
        { title: "Completed", value: stats.completed, icon: CheckSquare, color: "#22c55e" },
        { title: "Overdue", value: stats.overdue, icon: AlertCircle, color: "#ef4444" },
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Dashboard</Text>
                    <Text style={styles.subtitle}>Welcome back! Here's your task overview.</Text>
                </View>

                <View style={styles.filterGroup}>
                    {["7d", "30d", "90d"].map((r) => (
                        <TouchableOpacity
                            key={r}
                            onPress={() => setDateRange(r as any)}
                            style={[styles.filterButton, dateRange === r && styles.filterButtonActive]}>
                            <Text style={[styles.filterText, dateRange === r && styles.filterTextActive]}>
                                {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "90 Days"}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsGrid}>
                {statsData.map((item, i) => (
                    <Card key={i} style={styles.statCard}>
                        <View style={styles.cardContent}>
                            <item.icon color={item.color} size={28} />
                            <View>
                                <Text style={styles.statTitle}>{item.title}</Text>
                                <Text style={styles.statValue}>{item.value}</Text>
                            </View>
                        </View>
                    </Card>
                ))}
            </View>

            {/* Charts */}
            <View style={{ marginTop: 24 }}>
                <Text style={styles.sectionTitle}>Tasks by Status</Text>
                <BarChart
                    data={{
                        labels: tasksByStatus.map((t) => t.status),
                        datasets: [{ data: tasksByStatus.map((t) => t.count) }],
                    }}
                    width={screenWidth - 32}
                    height={220}
                    fromZero
                    showValuesOnTopOfBars
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={{
                        backgroundGradientFrom: "#fff",
                        backgroundGradientTo: "#fff",
                        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                        labelColor: () => "#1e293b",
                    }}
                    style={styles.chart}
                />
            </View>

            <View style={{ marginTop: 24 }}>
                <Text style={styles.sectionTitle}>Tasks by Priority</Text>
                <PieChart
                    data={tasksByPriority.map((t, i) => ({
                        name: t.priority,
                        population: t.count,
                        color: ["#22c55e", "#facc15", "#ef4444"][i % 3],
                        legendFontColor: "#1e293b",
                        legendFontSize: 14,
                    }))}
                    width={screenWidth - 32}
                    height={220}
                    chartConfig={{
                        backgroundGradientFrom: "#fff",
                        backgroundGradientTo: "#fff",
                        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                />
            </View>

            {/* Recent Tasks */}
            <View style={{ marginTop: 24 }}>
                <Text style={styles.sectionTitle}>Recent Tasks</Text>
                {recentTasks.map((t) => (
                    <View key={t.id} style={styles.taskItem}>
                        <Text style={styles.taskTitle}>{t.title}</Text>
                        <Text style={styles.taskStatus}>{t.status}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, paddingTop: 60, paddingBottom: 40 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    errorContainer: { padding: 16, backgroundColor: "#fee2e2", borderRadius: 8 },
    errorText: { color: "#b91c1c", textAlign: "center" },

    header: { flexDirection: "column", gap: 15, justifyContent: "flex-start", alignItems: "flex-start", marginBottom: 16 },
    title: { fontSize: 24, fontWeight: "700", color: "#0f172a" },
    subtitle: { fontSize: 14, color: "#475569" },

    filterGroup: { flexDirection: "row", gap: 8 },
    filterButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: "#e2e8f0" },
    filterButtonActive: { backgroundColor: "#2563eb" },
    filterText: { color: "#475569", fontWeight: "600" },
    filterTextActive: { color: "#fff" },

    statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
    statCard: { width: "47%", padding: 12 },
    cardContent: { flexDirection: "row", alignItems: "center", gap: 12 },
    statTitle: { color: "#64748b", fontSize: 14 },
    statValue: { color: "#0f172a", fontSize: 20, fontWeight: "700" },

    sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8, color: "#0f172a" },
    chart: { borderRadius: 12, marginVertical: 8 },

    taskItem: { backgroundColor: "#f1f5f9", padding: 12, borderRadius: 8, marginBottom: 8 },
    taskTitle: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
    taskStatus: { fontSize: 13, color: "#64748b" },
});
