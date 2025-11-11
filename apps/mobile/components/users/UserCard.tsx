import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";

interface User {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    department: string | null;
    avatar_url: string | null;
    created_at: string;
}

interface Team {
    id: string;
    name: string;
    color: string;
}

interface TeamMember {
    id: string;
    team_id: string;
    user_id: string;
    role: "team_lead" | "member";
    team?: Team;
}

interface UserCardProps {
    user: User;
    teams: Team[];
    teamMembers: TeamMember[];
    isCurrentUser: boolean;
    currentUserRole?: string;
    onUpdateRole: (userId: string, role: string) => void;
    onRemoveUser: (userId: string) => void;
    onAssignTeam: (userId: string, teamId: string) => void;
    onRemoveTeam: (membershipId: string) => void;
    onUpdateMemberRole: (membershipId: string, role: "team_lead" | "member") => void;
}

const ROLE_COLORS = {
    admin: ["#ef4444", "#dc2626"],
    manager: ["#3b82f6", "#2563eb"],
    employee: ["#64748b", "#475569"],
};

export default function UserCard({
    user,
    teams,
    teamMembers,
    isCurrentUser,
    currentUserRole,
    onUpdateRole,
    onRemoveUser,
    onAssignTeam,
    onRemoveTeam,
    onUpdateMemberRole,
}: UserCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [showTeamPicker, setShowTeamPicker] = useState(false);

    const canManage = (currentUserRole === "admin" || currentUserRole === "manager") && !isCurrentUser;
    const roleColors = ROLE_COLORS[user.role as keyof typeof ROLE_COLORS] || ROLE_COLORS.employee;

    const getInitials = (name: string | null, email: string) => {
        if (name) {
            return name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }
        return email.charAt(0).toUpperCase();
    };

    return (
        <View style={styles.card}>
            {/* User Header */}
            <TouchableOpacity style={styles.cardHeader} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
                <View style={styles.userInfo}>
                    {/* Avatar */}
                    {user.avatar_url ? (
                        <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
                    ) : (
                        <LinearGradient colors={roleColors as [string, string]} style={styles.avatar}>
                            <Text style={styles.avatarText}>{getInitials(user.full_name, user.email)}</Text>
                        </LinearGradient>
                    )}

                    {/* User Details */}
                    <View style={styles.userDetails}>
                        <Text style={styles.userName} numberOfLines={1}>
                            {user.full_name || "No Name"}
                        </Text>
                        <Text style={styles.userEmail} numberOfLines={1}>
                            {user.email}
                        </Text>
                        <View style={styles.userMeta}>
                            {user.department && (
                                <>
                                    <Ionicons name="business-outline" size={12} color="#64748b" />
                                    <Text style={styles.userMetaText}>{user.department}</Text>
                                    <Text style={styles.userMetaSeparator}>•</Text>
                                </>
                            )}
                            <Text style={styles.userMetaText}>{new Date(user.created_at).toLocaleDateString()}</Text>
                        </View>
                    </View>
                </View>

                {/* Role Badge & Actions */}
                <View style={styles.cardActions}>
                    {isCurrentUser && (
                        <View style={styles.currentUserBadge}>
                            <Text style={styles.currentUserText}>You</Text>
                        </View>
                    )}

                    <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#64748b" />
                </View>
            </TouchableOpacity>

            {/* Expanded Content */}
            {expanded && (
                <View style={styles.expandedContent}>
                    {/* Role Selector */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Role</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={user.role}
                                onValueChange={(value) => onUpdateRole(user.id, value)}
                                enabled={canManage}>
                                <Picker.Item label="Employee" value="employee" />
                                <Picker.Item label="Manager" value="manager" />
                                <Picker.Item label="Admin" value="admin" />
                            </Picker>
                        </View>
                    </View>

                    {/* Teams Section */}
                    {canManage && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionLabel}>
                                    Teams {teamMembers.length > 0 && `(${teamMembers.length})`}
                                </Text>
                                <TouchableOpacity
                                    style={styles.addTeamButton}
                                    onPress={() => setShowTeamPicker(!showTeamPicker)}>
                                    <Ionicons name="add-circle-outline" size={20} color="#3b82f6" />
                                    <Text style={styles.addTeamText}>Add Team</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Team Picker */}
                            {showTeamPicker && (
                                <View style={styles.teamPickerContainer}>
                                    <Picker
                                        selectedValue=""
                                        onValueChange={(teamId) => {
                                            if (teamId) {
                                                onAssignTeam(user.id, teamId);
                                                setShowTeamPicker(false);
                                            }
                                        }}>
                                        <Picker.Item label="Select a team..." value="" />
                                        {teams.map((team) => (
                                            <Picker.Item key={team.id} label={team.name} value={team.id} />
                                        ))}
                                    </Picker>
                                </View>
                            )}

                            {/* Team List */}
                            {teamMembers.length > 0 ? (
                                <View style={styles.teamsList}>
                                    {teamMembers.map((membership) => {
                                        const team = membership.team;
                                        if (!team) return null;

                                        return (
                                            <View
                                                key={membership.id}
                                                style={[
                                                    styles.teamItem,
                                                    {
                                                        backgroundColor: `${team.color}15`,
                                                        borderColor: `${team.color}40`,
                                                    },
                                                ]}>
                                                <View style={styles.teamItemLeft}>
                                                    <View style={[styles.teamDot, { backgroundColor: team.color }]} />
                                                    <Text style={styles.teamName} numberOfLines={1}>
                                                        {team.name}
                                                    </Text>
                                                </View>

                                                <View style={styles.teamItemActions}>
                                                    <View style={styles.rolePickerSmall}>
                                                        <Picker
                                                            selectedValue={membership.role}
                                                            onValueChange={(value) =>
                                                                onUpdateMemberRole(
                                                                    membership.id,
                                                                    value as "team_lead" | "member"
                                                                )
                                                            }
                                                            style={styles.rolePickerSmallInner}>
                                                            <Picker.Item label="Member" value="member" />
                                                            <Picker.Item label="Lead" value="team_lead" />
                                                        </Picker>
                                                    </View>

                                                    <TouchableOpacity
                                                        style={styles.removeButton}
                                                        onPress={() => onRemoveTeam(membership.id)}>
                                                        <Ionicons name="close-circle" size={20} color="#ef4444" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            ) : (
                                <View style={styles.emptyTeams}>
                                    <Text style={styles.emptyTeamsText}>No teams assigned</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Delete Button */}
                    {canManage && currentUserRole === "manager" && user.role === "employee" && (
                        <TouchableOpacity style={styles.deleteButton} onPress={() => onRemoveUser(user.id)}>
                            <Ionicons name="trash-outline" size={18} color="#ef4444" />
                            <Text style={styles.deleteButtonText}>Delete User</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "white",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        overflow: "hidden",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    userDetails: {
        flex: 1,
        gap: 2,
    },
    userName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1e293b",
    },
    userEmail: {
        fontSize: 13,
        color: "#64748b",
    },
    userMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 2,
    },
    userMetaText: {
        fontSize: 11,
        color: "#64748b",
    },
    userMetaSeparator: {
        color: "#cbd5e1",
        marginHorizontal: 2,
    },
    cardActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    currentUserBadge: {
        backgroundColor: "#dbeafe",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    currentUserText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#1e40af",
    },
    expandedContent: {
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
        padding: 16,
        gap: 16,
    },
    section: {
        gap: 8,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#334155",
    },
    pickerContainer: {
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 8,
        overflow: "hidden",
    },
    addTeamButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    addTeamText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#3b82f6",
    },
    teamPickerContainer: {
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 8,
        overflow: "hidden",
    },
    teamsList: {
        gap: 8,
    },
    teamItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    teamItemLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flex: 1,
    },
    teamDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    teamName: {
        fontSize: 14,
        fontWeight: "500",
        color: "#1e293b",
        flex: 1,
    },
    teamItemActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    rolePickerSmall: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 6,
        overflow: "hidden",
        minWidth: 100,
    },
    rolePickerSmallInner: {
        height: 32,
    },
    removeButton: {
        padding: 4,
    },
    emptyTeams: {
        alignItems: "center",
        paddingVertical: 16,
        backgroundColor: "#f8fafc",
        borderRadius: 8,
    },
    emptyTeamsText: {
        fontSize: 12,
        color: "#94a3b8",
        fontStyle: "italic",
    },
    deleteButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "#fef2f2",
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#fecaca",
    },
    deleteButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#ef4444",
    },
});
