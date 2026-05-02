const enabledValues = new Set(["1", "true", "yes", "on"]);
const paidPublishingEnabled = enabledValues.has(
  (process.env.EXPO_PUBLIC_ENABLE_PAID_PUBLISH || "").trim().toLowerCase()
);

module.exports = {
  dependencies: paidPublishingEnabled
    ? {}
    : {
        "react-native-iap": {
          platforms: {
            android: null,
            ios: null
          }
        },
        "react-native-nitro-modules": {
          platforms: {
            android: null,
            ios: null
          }
        }
      }
};
