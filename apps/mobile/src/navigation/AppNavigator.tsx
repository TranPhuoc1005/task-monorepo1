import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import MainScreen from "../screens/MainScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const Navigator: any = Stack.Navigator;

    return (
        <NavigationContainer>
            <Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Main" component={MainScreen} />
            </Navigator>
        </NavigationContainer>
    );
}
