import { Tabs } from "expo-router";
import { Text } from "react-native";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>{label}</Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTitleStyle: { fontWeight: "700", fontSize: 18 },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#F0F0F0",
          paddingBottom: 4,
          height: 56
        },
        tabBarActiveTintColor: "#4A90D9",
        tabBarInactiveTintColor: "#999",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="🏠" />
        }}
      />
      <Tabs.Screen
        name="builder"
        options={{
          title: "만들기",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="✏️" />
        }}
      />
      <Tabs.Screen
        name="invitations"
        options={{
          title: "내 초대장",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="💌" />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "설정",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="⚙️" />
        }}
      />
    </Tabs>
  );
}
