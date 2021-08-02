import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

export async function reportWebVitals(...reporters) {
  for (const reporter of reporters.filter((r) => r && r instanceof Function)) {
    getCLS(reporter);
    getFID(reporter);
    getFCP(reporter);
    getLCP(reporter);
    getTTFB(reporter);
  }
}

export function sendToGoogleAnalytics({ name, delta, id }) {
  window.gtag &&
    window.gtag("event", name, {
      event_category: "Web Vitals",
      event_label: id,
      value: Math.round(name === "CLS" ? delta * 1000 : delta),
      non_interaction: true,
    });
}
