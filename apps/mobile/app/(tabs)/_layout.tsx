import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

function renderTabIcon(name: keyof typeof Ionicons.glyphMap) {
  const TabIcon = ({ color, size }: { color: string; size: number }) => (
    <Ionicons color={color} name={name} size={size} />
  );

  TabIcon.displayName = `TabIcon(${name})`;

  return TabIcon;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#8d5a2b",
        tabBarInactiveTintColor: "#8c7a68",
        tabBarStyle: {
          backgroundColor: "#fffaf5",
          borderTopColor: "#e7d5c4",
          height: 72,
          paddingBottom: 12,
          paddingTop: 10
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600"
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: renderTabIcon("sparkles")
        }}
      />
      <Tabs.Screen
        name="my-invitations"
        options={{
          title: "내 초대장",
          tabBarIcon: renderTabIcon("mail-open")
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: "마이페이지",
          tabBarIcon: renderTabIcon("person-circle")
        }}
      />
    </Tabs>
  );
}
