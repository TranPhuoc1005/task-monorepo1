import React, { useState } from "react";
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
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";

interface ChangePasswordModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        new: false,
        confirm: false,
    });
    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    const handleSubmit = async () => {
        // Validation
        if (!formData.newPassword || !formData.confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (formData.newPassword.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: formData.newPassword,
            });

            if (error) throw error;

            Alert.alert("Success", "Password changed successfully", [
                {
                    text: "OK",
                    onPress: () => {
                        resetForm();
                        onClose();
                    },
                },
            ]);
        } catch (error: any) {
            console.error("Error changing password:", error);
            Alert.alert("Error", error.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            newPassword: "",
            confirmPassword: "",
        });
        setShowPasswords({
            new: false,
            confirm: false,
        });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Change Password</Text>
                        <Text style={styles.headerSubtitle}>Update your password</Text>
                    </View>

                    <View style={styles.headerSpacer} />
                </View>

                {/* Form */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.form}
                    keyboardShouldPersistTaps="handled">
                    {/* Info Box */}
                    <View style={styles.infoBox}>
                        <MaterialCommunityIcons name="information" size={20} color="#3b82f6" />
                        <Text style={styles.infoText}>Choose a strong password with at least 6 characters.</Text>
                    </View>

                    {/* New Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            New Password <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name="lock" size={20} color="#64748b" />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter new password"
                                value={formData.newPassword}
                                onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
                                secureTextEntry={!showPasswords.new}
                                autoCapitalize="none"
                                editable={!loading}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}>
                                <MaterialCommunityIcons
                                    name={showPasswords.new ? "eye" : "eye-off"}
                                    size={20}
                                    color="#64748b"
                                />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.hint}>Minimum 6 characters</Text>
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Confirm Password <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name="lock-check" size={20} color="#64748b" />
                            <TextInput
                                style={styles.input}
                                placeholder="Re-enter new password"
                                value={formData.confirmPassword}
                                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                                secureTextEntry={!showPasswords.confirm}
                                autoCapitalize="none"
                                editable={!loading}
                            />
                            <TouchableOpacity
                                onPress={() =>
                                    setShowPasswords({
                                        ...showPasswords,
                                        confirm: !showPasswords.confirm,
                                    })
                                }>
                                <MaterialCommunityIcons
                                    name={showPasswords.confirm ? "eye" : "eye-off"}
                                    size={20}
                                    color="#64748b"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Password Strength Indicator */}
                    {formData.newPassword.length > 0 && (
                        <View style={styles.strengthIndicator}>
                            <Text style={styles.strengthLabel}>Password Strength:</Text>
                            <View style={styles.strengthBars}>
                                <View
                                    style={[
                                        styles.strengthBar,
                                        formData.newPassword.length >= 6 && styles.strengthBarWeak,
                                    ]}
                                />
                                <View
                                    style={[
                                        styles.strengthBar,
                                        formData.newPassword.length >= 8 && styles.strengthBarMedium,
                                    ]}
                                />
                                <View
                                    style={[
                                        styles.strengthBar,
                                        formData.newPassword.length >= 10 && styles.strengthBarStrong,
                                    ]}
                                />
                            </View>
                            <Text style={styles.strengthText}>
                                {formData.newPassword.length < 6
                                    ? "Too short"
                                    : formData.newPassword.length < 8
                                    ? "Weak"
                                    : formData.newPassword.length < 10
                                    ? "Medium"
                                    : "Strong"}
                            </Text>
                        </View>
                    )}

                    {/* Warning Box */}
                    <View style={styles.warningBox}>
                        <MaterialCommunityIcons name="alert" size={20} color="#f59e0b" />
                        <Text style={styles.warningText}>You will remain logged in after changing your password.</Text>
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleClose} disabled={loading}>
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
                                        <Text style={styles.submitButtonText}>Change Password</Text>
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
    infoBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#eff6ff",
        padding: 12,
        borderRadius: 8,
        gap: 10,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#bfdbfe",
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: "#1e40af",
        lineHeight: 18,
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
    input: {
        flex: 1,
        fontSize: 16,
        color: "#1e293b",
        height: "100%",
    },
    hint: {
        fontSize: 12,
        color: "#64748b",
        marginTop: 4,
    },
    strengthIndicator: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        gap: 8,
    },
    strengthLabel: {
        fontSize: 12,
        color: "#64748b",
        fontWeight: "600",
    },
    strengthBars: {
        flexDirection: "row",
        gap: 4,
        flex: 1,
    },
    strengthBar: {
        flex: 1,
        height: 4,
        backgroundColor: "#e2e8f0",
        borderRadius: 2,
    },
    strengthBarWeak: {
        backgroundColor: "#ef4444",
    },
    strengthBarMedium: {
        backgroundColor: "#f59e0b",
    },
    strengthBarStrong: {
        backgroundColor: "#10b981",
    },
    strengthText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#64748b",
    },
    warningBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fffbeb",
        padding: 12,
        borderRadius: 8,
        gap: 10,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#fde68a",
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        color: "#92400e",
        lineHeight: 18,
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
