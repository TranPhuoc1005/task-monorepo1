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
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";

interface CreateUserModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function CreateUserModal({ visible, onClose }: CreateUserModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        full_name: "",
        role: "employee",
        department: "",
    });

    const handleSubmit = async () => {
        // Validation
        if (!formData.email || !formData.password || !formData.full_name) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        if (formData.password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/create-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                Alert.alert("Success", "User created successfully!");
                resetForm();
                onClose();
            } else {
                Alert.alert("Error", result.error || "Failed to create user");
            }
        } catch (error) {
            console.error("Error creating user:", error);
            Alert.alert("Error", "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            email: "",
            password: "",
            full_name: "",
            role: "employee",
            department: "",
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
                <LinearGradient colors={["#ffffff", "#f8fafc"]} style={styles.header}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#64748b" />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Create New User</Text>
                        <Text style={styles.headerSubtitle}>Add a new team member</Text>
                    </View>

                    <View style={styles.headerSpacer} />
                </LinearGradient>

                {/* Form */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.form}
                    keyboardShouldPersistTaps="handled">
                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Email <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color="#64748b" />
                            <TextInput
                                style={styles.input}
                                placeholder="user@example.com"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                editable={!loading}
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Password <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
                            <TextInput
                                style={styles.input}
                                placeholder="Min 6 characters"
                                value={formData.password}
                                onChangeText={(text) => setFormData({ ...formData, password: text })}
                                secureTextEntry
                                autoCapitalize="none"
                                editable={!loading}
                            />
                        </View>
                        <Text style={styles.hint}>Minimum 6 characters</Text>
                    </View>

                    {/* Full Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Full Name <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color="#64748b" />
                            <TextInput
                                style={styles.input}
                                placeholder="John Doe"
                                value={formData.full_name}
                                onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                                autoCapitalize="words"
                                editable={!loading}
                            />
                        </View>
                    </View>

                    {/* Role */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Role</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.role}
                                onValueChange={(value) => setFormData({ ...formData, role: value })}
                                enabled={!loading}>
                                <Picker.Item label="Employee" value="employee" />
                                <Picker.Item label="Manager" value="manager" />
                                <Picker.Item label="Admin" value="admin" />
                            </Picker>
                        </View>
                    </View>

                    {/* Department */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Department</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="business-outline" size={20} color="#64748b" />
                            <TextInput
                                style={styles.input}
                                placeholder="Engineering, Sales, Marketing..."
                                value={formData.department}
                                onChangeText={(text) => setFormData({ ...formData, department: text })}
                                autoCapitalize="words"
                                editable={!loading}
                            />
                        </View>
                    </View>

                    {/* Info Box */}
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={20} color="#3b82f6" />
                        <Text style={styles.infoText}>The user will receive an email with login credentials.</Text>
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
                            <LinearGradient
                                colors={loading ? ["#9ca3af", "#9ca3af"] : ["#3b82f6", "#2563eb"]}
                                style={styles.submitButtonGradient}>
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Ionicons name="person-add" size={20} color="white" />
                                        <Text style={styles.submitButtonText}>Create User</Text>
                                    </>
                                )}
                            </LinearGradient>
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
    pickerContainer: {
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 8,
        overflow: "hidden",
    },
    infoBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#eff6ff",
        padding: 12,
        borderRadius: 8,
        gap: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#bfdbfe",
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: "#1e40af",
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
        overflow: "hidden",
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonGradient: {
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
