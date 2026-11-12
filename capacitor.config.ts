import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.newgenerationnetwork.app",
  appName: "New Generation Network",
  webDir: "www",
  server: {
    url: "https://ngn-faith-connect.lovable.app",
    cleartext: false,
    androidScheme: "https"
  },
  android: {
    allowMixedContent: false
  }
};

export default config;
