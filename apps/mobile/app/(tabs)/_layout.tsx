import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { appFonts } from "@/components/ui/typography";

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
        tabBarActiveTintColor: "#C9935A",
        tabBarInactiveTintColor: "#8B7355",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E8DDD3",
          height: 72,
          paddingBottom: 12,
          paddingTop: 10,
          shadowColor: "rgba(0,0,0,0.08)",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 1,
          shadowRadius: 12
        },
        tabBarLabelStyle: {
          fontFamily: appFonts.bodySemiBold,
          fontSize: 12,
          fontWeight: "600",
          letterSpacing: 0.5
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
