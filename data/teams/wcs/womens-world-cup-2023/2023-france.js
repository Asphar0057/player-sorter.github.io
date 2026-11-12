registerTeam({
  id: "2023-france",
  name: "France 2023",
  shortName: "France",
  monogram: "FRA",
  league: "womens-world-cup-2023",
  season: "2023 Women's World Cup",
  kits: {
    home: {
      label: "Home",
      dark: true,
      paper: "#12275C",
      card: "#1B3474",
      ink: "#F3F6FC",
      muted: "#A9B7DA",
      line: "rgba(255,255,255,0.12)",
      primary: "#FFFFFF",
      onPrimary: "#12275C",
      accent: "#E4002B",
      onAccent: "#FFFFFF",
      photoBg: "#D9E2F5",
      header: "#1B3A8C",
      onHeader: "#FFFFFF",
      headerBand: "#E4002B",
      pattern: { type: "streaks", base: "#1B3A8C", bands: ["#2E56B8", "#0F2558"] }
    },
    away: {
      label: "Away",
      paper: "#F4F6FB",
      card: "#FFFFFF",
      ink: "#12275C",
      muted: "#5B6170",
      primary: "#1B3A8C",
      onPrimary: "#FFFFFF",
      accent: "#1B3A8C",
      onAccent: "#FFFFFF",
      header: "#FFFFFF",
      onHeader: "#1B3A8C",
      headerBand: "#E4002B",
      rowTint: "#1B3A8C",
      rowTintStrength: 0.2,
      rowTintFloor: 0.5,
      pattern: { type: "streaks", base: "#FFFFFF", bands: ["#C3D0EE", "#1B3A8C"] }
    }
  },
  players: [
    { id: "solene-durand", name: "Solène Durand", number: 1, position: "GK", nation: "Guingamp" },
    { id: "pauline-peyraud-magnin", name: "Pauline Peyraud-Magnin", number: 16, position: "GK", nation: "Juventus" },
    { id: "constance-picaud", name: "Constance Picaud", number: 21, position: "GK", nation: "Paris Saint-Germain" },

    { id: "maelle-lakrar", name: "Maëlle Lakrar", number: 2, position: "DF", nation: "Montpellier" },
    { id: "wendie-renard", name: "Wendie Renard", number: 3, position: "DF", nation: "Olympique Lyonnais" },
    { id: "elisa-de-almeida", name: "Élisa De Almeida", number: 5, position: "DF", nation: "Paris Saint-Germain" },
    { id: "sakina-karchaoui", name: "Sakina Karchaoui", number: 7, position: "DF", nation: "Paris Saint-Germain" },
    { id: "selma-bacha", name: "Selma Bacha", number: 13, position: "DF", nation: "Olympique Lyonnais" },
    { id: "aissatou-tounkara", name: "Aïssatou Tounkara", number: 14, position: "DF", nation: "Manchester United" },
    { id: "estelle-cascarino", name: "Estelle Cascarino", number: 20, position: "DF", nation: "Manchester United" },
    { id: "eve-perisset", name: "Ève Périsset", number: 22, position: "DF", nation: "Chelsea" },

    { id: "laurina-fazer", name: "Laurina Fazer", number: 4, position: "MF", nation: "Paris Saint-Germain" },
    { id: "sandie-toletti", name: "Sandie Toletti", number: 6, position: "MF", nation: "Real Madrid" },
    { id: "grace-geyoro", name: "Grace Geyoro", number: 8, position: "MF", nation: "Paris Saint-Germain" },
    { id: "amel-majri", name: "Amel Majri", number: 10, position: "MF", nation: "Olympique Lyonnais" },
    { id: "kenza-dali", name: "Kenza Dali", number: 15, position: "MF", nation: "Aston Villa" },
    { id: "lea-le-garrec", name: "Léa Le Garrec", number: 17, position: "MF", nation: "Fleury" },

    { id: "eugenie-le-sommer", name: "Eugénie Le Sommer", number: 9, position: "FW", nation: "Olympique Lyonnais" },
    { id: "kadidiatou-diani", name: "Kadidiatou Diani", number: 11, position: "FW", nation: "Paris Saint-Germain" },
    { id: "clara-mateo", name: "Clara Mateo", number: 12, position: "FW", nation: "Paris FC" },
    { id: "viviane-asseyi", name: "Viviane Asseyi", number: 18, position: "FW", nation: "West Ham United" },
    { id: "naomie-feller", name: "Naomie Feller", number: 19, position: "FW", nation: "Real Madrid" },
    { id: "vicki-becho", name: "Vicki Bècho", number: 23, position: "FW", nation: "Olympique Lyonnais" }
  ]
});