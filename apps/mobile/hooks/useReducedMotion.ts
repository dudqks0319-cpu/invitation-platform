import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";
import { getInitialReducedMotionState, subscribeToReducedMotion } from "@/lib/reduced-motion-state";

export function useReducedMotion() {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(getInitialReducedMotionState);

  useEffect(() => {
    return subscribeToReducedMotion(AccessibilityInfo, setReduceMotionEnabled);
  }, []);

  return reduceMotionEnabled;
}
