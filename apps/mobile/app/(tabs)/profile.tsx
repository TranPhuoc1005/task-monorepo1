// apps/mobile/app/(tabs)/profile.tsx
import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Modal, StyleSheet, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth as useSharedAuth } from "@taskpro/shared/hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { router } from "expo-router";
import EditProfileModal from "@/profile/EditProfileModal";
import ChangePasswordModal from "@/profile/ChangePasswordModal";
import { useQueryClient } from "@tanstack/react-query";

export default function Profile() {
    const queryClient = useQueryClient();
    const { currentUser, isLoading } = useSharedAuth(supabase);
    const [menuVisible, setMenuVisible] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const handleLogout = async () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            {
                text: "Cancel",
                style: "cancel",
                onPress: () => setMenuVisible(false),
            },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    setMenuVisible(false);
                    await supabase.auth.signOut();
                    router.replace("/(auth)/login");
                },
            },
        ]);
    };

    const handleProfileUpdated = async () => {
        if (currentUser?.id) {
            await queryClient.invalidateQueries({ queryKey: ["profile", currentUser.id] });
            await queryClient.refetchQueries({ queryKey: ["profile", currentUser.id] });
        }
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <MaterialCommunityIcons name="loading" size={48} color="#3b82f6" />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </View>
        );
    }

    const profile = currentUser?.profile;
    const user = currentUser;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
                    <MaterialCommunityIcons name="dots-vertical" size={24} color="#64748b" />
                </TouchableOpacity>
            </View>

            {/* User Card */}
            <View style={styles.userCard}>
                {profile?.avatar_url ? (
                    <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                            {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                        </Text>
                    </View>
                )}

                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{profile?.full_name || "No Name"}</Text>
                    <Text style={styles.userEmail}>{user?.email || "No email"}</Text>
                    {profile?.role && (
                        <View style={styles.roleBadge}>
                            <MaterialCommunityIcons
                                name={
                                    profile.role === "admin"
                                        ? "shield-crown"
                                        : profile.role === "manager"
                                        ? "account-tie"
                                        : "account"
                                }
                                size={14}
                                color={
                                    profile.role === "admin"
                                        ? "#ef4444"
                                        : profile.role === "manager"
                                        ? "#3b82f6"
                                        : "#64748b"
                                }
                            />
                            <Text
                                style={[
                                    styles.roleText,
                                    {
                                        color:
                                            profile.role === "admin"
                                                ? "#ef4444"
                                                : profile.role === "manager"
                                                ? "#3b82f6"
                                                : "#64748b",
                                    },
                                ]}>
                                {profile.role.toUpperCase()}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Info Cards */}
            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Account Information</Text>

                {profile?.department && (
                    <View style={styles.infoCard}>
                        <View style={styles.infoIconContainer}>
                            <MaterialCommunityIcons name="office-building" size={20} color="#3b82f6" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Department</Text>
                            <Text style={styles.infoValue}>{profile.department}</Text>
                        </View>
                    </View>
                )}

                <View style={styles.infoCard}>
                    <View style={styles.infoIconContainer}>
                        <MaterialCommunityIcons name="email" size={20} color="#3b82f6" />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{user?.email}</Text>
                    </View>
                </View>

                {profile?.created_at && (
                    <View style={styles.infoCard}>
                        <View style={styles.infoIconContainer}>
                            <MaterialCommunityIcons name="calendar-clock" size={20} color="#3b82f6" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Member Since</Text>
                            <Text style={styles.infoValue}>
                                {new Date(profile.created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Actions */}
            <View style={styles.actionsSection}>
                <TouchableOpacity style={styles.actionButton} onPress={() => setShowEditModal(true)}>
                    <MaterialCommunityIcons name="pencil" size={20} color="#3b82f6" />
                    <Text style={styles.actionButtonText}>Edit Profile</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#94a3b8" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => setShowPasswordModal(true)}>
                    <MaterialCommunityIcons name="shield-lock" size={20} color="#3b82f6" />
                    <Text style={styles.actionButtonText}>Change Password</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#94a3b8" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <MaterialCommunityIcons name="bell" size={20} color="#3b82f6" />
                    <Text style={styles.actionButtonText}>Notifications</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#94a3b8" />
                </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <MaterialCommunityIcons name="logout" size={20} color="#ef4444" />
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>

            {/* Menu Modal */}
            <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
                <TouchableOpacity activeOpacity={1} style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
                    <View style={styles.menu}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setMenuVisible(false);
                                setShowEditModal(true);
                            }}>
                            <MaterialCommunityIcons name="pencil" size={20} color="#3b82f6" />
                            <Text style={styles.menuText}>Edit Profile</Text>
                        </TouchableOpacity>

                        <View style={styles.menuDivider} />

                        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                            <MaterialCommunityIcons name="logout" size={20} color="#ef4444" />
                            <Text style={[styles.menuText, { color: "#ef4444" }]}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <EditProfileModal
                visible={showEditModal}
                onClose={() => setShowEditModal(false)}
                currentUser={currentUser}
                onSuccess={handleProfileUpdated}
            />

            <ChangePasswordModal visible={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
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
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#64748b",
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: "white",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1e293b",
    },
    menuButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f1f5f9",
        alignItems: "center",
        justifyContent: "center",
    },
    userCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
    },
    avatarPlaceholder: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "#3b82f6",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        fontSize: 28,
        fontWeight: "bold",
        color: "white",
    },
    userInfo: {
        marginLeft: 16,
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1e293b",
    },
    userEmail: {
        fontSize: 14,
        color: "#64748b",
        marginTop: 4,
    },
    roleBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f1f5f9",
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 8,
        gap: 4,
    },
    roleText: {
        fontSize: 11,
        fontWeight: "700",
    },
    infoSection: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1e293b",
        marginBottom: 12,
    },
    infoCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    infoIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#eff6ff",
        alignItems: "center",
        justifyContent: "center",
    },
    infoContent: {
        marginLeft: 12,
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: "#64748b",
        fontWeight: "500",
    },
    infoValue: {
        fontSize: 15,
        color: "#1e293b",
        fontWeight: "600",
        marginTop: 2,
    },
    actionsSection: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    actionButtonText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        fontWeight: "600",
        color: "#1e293b",
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fef2f2",
        marginHorizontal: 20,
        marginTop: 24,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#fecaca",
        gap: 8,
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#ef4444",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    menu: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 8,
        minWidth: 200,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        gap: 12,
        borderRadius: 8,
    },
    menuDivider: {
        height: 1,
        backgroundColor: "#f1f5f9",
        marginVertical: 4,
    },
    menuText: {
        fontSize: 16,
        color: "#1e293b",
        fontWeight: "600",
    },
});
