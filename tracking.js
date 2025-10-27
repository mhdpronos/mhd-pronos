const TRACKING_ENDPOINT = "https://us-central1-mhd-pronos.cloudfunctions.net/notifyVisit";

function shouldSkipTracking() {
  if (!TRACKING_ENDPOINT || TRACKING_ENDPOINT.includes("YOUR_PROJECT")) {
    console.warn("[MHD Pronos] L'URL de la fonction notifyVisit doit être configurée.");
    return true;
  }

  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

async function sendVisitNotification() {
  if (window.__MHD_VISIT_RECORDED__) {
    return;
  }
  window.__MHD_VISIT_RECORDED__ = true;

  const payload = {
    page: window.location.href,
    referrer: document.referrer || null,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  };

  try {
    const response = await fetch(TRACKING_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error("[MHD Pronos] Échec de la notification de visite", await response.text());
    }
  } catch (error) {
    console.error("[MHD Pronos] Impossible d'envoyer la notification de visite", error);
  }
}

if (!shouldSkipTracking()) {
  window.addEventListener("load", () => {
    // Petit délai pour laisser le temps au reste de la page de charger.
    setTimeout(sendVisitNotification, 500);
  });
}
