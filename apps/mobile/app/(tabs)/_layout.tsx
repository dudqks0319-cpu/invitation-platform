import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

function renderTabIcon(name: keyof typeof Ionicons.glyphMap) {
  const TabIcon = ({ color, size }: { color: string; size: number }) => (
    <Ionicons color={color} name={name} size={size} />
  );

  TabIcon.displayName = `TabIcon(${name})`;

  return TabIcon;
}

export default function TabsLayout() {
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2B2824",
        tabBarInactiveTintColor: "#9B9085",
        tabBarStyle: {
          backgroundColor: "#FFFDF9",
          borderTopColor: "#E4D9CE",
          height: isWeb ? 58 : 72,
          paddingBottom: isWeb ? 8 : 12,
          paddingTop: isWeb ? 8 : 10,
          shadowColor: "rgba(62,49,37,0.09)",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 1,
          shadowRadius: 12
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
