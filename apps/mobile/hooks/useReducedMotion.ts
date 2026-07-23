import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";
import { subscribeToReducedMotion } from "@/lib/reduced-motion-state";

export function useReducedMotion() {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    return subscribeToReducedMotion(AccessibilityInfo, setReduceMotionEnabled);
  }, []);

  return reduceMotionEnabled;
}
