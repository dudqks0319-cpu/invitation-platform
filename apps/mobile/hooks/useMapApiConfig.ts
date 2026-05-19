import { useEffect, useState } from "react";
import {
  fetchMapApiConfig,
  getMapApiStatusLabel,
  type MapApiConfig
} from "@/lib/map-api-config";

export function useMapApiConfig() {
  const [config, setConfig] = useState<MapApiConfig | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    void fetchMapApiConfig()
      .then((nextConfig) => {
        if (!mounted) return;
        setConfig(nextConfig);
        setError("");
      })
      .catch((caught) => {
        if (!mounted) return;
        setConfig(null);
        setError(caught instanceof Error ? caught.message : "지도 API 설정을 확인하지 못했습니다.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  return {
    config,
    error,
    label: error || getMapApiStatusLabel(config)
  };
}
