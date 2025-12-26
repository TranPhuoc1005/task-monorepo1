import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
    RefreshControl,
} from "react-native";
import ProjectModal from "@/projects/ProjectModal";
import { AlertCircle, BarChart3, Calendar, Clock, DollarSign, Filter, Plus, Search, Users } from "lucide-react-native";
import { useProjects } from "@taskpro/shared";
import { Project } from "@taskpro/shared";

const STATUS_COLORS = {
    planning: { backgroundColor: "#f3f4f6", color: "#4b5563", borderColor: "#d1d5db" },
    active: { backgroundColor: "#dcfce7", color: "#15803d", borderColor: "#86efac" },
    on_hold: { backgroundColor: "#fef9c3", color: "#a16207", borderColor: "#fde047" },
    completed: { backgroundColor: "#dbeafe", color: "#1e40af", borderColor: "#93c5fd" },
    cancelled: { backgroundColor: "#fee2e2", color: "#b91c1c", borderColor: "#f87171" },
};

const PRIORITY_COLORS = {
    low: "#2563eb",
    medium: "#d97706",
    high: "#ea580c",
    critical: "#dc2626",
};

export default function ProjectsScreen() {
    const { projects, isLoading, createProject, updateProject, deleteProject, currentUser } = useProjects();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [showFilters, setShowFilters] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const canCreateProject = currentUser?.profile?.role === "admin" || currentUser?.profile?.role === "manager";

    const filteredProjects = projects.filter((project) => {
        const matchesSearch =
            project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getDaysUntilDeadline = (deadline: string) => {
        const now = new Date();
        const due = new Date(deadline);
        const diffTime = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handleSubmit = async (data: Partial<Project>) => {
        try {
            if (selectedProject) {
                await updateProject.mutateAsync({ id: selectedProject.id, updates: data });
            } else {
                await createProject.mutateAsync(data);
            }
            setIsModalOpen(false);
            setSelectedProject(null);
        } catch (error) {
            console.error("Failed to submit project:", error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteProject.mutateAsync(id);
            setIsModalOpen(false);
            setSelectedProject(null);
        } catch (error) {
            console.error("Failed to delete project:", error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        setRefreshing(false);
    };

    if (isLoading && projects.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Loading projects...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>Projects</Text>
                        <Text style={styles.subtitle}>Manage your projects and track progress</Text>
                    </View>
                    {canCreateProject && (
                        <TouchableOpacity
                            style={styles.newButton}
                            onPress={() => {
                                setSelectedProject(null);
                                setIsModalOpen(true);
                            }}>
                            <Plus size={20} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Stats */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={styles.statContent}>
                            <Text style={styles.statLabel}>Total Projects</Text>
                            <Text style={styles.statValue}>{projects.length}</Text>
                        </View>
                        <View style={[styles.statIcon, { backgroundColor: "#dbeafe" }]}>
                            <BarChart3 size={24} color="#2563eb" />
                        </View>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statContent}>
                            <Text style={styles.statLabel}>Active</Text>
                            <Text style={[styles.statValue, { color: "#15803d" }]}>
                                {projects.filter((p) => p.status === "active").length}
                            </Text>
                        </View>
                        <View style={[styles.statIcon, { backgroundColor: "#dcfce7" }]}>
                            <Clock size={24} color="#15803d" />
                        </View>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statContent}>
                            <Text style={styles.statLabel}>Total Budget</Text>
                            <Text style={styles.statValue}>
                                ${(projects.reduce((sum, p) => sum + (p.budget || 0), 0) / 1000).toFixed(0)}K
                            </Text>
                        </View>
                        <View style={[styles.statIcon, { backgroundColor: "#f3e8ff" }]}>
                            <DollarSign size={24} color="#7e22ce" />
                        </View>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statContent}>
                            <Text style={styles.statLabel}>Team Members</Text>
                            <Text style={styles.statValue}>
                                {new Set(projects.flatMap((p) => p.members?.map((m) => m.user_id) || [])).size}
                            </Text>
                        </View>
                        <View style={[styles.statIcon, { backgroundColor: "#ffedd5" }]}>
                            <Users size={24} color="#ea580c" />
                        </View>
                    </View>
                </View>

                {/* Search and Filters */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputWrapper}>
                        <Search size={20} color="#9ca3af" style={styles.searchIcon} />
                        <TextInput
                            placeholder="Search projects..."
                            placeholderTextColor="#9ca3af"
                            style={styles.searchInput}
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                    </View>
                    <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
                        <Filter size={20} color="#374151" />
                    </TouchableOpacity>
                </View>

                {/* Filter Bar */}
                {showFilters && (
                    <View style={styles.filterBar}>
                        <Text style={styles.filterLabel}>Status:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.filterPills}>
                                <TouchableOpacity
                                    style={[styles.filterPill, statusFilter === "all" && styles.activeFilter]}
                                    onPress={() => setStatusFilter("all")}>
                                    <Text
                                        style={[
                                            styles.filterPillText,
                                            statusFilter === "all" && styles.activeFilterText,
                                        ]}>
                                        All
                                    </Text>
                                </TouchableOpacity>
                                {Object.keys(STATUS_COLORS).map((status) => (
                                    <TouchableOpacity
                                        key={status}
                                        style={[styles.filterPill, statusFilter === status && styles.activeFilter]}
                                        onPress={() => setStatusFilter(status)}>
                                        <Text
                                            style={[
                                                styles.filterPillText,
                                                statusFilter === status && styles.activeFilterText,
                                            ]}>
                                            {status.replace("_", " ")}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                )}

                {/* Projects List */}
                {filteredProjects.length > 0 ? (
                    <View style={styles.projectsList}>
                        {filteredProjects.map((item) => {
                            const daysLeft = item.deadline ? getDaysUntilDeadline(item.deadline) : null;
                            const isOverdue = daysLeft !== null && daysLeft < 0;
                            const isDueSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;

                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.projectCard}
                                    onPress={() => {
                                        setSelectedProject(item);
                                        setIsModalOpen(true);
                                    }}
                                    activeOpacity={0.7}>
                                    {/* Color Bar */}
                                    <View style={[styles.colorBar, { backgroundColor: item.color || "#3b82f6" }]} />

                                    <View style={styles.cardContent}>
                                        {/* Title & Description */}
                                        <Text style={styles.projectName} numberOfLines={1}>
                                            {item.name}
                                        </Text>
                                        {item.description && (
                                            <Text style={styles.projectDesc} numberOfLines={2}>
                                                {item.description}
                                            </Text>
                                        )}

                                        {/* Status & Priority */}
                                        <View style={styles.statusRow}>
                                            <View
                                                style={[
                                                    styles.statusBadge,
                                                    {
                                                        backgroundColor:
                                                            STATUS_COLORS[item.status as keyof typeof STATUS_COLORS]
                                                                .backgroundColor,
                                                        borderColor:
                                                            STATUS_COLORS[item.status as keyof typeof STATUS_COLORS]
                                                                .borderColor,
                                                    },
                                                ]}>
                                                <Text
                                                    style={[
                                                        styles.statusText,
                                                        {
                                                            color: STATUS_COLORS[
                                                                item.status as keyof typeof STATUS_COLORS
                                                            ].color,
                                                        },
                                                    ]}>
                                                    {item.status.replace("_", " ")}
                                                </Text>
                                            </View>
                                            <Text
                                                style={[
                                                    styles.priorityText,
                                                    {
                                                        color: PRIORITY_COLORS[
                                                            item.priority as keyof typeof PRIORITY_COLORS
                                                        ],
                                                    },
                                                ]}>
                                                {item.priority.toUpperCase()}
                                            </Text>
                                        </View>

                                        {/* Progress */}
                                        <View style={styles.progressSection}>
                                            <View style={styles.progressHeader}>
                                                <Text style={styles.progressLabel}>Progress</Text>
                                                <Text style={styles.progressValue}>{item.progress}%</Text>
                                            </View>
                                            <View style={styles.progressBar}>
                                                <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
                                            </View>
                                        </View>

                                        {/* Technologies */}
                                        {item.technologies && item.technologies.length > 0 && (
                                            <View style={styles.techContainer}>
                                                {item.technologies.slice(0, 3).map((tech, idx) => (
                                                    <View key={idx} style={styles.techBadge}>
                                                        <Text style={styles.techText}>{tech}</Text>
                                                    </View>
                                                ))}
                                                {item.technologies.length > 3 && (
                                                    <View style={styles.moreBadge}>
                                                        <Text style={styles.moreText}>
                                                            +{item.technologies.length - 3}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        )}

                                        {/* Info Grid */}
                                        <View style={styles.infoGrid}>
                                            {item.deadline && (
                                                <View style={styles.infoItem}>
                                                    <Calendar size={16} color="#9ca3af" />
                                                    <View style={styles.infoTextContainer}>
                                                        <Text style={styles.infoLabel}>Deadline</Text>
                                                        <Text
                                                            style={[
                                                                styles.infoValue,
                                                                isOverdue && { color: "#dc2626" },
                                                                isDueSoon && { color: "#ea580c" },
                                                            ]}>
                                                            {new Date(item.deadline).toLocaleDateString("en-US", {
                                                                month: "short",
                                                                day: "numeric",
                                                            })}
                                                        </Text>
                                                    </View>
                                                </View>
                                            )}
                                            {item.budget && (
                                                <View style={styles.infoItem}>
                                                    <DollarSign size={16} color="#9ca3af" />
                                                    <View style={styles.infoTextContainer}>
                                                        <Text style={styles.infoLabel}>Budget</Text>
                                                        <Text style={styles.infoValue}>
                                                            ${((item.budget || 0) / 1000).toFixed(0)}K
                                                        </Text>
                                                    </View>
                                                </View>
                                            )}
                                        </View>

                                        {/* Bottom Row */}
                                        <View style={styles.bottomRow}>
                                            <View style={styles.bottomItem}>
                                                <Users size={16} color="#9ca3af" />
                                                <Text style={styles.bottomText}>
                                                    {item.members?.length || 0} members
                                                </Text>
                                            </View>
                                            <View style={styles.bottomItem}>
                                                <BarChart3 size={16} color="#9ca3af" />
                                                <Text style={styles.bottomText}>{item.tasks_count || 0} tasks</Text>
                                            </View>
                                        </View>

                                        {/* Deadline Warning */}
                                        {(isOverdue || isDueSoon) && (
                                            <View
                                                style={[
                                                    styles.warning,
                                                    isOverdue ? styles.overdueWarning : styles.dueSoonWarning,
                                                ]}>
                                                <AlertCircle size={16} color={isOverdue ? "#dc2626" : "#ea580c"} />
                                                <Text
                                                    style={[
                                                        styles.warningText,
                                                        { color: isOverdue ? "#dc2626" : "#ea580c" },
                                                    ]}>
                                                    {isOverdue
                                                        ? `Overdue by ${Math.abs(daysLeft!)} days`
                                                        : `Due in ${daysLeft} days`}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <BarChart3 size={48} color="#cbd5e1" />
                        </View>
                        <Text style={styles.emptyTitle}>No projects found</Text>
                        <Text style={styles.emptySubtitle}>
                            {searchTerm
                                ? "Try adjusting your search or filters"
                                : "Get started by creating your first project"}
                        </Text>
                        {canCreateProject && !searchTerm && (
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={() => {
                                    setSelectedProject(null);
                                    setIsModalOpen(true);
                                }}>
                                <Plus size={20} color="#fff" />
                                <Text style={styles.emptyButtonText}>Create Project</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Floating Action Button */}
            {canCreateProject && filteredProjects.length > 0 && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => {
                        setSelectedProject(null);
                        setIsModalOpen(true);
                    }}
                    activeOpacity={0.8}>
                    <Plus size={28} color="#fff" />
                </TouchableOpacity>
            )}

            {/* Project Modal */}
            <ProjectModal
                visible={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedProject(null);
                }}
                project={selectedProject}
                onSubmit={handleSubmit}
                onDelete={handleDelete}
                isSubmitting={createProject.isPending || updateProject.isPending || deleteProject.isPending}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8fafc",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: "#64748b",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#0f172a",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#64748b",
    },
    newButton: {
        width: 48,
        height: 48,
        backgroundColor: "#2563eb",
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#2563eb",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 16,
        marginBottom: 20,
        gap: 12,
    },
    statCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        width: "48%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statContent: {
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        color: "#64748b",
        marginBottom: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#0f172a",
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    searchContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 12,
    },
    searchInputWrapper: {
        flex: 1,
        position: "relative",
    },
    searchIcon: {
        position: "absolute",
        left: 16,
        top: 16,
        zIndex: 1,
    },
    searchInput: {
        backgroundColor: "#fff",
        paddingVertical: 14,
        paddingLeft: 48,
        paddingRight: 16,
        borderRadius: 12,
        fontSize: 14,
        color: "#0f172a",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    filterButton: {
        width: 48,
        height: 48,
        backgroundColor: "#fff",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    filterBar: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#475569",
        marginBottom: 8,
    },
    filterPills: {
        flexDirection: "row",
        gap: 8,
    },
    filterPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#f1f5f9",
    },
    filterPillText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#64748b",
        textTransform: "capitalize",
    },
    activeFilter: {
        backgroundColor: "#2563eb",
    },
    activeFilterText: {
        color: "#fff",
    },
    projectsList: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    projectCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    colorBar: {
        height: 6,
    },
    cardContent: {
        padding: 16,
    },
    projectName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 4,
    },
    projectDesc: {
        fontSize: 13,
        color: "#64748b",
        lineHeight: 18,
        marginBottom: 12,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "600",
        textTransform: "capitalize",
    },
    priorityText: {
        fontSize: 11,
        fontWeight: "700",
    },
    progressSection: {
        marginBottom: 16,
    },
    progressHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 12,
        fontWeight: "500",
        color: "#64748b",
    },
    progressValue: {
        fontSize: 12,
        fontWeight: "700",
        color: "#0f172a",
    },
    progressBar: {
        height: 6,
        backgroundColor: "#f1f5f9",
        borderRadius: 3,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#2563eb",
        borderRadius: 3,
    },
    techContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginBottom: 16,
    },
    techBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: "#eff6ff",
        borderRadius: 6,
    },
    techText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#1e40af",
    },
    moreBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: "#f1f5f9",
        borderRadius: 6,
    },
    moreText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#64748b",
    },
    infoGrid: {
        flexDirection: "row",
        gap: 16,
        paddingTop: 12,
        marginBottom: 12,
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
    },
    infoItem: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        color: "#9ca3af",
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 13,
        fontWeight: "600",
        color: "#0f172a",
    },
    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
    },
    bottomItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    bottomText: {
        fontSize: 12,
        fontWeight: "500",
        color: "#64748b",
    },
    warning: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 12,
    },
    overdueWarning: {
        backgroundColor: "#fee2e2",
        borderWidth: 1,
        borderColor: "#fca5a5",
    },
    dueSoonWarning: {
        backgroundColor: "#ffedd5",
        borderWidth: 1,
        borderColor: "#fdba74",
    },
    warningText: {
        fontSize: 12,
        fontWeight: "600",
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 64,
        paddingHorizontal: 32,
        marginHorizontal: 20,
        backgroundColor: "#fff",
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#f1f5f9",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: "#64748b",
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 20,
    },
    emptyButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#2563eb",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#fff",
    },
    fab: {
        position: "absolute",
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        backgroundColor: "#2563eb",
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#2563eb",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
});
