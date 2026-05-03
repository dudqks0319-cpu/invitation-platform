const enabledValues = new Set(["1", "true", "yes", "on"]);
const paidPublishingEnabled = enabledValues.has(
  (process.env.EXPO_PUBLIC_ENABLE_PAID_PUBLISH || "").trim().toLowerCase()
);
const nativeSocialAuthEnabled = enabledValues.has(
  (process.env.EXPO_PUBLIC_ENABLE_NATIVE_SOCIAL_AUTH || "").trim().toLowerCase()
);

const disabledDependencies = {};

if (!paidPublishingEnabled) {
  disabledDependencies["react-native-iap"] = {
    platforms: {
      android: null,
      ios: null
    }
  };
  disabledDependencies["react-native-nitro-modules"] = {
    platforms: {
      android: null,
      ios: null
    }
  };
}

if (!nativeSocialAuthEnabled) {
  disabledDependencies["@react-native-google-signin/google-signin"] = {
    platforms: {
      android: null,
      ios: null
    }
  };
  disabledDependencies["@react-native-kakao/core"] = {
    platforms: {
      android: null,
      ios: null
    }
  };
  disabledDependencies["@react-native-kakao/user"] = {
    platforms: {
      android: null,
      ios: null
    }
  };
}

module.exports = {
  dependencies: disabledDependencies
};
