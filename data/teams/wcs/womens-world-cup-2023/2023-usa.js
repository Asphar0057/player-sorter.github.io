registerTeam({
  id: "2023-usa",
  name: "USA 2023",
  shortName: "USA",
  monogram: "USA",
  league: "womens-world-cup-2023",
  season: "2023 Women's World Cup",
  kits: {
    home: {
      label: "Home",
      paper: "#F4F6FA",
      card: "#FFFFFF",
      ink: "#0A1F44",
      muted: "#5B6170",
      primary: "#0A1F44",
      onPrimary: "#FFFFFF",
      accent: "#0A1F44",
      onAccent: "#FFFFFF",
      header: "#FFFFFF",
      onHeader: "#0A1F44",
      headerBand: "#BF0D3E",
      rowTint: "#0A1F44",
      rowTintStrength: 0.2,
      rowTintFloor: 0.5,
      pattern: { type: "bruise", base: "#FFFFFF", bands: ["#C9D3E6"] }
    },
    away: {
      label: "Away",
      dark: true,
      paper: "#1C3F8A",
      card: "#24499B",
      ink: "#F3F6FC",
      muted: "#B4C3E3",
      line: "rgba(255,255,255,0.12)",
      primary: "#FFFFFF",
      onPrimary: "#1C3F8A",
      accent: "#BF0D3E",
      onAccent: "#FFFFFF",
      photoBg: "#EEF2FA",
      header: "#2B5BC0",
      onHeader: "#FFFFFF",
      headerBand: "#BF0D3E",
      pattern: { type: "marble", base: "#2B5BC0", bands: ["#7FA6E8", "#1C3F8A", "#4C7FD6"] }
    }
  },
  players: [
    { id: "alyssa-naeher", name: "Alyssa Naeher", number: 1, position: "GK", nation: "Chicago Red Stars" },
    { id: "casey-murphy", name: "Casey Murphy", number: 18, position: "GK", nation: "North Carolina Courage" },
    { id: "aubrey-kingsbury", name: "Aubrey Kingsbury", number: 21, position: "GK", nation: "Washington Spirit" },

    { id: "sofia-huerta", name: "Sofia Huerta", number: 3, position: "DF", nation: "OL Reign" },
    { id: "naomi-girma", name: "Naomi Girma", number: 4, position: "DF", nation: "San Diego Wave" },
    { id: "kelley-ohara", name: "Kelley O'Hara", number: 5, position: "DF", nation: "NJ/NY Gotham FC" },
    { id: "alana-cook", name: "Alana Cook", number: 12, position: "DF", nation: "OL Reign" },
    { id: "emily-sonnett", name: "Emily Sonnett", number: 14, position: "DF", nation: "OL Reign" },
    { id: "crystal-dunn", name: "Crystal Dunn", number: 19, position: "DF", nation: "Portland Thorns" },
    { id: "emily-fox", name: "Emily Fox", number: 23, position: "DF", nation: "North Carolina Courage" },

    { id: "ashley-sanchez", name: "Ashley Sanchez", number: 2, position: "MF", nation: "Washington Spirit" },
    { id: "julie-ertz", name: "Julie Ertz", number: 8, position: "MF", nation: "Angel City" },
    { id: "savannah-demelo", name: "Savannah DeMelo", number: 9, position: "MF", nation: "Racing Louisville" },
    { id: "lindsey-horan", name: "Lindsey Horan", number: 10, position: "MF", nation: "Olympique Lyonnais" },
    { id: "rose-lavelle", name: "Rose Lavelle", number: 16, position: "MF", nation: "OL Reign" },
    { id: "andi-sullivan", name: "Andi Sullivan", number: 17, position: "MF", nation: "Washington Spirit" },
    { id: "kristie-mewis", name: "Kristie Mewis", number: 22, position: "MF", nation: "NJ/NY Gotham FC" },

    { id: "lynn-williams", name: "Lynn Williams", number: 6, position: "FW", nation: "NJ/NY Gotham FC" },
    { id: "alyssa-thompson", name: "Alyssa Thompson", number: 7, position: "FW", nation: "Angel City" },
    { id: "sophia-smith", name: "Sophia Smith", number: 11, position: "FW", nation: "Portland Thorns" },
    { id: "alex-morgan", name: "Alex Morgan", number: 13, position: "FW", nation: "San Diego Wave" },
    { id: "megan-rapinoe", name: "Megan Rapinoe", number: 15, position: "FW", nation: "OL Reign" },
    { id: "trinity-rodman", name: "Trinity Rodman", number: 20, position: "FW", nation: "Washington Spirit" }
  ]
});