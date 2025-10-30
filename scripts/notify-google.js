// scripts/notify-google.js
import fetch from "node-fetch";

const SITEMAP_URL = "https://www.sonoff-tunisie.com/sitemap.xml";

async function notifyGoogle() {
  try {
    console.log(`🔔 Notification Google pour sitemap : ${SITEMAP_URL}`);

    // Tentative de ping
    const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`;
    const res = await fetch(pingUrl, {
      method: "GET",
      headers: {
        "Accept": "text/html",
      }
    });
    console.log(`✅ Ping envoyé, statut HTTP : ${res.status}`);

    // On peut aussi log le temps ou d’autres métadonnées
    console.log("📌 Si Google ne répond pas 200, ce n’est pas critique (endpoint déprécié)");

  } catch (err) {
    console.error("❌ Erreur lors de la notification Google :", err);
  }
}

notifyGoogle();
