import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { checkAuth } = useAuthStore();
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    // Check if user is already authenticated
    checkAuth();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="property/[id]" options={{ 
        title: "Detalhes do Imóvel",
        headerBackTitle: "Voltar"
      }} />
      <Stack.Screen name="auth/login" options={{ 
        headerShown: false 
      }} />
      <Stack.Screen name="auth/register" options={{ 
        headerShown: false 
      }} />
      <Stack.Screen name="premium/index" options={{ 
        title: "Planos Premium",
        headerBackTitle: "Voltar"
      }} />
      <Stack.Screen name="filter/index" options={{ 
        headerShown: false 
      }} />
      <Stack.Screen name="payment/index" options={{ 
        title: "Pagamento",
        headerBackTitle: "Voltar"
      }} />
    </Stack>
  );
}