import { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";

export default function LoginScreen() {
    const [email, setEmail] = useState("tranphuoc1005@gmail.com");
    const [password, setPassword] = useState("admin");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert("Error", error.message);
        } else {
            router.replace("/(tabs)");
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text variant="displaySmall" style={styles.title}>
                TaskPro THP
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
                Sign in to your workspace
            </Text>

            <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
            />

            <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />

            <Button mode="contained" onPress={handleLogin} loading={loading} disabled={loading} style={styles.button}>
                Sign In
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
        backgroundColor: "#f8fafc",
    },
    title: {
        textAlign: "center",
        marginBottom: 8,
        fontWeight: "bold",
        color: "#2563eb",
    },
    subtitle: {
        textAlign: "center",
        marginBottom: 32,
        color: "#64748b",
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 8,
    },
});
