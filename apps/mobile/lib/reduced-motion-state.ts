type ReducedMotionSubscription = { remove: () => void };

type ReducedMotionAccessibility = {
  isReduceMotionEnabled: () => Promise<boolean>;
  addEventListener: (event: "reduceMotionChanged", listener: (enabled: boolean) => void) => ReducedMotionSubscription;
};

export function subscribeToReducedMotion(
  accessibility: ReducedMotionAccessibility,
  onChange: (enabled: boolean) => void
) {
  let active = true;
  void accessibility.isReduceMotionEnabled().then((enabled) => {
    if (active) onChange(enabled);
  });
  const subscription = accessibility.addEventListener("reduceMotionChanged", onChange);

  return () => {
    active = false;
    subscription.remove();
  };
}
