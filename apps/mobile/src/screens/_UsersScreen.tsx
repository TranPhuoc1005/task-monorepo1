import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAdminUsers } from "@/useAdminUsers";
import UserCard from "@/users/UserCard";
import CreateUserModal from "@/users/CreateUserModal";

const ROLE_CONFIG = {
    admin: {
        label: "Admins",
        icon: "shield-checkmark",
        color: ["#ef4444", "#dc2626"],
        bgColor: "#fef2f2",
        borderColor: "#fecaca",
        textColor: "#991b1b",
        count: 0,
    },
    manager: {
        label: "Managers",
        icon: "people",
        color: ["#3b82f6", "#2563eb"],
        bgColor: "#eff6ff",
        borderColor: "#bfdbfe",
        textColor: "#1e40af",
        count: 0,
    },
    employee: {
        label: "Employees",
        icon: "person",
        color: ["#64748b", "#475569"],
        bgColor: "#f8fafc",
        borderColor: "#e2e8f0",
        textColor: "#334155",
        count: 0,
    },
};

export default function UsersScreen() {
    const {
        users,
        teams,
        teamMembers,
        isLoading,
        currentUser,
        updateRole,
        removeUser,
        assignTeam,
        removeTeam,
        updateMemberRole,
    } = useAdminUsers();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState<"all" | "admin" | "manager" | "employee">("all");

    const currentUserRole = currentUser?.profile?.role;
    const currentUserId = currentUser?.id;

    // Group users by role
    const adminUsers = users.filter((u) => u.role === "admin");
    const managerUsers = users.filter((u) => u.role === "manager");
    const employeeUsers = users.filter((u) => u.role === "employee");

    // Update counts
    ROLE_CONFIG.admin.count = adminUsers.length;
    ROLE_CONFIG.manager.count = managerUsers.length;
    ROLE_CONFIG.employee.count = employeeUsers.length;

    const getFilteredUsers = () => {
        switch (selectedRole) {
            case "admin":
                return adminUsers;
            case "manager":
                return managerUsers;
            case "employee":
                return employeeUsers;
            default:
                return users;
        }
    };

    const filteredUsers = getFilteredUsers();

    const onRefresh = () => {
        // Refetch data
    };

    if (!currentUser || (currentUserRole !== "admin" && currentUserRole !== "manager")) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyState}>
                    <Ionicons name="lock-closed-outline" size={64} color="#cbd5e1" />
                    <Text style={styles.emptyStateTitle}>Access Denied</Text>
                    <Text style={styles.emptyStateText}>You don't have permission to view this page</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={["#ffffff", "#f8fafc"]} style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>User Management</Text>
                        <Text style={styles.headerSubtitle}>{users.length} total users</Text>
                    </View>

                    <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateModal(true)}>
                        <LinearGradient colors={["#3b82f6", "#2563eb"]} style={styles.addButtonGradient}>
                            <Ionicons name="add" size={20} color="white" />
                            <Text style={styles.addButtonText}>Add User</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Stats Cards */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.statsScroll}
                    contentContainerStyle={[
                        styles.statsContainer,
                        { paddingRight: 40 },
                    ]}>
                    {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                        <TouchableOpacity
                            key={key}
                            style={[styles.statCard, selectedRole === key && styles.statCardActive]}
                            onPress={() => setSelectedRole(selectedRole === key ? "all" : (key as any))}>
                            <View style={[styles.statIcon, { backgroundColor: config.bgColor }]}>
                                <Ionicons name={config.icon as any} size={24} color={config.textColor} />
                            </View>
                            <View style={styles.statContent}>
                                <Text style={styles.statValue}>{config.count}</Text>
                                <Text style={styles.statLabel}>{config.label}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Filter Indicator */}
                {selectedRole !== "all" && (
                    <View style={styles.filterIndicator}>
                        <Text style={styles.filterText}>Showing {ROLE_CONFIG[selectedRole].label}</Text>
                        <TouchableOpacity onPress={() => setSelectedRole("all")}>
                            <Ionicons name="close-circle" size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>
                )}
            </LinearGradient>

            {/* Users List */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.usersList}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={onRefresh}
                        tintColor="#3b82f6"
                        colors={["#3b82f6"]}
                    />
                }>
                {filteredUsers.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={64} color="#cbd5e1" />
                        <Text style={styles.emptyStateTitle}>No users found</Text>
                        <Text style={styles.emptyStateText}>
                            {selectedRole !== "all"
                                ? `No ${ROLE_CONFIG[selectedRole].label.toLowerCase()} yet`
                                : "No users in the system"}
                        </Text>
                    </View>
                ) : (
                    filteredUsers.map((user) => (
                        <UserCard
                            key={user.id}
                            user={user}
                            teams={teams}
                            teamMembers={teamMembers.filter((m) => m.user_id === user.id)}
                            isCurrentUser={currentUserId === user.id}
                            currentUserRole={currentUserRole}
                            onUpdateRole={(userId, role) => {
                                if (currentUserId === userId) {
                                    Alert.alert("Error", "You cannot change your own role!");
                                    return;
                                }
                                Alert.alert("Confirm", `Change user role to ${role}?`, [
                                    { text: "Cancel", style: "cancel" },
                                    { text: "Confirm", onPress: () => updateRole.mutate({ userId, role }) },
                                ]);
                            }}
                            onRemoveUser={(userId) => {
                                Alert.alert("Delete User", "Are you sure you want to delete this user?", [
                                    { text: "Cancel", style: "cancel" },
                                    {
                                        text: "Delete",
                                        style: "destructive",
                                        onPress: () => removeUser.mutate(userId),
                                    },
                                ]);
                            }}
                            onAssignTeam={(userId, teamId) => {
                                assignTeam.mutate({ userId, teamId });
                            }}
                            onRemoveTeam={(membershipId) => {
                                Alert.alert("Remove from Team", "Are you sure?", [
                                    { text: "Cancel", style: "cancel" },
                                    { text: "Remove", onPress: () => removeTeam.mutate(membershipId) },
                                ]);
                            }}
                            onUpdateMemberRole={(membershipId, role) => {
                                updateMemberRole.mutate({ membershipId, role });
                            }}
                        />
                    ))
                )}
            </ScrollView>

            {/* Create User Modal */}
            <CreateUserModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} />
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
        marginBottom: 20,
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
    addButton: {
        borderRadius: 8,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    addButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 6,
    },
    addButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
    },
    statsScroll: {
        paddingHorizontal: 20,
    },
    statsContainer: {
        gap: 12,
    },
    statCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        gap: 12,
        borderWidth: 2,
        borderColor: "transparent",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    statCardActive: {
        borderColor: "#3b82f6",
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    statContent: {
        gap: 2,
    },
    statValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1e293b",
    },
    statLabel: {
        fontSize: 12,
        color: "#64748b",
        fontWeight: "500",
    },
    filterIndicator: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#dbeafe",
        marginHorizontal: 20,
        marginTop: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    filterText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#1e40af",
    },
    scrollView: {
        flex: 1,
    },
    usersList: {
        padding: 20,
        gap: 12,
    },
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 80,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#334155",
        marginTop: 16,
    },
    emptyStateText: {
        fontSize: 14,
        color: "#64748b",
        marginTop: 8,
        textAlign: "center",
    },
});
