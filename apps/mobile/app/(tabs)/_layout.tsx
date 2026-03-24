import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1a1a1a",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          borderTopColor: "#e5e5e5",
          backgroundColor: "#fff"
        },
        headerStyle: { backgroundColor: "#fff" },
        headerTitleStyle: { fontWeight: "700", color: "#1a1a1a" }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="home-outline" size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="builder"
        options={{
          title: "만들기",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="create-outline" size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="invitations"
        options={{
          title: "내 초대장",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="mail-outline" size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "설정",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="settings-outline" size={size} />
          )
        }}
      />
    </Tabs>
  );
}
