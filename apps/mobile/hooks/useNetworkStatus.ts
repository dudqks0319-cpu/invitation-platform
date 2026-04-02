import { useNetInfo } from "@react-native-community/netinfo";

export function useNetworkStatus() {
  const netInfo = useNetInfo();
  const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;

  return {
    isOffline,
    message: isOffline ? "인터넷 연결이 불안정합니다. 저장과 공유가 지연될 수 있습니다." : ""
  };
}
