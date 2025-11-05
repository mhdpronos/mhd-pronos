// Date automatique
  document.getElementById("date-du-jour").textContent = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
