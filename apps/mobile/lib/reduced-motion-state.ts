type ReducedMotionSubscription = { remove: () => void };

type ReducedMotionAccessibility = {
  isReduceMotionEnabled: () => Promise<boolean>;
  addEventListener: (event: "reduceMotionChanged", listener: (enabled: boolean) => void) => ReducedMotionSubscription;
};

export const REDUCED_MOTION_SAFE_DEFAULT = true;

export function getInitialReducedMotionState() {
  return REDUCED_MOTION_SAFE_DEFAULT;
}

export function subscribeToReducedMotion(
  accessibility: ReducedMotionAccessibility,
  onChange: (enabled: boolean) => void
) {
  let active = true;
  const publish = (enabled: boolean) => {
    if (active) onChange(enabled);
  };
  void accessibility.isReduceMotionEnabled().then(
    publish,
    () => publish(REDUCED_MOTION_SAFE_DEFAULT)
  );
  const subscription = accessibility.addEventListener("reduceMotionChanged", publish);

  return () => {
    active = false;
    subscription.remove();
  };
}
