import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PaperProvider } from "react-native-paper";

const queryClient = new QueryClient();

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <PaperProvider>
                <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["bottom"]}>
                    <Stack initialRouteName="(auth)/login" screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(auth)/login" />
                        <Stack.Screen name="(tabs)/index" options={{ headerShown: false }} />
                    </Stack>
                </SafeAreaView>
            </PaperProvider>
        </QueryClientProvider>
    );
}
