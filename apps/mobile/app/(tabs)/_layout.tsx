// apps/mobile/app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/useAuth";
import { Image, View, StyleSheet } from "react-native";

export default function TabsLayout() {
    const { currentUser } = useAuth();
    const isAdminOrManager = currentUser?.profile?.role === "admin" || currentUser?.profile?.role === "manager";

    // Get display name (max 6 chars)
    const getDisplayName = () => {
        const name = currentUser?.profile?.full_name || currentUser?.email || "Profile";
        if (name.length <= 6) return name;
        return name.substring(0, 6);
    };

    // Avatar component for tab icon
    const AvatarTabIcon = ({ focused, size }: { focused: boolean; size: number }) => {
        const profile = currentUser?.profile;

        if (profile?.avatar_url) {
            return (
                <View
                    style={[
                        styles.avatarContainer,
                        {
                            width: size + 6,
                            height: size + 6,
                            borderColor: focused ? "#3b82f6" : "transparent",
                        },
                    ]}>
                    <Image
                        source={{ uri: profile.avatar_url }}
                        style={{ width: size, height: size, borderRadius: size / 2 }}
                    />
                </View>
            );
        }

        // Fallback to icon with initial
        const initial = profile?.full_name?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || "?";

        return (
            <View
                style={[
                    styles.avatarPlaceholder,
                    {
                        width: size + 4,
                        height: size + 4,
                        borderRadius: (size + 4) / 2,
                        backgroundColor: focused ? "#3b82f6" : "#64748b",
                    },
                ]}>
                <MaterialCommunityIcons name="account" size={size * 0.7} color="white" />
            </View>
        );
    };

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#3b82f6",
                tabBarInactiveTintColor: "#64748b",
                tabBarStyle: {
                    backgroundColor: "#ffffff",
                    borderTopWidth: 1,
                    borderTopColor: "#e2e8f0",
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "600",
                },
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="tasks"
                options={{
                    title: "Tasks",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="checkbox-marked" size={size} color={color} />
                    ),
                }}
            />

            {/* Chỉ hiện Users tab cho admin/manager */}
            {isAdminOrManager && (
                <Tabs.Screen
                    name="users"
                    options={{
                        title: "Users",
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="account-group" size={size} color={color} />
                        ),
                    }}
                />
            )}

            <Tabs.Screen
                name="calendar"
                options={{
                    title: "Calendar",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="calendar" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: getDisplayName(),
                    tabBarIcon: ({ focused, size }) => <AvatarTabIcon focused={focused} size={size} />,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    avatarContainer: {
        borderWidth: 2,
        borderRadius: 100,
        padding: 1,
    },
    avatarPlaceholder: {
        alignItems: "center",
        justifyContent: "center",
    },
});
