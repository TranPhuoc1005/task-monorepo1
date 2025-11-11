import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { createClient } from "@taskpro/shared";

const testAccounts = [
    {
        role: "Manager",
        email: "tranphuoc1005@gmail.com",
        password: "admin",
        color: ["#3b82f6", "#6366f1"],
        description: "Team management",
    },
    {
        role: "Employee",
        email: "phuocpin97@gmail.com",
        password: "123456",
        color: ["#6b7280", "#64748b"],
        description: "Basic access",
    },
];

export default function LoginScreen() {
    const navigation = useNavigation();
    const supabase = createClient();

    const [email, setEmail] = useState("tranphuoc1005@gmail.com");
    const [password, setPassword] = useState("admin");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showTestAccounts, setShowTestAccounts] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Please enter email and password");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                setError(authError.message);
            } else {
                // Navigate to main app
                navigation.navigate("Main" as never);
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLogin = async (testEmail: string, testPassword: string) => {
        setEmail(testEmail);
        setPassword(testPassword);
        setLoading(true);
        setError("");

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: testEmail,
                password: testPassword,
            });

            if (authError) {
                setError(authError.message);
            } else {
                navigation.navigate("Main" as never);
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <LinearGradient colors={["#f8fafc", "#e2e8f0"]} style={styles.gradient}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    {/* Logo & Title */}
                    <View style={styles.header}>
                        <LinearGradient colors={["#3b82f6", "#6366f1"]} style={styles.logoContainer}>
                            <Ionicons name="checkmark-circle" size={40} color="white" />
                        </LinearGradient>
                        <Text style={styles.title}>TaskPro THP</Text>
                        <Text style={styles.subtitle}>Sign in to your workspace</Text>
                    </View>

                    {/* Login Form */}
                    <View style={styles.formContainer}>
                        {/* Error Message */}
                        {error ? (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={20} color="#ef4444" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="you@example.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    editable={!loading}
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    editable={!loading}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                    <Ionicons
                                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                                        size={20}
                                        color="#64748b"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}>
                            <LinearGradient
                                colors={loading ? ["#9ca3af", "#9ca3af"] : ["#3b82f6", "#2563eb"]}
                                style={styles.loginButtonGradient}>
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Ionicons name="log-in-outline" size={20} color="white" />
                                        <Text style={styles.loginButtonText}>Sign in</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Test Accounts Toggle */}
                    <TouchableOpacity
                        style={styles.testAccountsToggle}
                        onPress={() => setShowTestAccounts(!showTestAccounts)}>
                        <Ionicons name="flask-outline" size={20} color="#f59e0b" />
                        <Text style={styles.testAccountsText}>Test Accounts</Text>
                        <Ionicons name={showTestAccounts ? "chevron-up" : "chevron-down"} size={20} color="#f59e0b" />
                    </TouchableOpacity>

                    {/* Test Accounts List */}
                    {showTestAccounts && (
                        <View style={styles.testAccountsList}>
                            {testAccounts.map((account, index) => (
                                <View key={index} style={styles.testAccountCard}>
                                    <View style={styles.testAccountHeader}>
                                        <View style={styles.testAccountInfo}>
                                            <LinearGradient colors={account.color as any} style={styles.testAccountAvatar}>
                                                <Text style={styles.testAccountAvatarText}>
                                                    {account.role.charAt(0)}
                                                </Text>
                                            </LinearGradient>
                                            <View>
                                                <Text style={styles.testAccountRole}>{account.role}</Text>
                                                <Text style={styles.testAccountDescription}>{account.description}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.quickLoginButton}
                                            onPress={() => handleQuickLogin(account.email, account.password)}
                                            disabled={loading}>
                                            <Text style={styles.quickLoginButtonText}>Quick Login</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.testAccountDetails}>
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Email</Text>
                                            <Text style={styles.detailValue}>{account.email}</Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Password</Text>
                                            <Text style={styles.detailValue}>{account.password}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Footer */}
                    <Text style={styles.footer}>Demo environment • All data is for testing purposes</Text>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
    },
    header: {
        alignItems: "center",
        marginBottom: 32,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#1e293b",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "#64748b",
    },
    formContainer: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fef2f2",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#fecaca",
    },
    errorText: {
        color: "#ef4444",
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#334155",
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8fafc",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        paddingHorizontal: 12,
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: "#1e293b",
        marginLeft: 8,
    },
    eyeIcon: {
        padding: 8,
    },
    loginButton: {
        marginTop: 8,
        borderRadius: 8,
        overflow: "hidden",
    },
    loginButtonDisabled: {
        opacity: 0.6,
    },
    loginButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 48,
        gap: 8,
    },
    loginButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    testAccountsToggle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fef3c7",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: "#fde68a",
    },
    testAccountsText: {
        color: "#f59e0b",
        fontSize: 14,
        fontWeight: "600",
    },
    testAccountsList: {
        gap: 12,
        marginBottom: 16,
    },
    testAccountCard: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    testAccountHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    testAccountInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    testAccountAvatar: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    testAccountAvatarText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    testAccountRole: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1e293b",
    },
    testAccountDescription: {
        fontSize: 12,
        color: "#64748b",
    },
    quickLoginButton: {
        backgroundColor: "#3b82f6",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    quickLoginButtonText: {
        color: "white",
        fontSize: 12,
        fontWeight: "600",
    },
    testAccountDetails: {
        gap: 8,
    },
    detailRow: {
        backgroundColor: "#f8fafc",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    detailLabel: {
        fontSize: 10,
        color: "#64748b",
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 12,
        fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
        color: "#1e293b",
    },
    footer: {
        textAlign: "center",
        fontSize: 12,
        color: "#94a3b8",
    },
});
