import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import * as ImagePicker from "expo-image-picker";
import { useQueryClient } from "@tanstack/react-query";

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    currentUser: any;
    onSuccess: () => void;
}

export default function EditProfileModal({ visible, onClose, currentUser, onSuccess }: EditProfileModalProps) {
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        department: "",
    });
    const [avatarUri, setAvatarUri] = useState<string | null>(null);

    useEffect(() => {
        if (currentUser?.profile) {
            setFormData({
                full_name: currentUser.profile.full_name || "",
                department: currentUser.profile.department || "",
            });
            setAvatarUri(currentUser.profile.avatar_url);
        }
    }, [currentUser]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== "granted") {
            Alert.alert("Permission needed", "Please grant camera roll permissions");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            await uploadAvatar(result.assets[0].uri);
        }
    };

    const uploadAvatar = async (uri: string) => {
        setUploading(true);

        try {
            // Delete old avatar if exists
            if (currentUser.profile?.avatar_url) {
                const oldPath = currentUser.profile.avatar_url.split("/").slice(-2).join("/");
                await supabase.storage.from("avatars").remove([oldPath]);
            }

            // Upload new avatar
            const fileExt = uri.split(".").pop();
            const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;

            const formData = new FormData();
            formData.append("file", {
                uri,
                type: `image/${fileExt}`,
                name: fileName,
            } as any);

            const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, formData);

            if (uploadError) throw uploadError;

            // Get public URL
            const {
                data: { publicUrl },
            } = supabase.storage.from("avatars").getPublicUrl(fileName);

            // Update profile
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ avatar_url: publicUrl })
                .eq("id", currentUser.id);

            if (updateError) throw updateError;

            setAvatarUri(publicUrl);

            // Invalidate and refetch profile query
            await queryClient.invalidateQueries({ queryKey: ["profile", currentUser.id] });
            await queryClient.refetchQueries({ queryKey: ["profile", currentUser.id] });

            Alert.alert("Success", "Avatar updated successfully");
            onSuccess();
        } catch (error) {
            console.error("Error uploading avatar:", error);
            Alert.alert("Error", "Failed to upload avatar");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.full_name.trim()) {
            Alert.alert("Error", "Please enter your full name");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: formData.full_name,
                    department: formData.department,
                })
                .eq("id", currentUser.id);

            if (error) throw error;

            // Invalidate and refetch profile query
            await queryClient.invalidateQueries({ queryKey: ["profile", currentUser.id] });
            await queryClient.refetchQueries({ queryKey: ["profile", currentUser.id] });

            Alert.alert("Success", "Profile updated successfully");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert("Error", "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Edit Profile</Text>
                        <Text style={styles.headerSubtitle}>Update your information</Text>
                    </View>

                    <View style={styles.headerSpacer} />
                </View>

                {/* Form */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.form}
                    keyboardShouldPersistTaps="handled">
                    {/* Avatar Section */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarWrapper}>
                            {avatarUri ? (
                                <Image source={{ uri: avatarUri }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarText}>
                                        {formData.full_name?.[0]?.toUpperCase() || "?"}
                                    </Text>
                                </View>
                            )}

                            {uploading && (
                                <View style={styles.uploadingOverlay}>
                                    <ActivityIndicator color="white" />
                                </View>
                            )}
                        </View>

                        <TouchableOpacity style={styles.changeAvatarButton} onPress={pickImage} disabled={uploading}>
                            <MaterialCommunityIcons name="camera" size={20} color="#3b82f6" />
                            <Text style={styles.changeAvatarText}>Change Photo</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Full Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Full Name <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name="account" size={20} color="#64748b" />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                value={formData.full_name}
                                onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                                editable={!loading}
                            />
                        </View>
                    </View>

                    {/* Email (Read Only) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={[styles.inputContainer, styles.inputDisabled]}>
                            <MaterialCommunityIcons name="email" size={20} color="#94a3b8" />
                            <TextInput
                                style={[styles.input, styles.textDisabled]}
                                value={currentUser?.email || ""}
                                editable={false}
                            />
                        </View>
                        <Text style={styles.hint}>Email cannot be changed</Text>
                    </View>

                    {/* Department */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Department</Text>
                        <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name="office-building" size={20} color="#64748b" />
                            <TextInput
                                style={styles.input}
                                placeholder="Engineering, Sales, Marketing..."
                                value={formData.department}
                                onChangeText={(text) => setFormData({ ...formData, department: text })}
                                editable={!loading}
                            />
                        </View>
                    </View>

                    {/* Role (Read Only) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Role</Text>
                        <View style={[styles.inputContainer, styles.inputDisabled]}>
                            <MaterialCommunityIcons name="shield-account" size={20} color="#94a3b8" />
                            <TextInput
                                style={[styles.input, styles.textDisabled]}
                                value={currentUser?.profile?.role?.toUpperCase() || "EMPLOYEE"}
                                editable={false}
                            />
                        </View>
                        <Text style={styles.hint}>Role can only be changed by an admin</Text>
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={loading}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}>
                            <View style={styles.submitButtonContent}>
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="check" size={20} color="white" />
                                        <Text style={styles.submitButtonText}>Save Changes</Text>
                                    </>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        paddingTop: 60,
        paddingBottom: 16,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
        backgroundColor: "#ffffff",
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f1f5f9",
        alignItems: "center",
        justifyContent: "center",
    },
    headerCenter: {
        flex: 1,
        marginLeft: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1e293b",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#64748b",
        marginTop: 2,
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    form: {
        padding: 20,
    },
    avatarSection: {
        alignItems: "center",
        marginBottom: 32,
    },
    avatarWrapper: {
        position: "relative",
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#3b82f6",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        fontSize: 40,
        fontWeight: "bold",
        color: "white",
    },
    uploadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
    },
    changeAvatarButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: "#eff6ff",
        borderRadius: 8,
    },
    changeAvatarText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#3b82f6",
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#334155",
        marginBottom: 8,
    },
    required: {
        color: "#ef4444",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 48,
        gap: 10,
    },
    inputDisabled: {
        backgroundColor: "#f8fafc",
        opacity: 0.6,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#1e293b",
        height: "100%",
    },
    textDisabled: {
        color: "#94a3b8",
    },
    hint: {
        fontSize: 12,
        color: "#64748b",
        marginTop: 4,
    },
    actions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 12,
        marginBottom: 20,
    },
    cancelButton: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#64748b",
    },
    submitButton: {
        flex: 1,
        height: 48,
        borderRadius: 8,
        backgroundColor: "#3b82f6",
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "white",
    },
});
