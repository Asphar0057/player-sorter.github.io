registerTeam({
  id: "ol-lyonnes",
  name: "OL Lyonnes",
  shortName: "Lyon",
  monogram: "OL",
  league: "premiere-ligue",
  season: "2026/27",
  kits: {
    home: {
      label: "Home",
      paper: "#F4F5F8",
      card: "#FFFFFF",
      ink: "#0E1B3D",
      muted: "#5B6170",
      primary: "#14387F",
      onPrimary: "#FFFFFF",
      accent: "#DA001A",
      onAccent: "#FFFFFF",
      header: "#FFFFFF",
      onHeader: "#14387F",
      headerBand: "#DA001A",
      rowTint: "#14387F",
      rowTintStrength: 0.2,
      rowTintFloor: 0.5,
      pattern: { type: "centreband", base: "#FFFFFF", bands: ["#DA001A", "#14387F"] }
    }
  },
  players: [
    { id: "endler", name: "Christiane Endler", number: 1, position: "GK", nation: "CHI" },
    { id: "belhadj", name: "Féérine Belhadj", number: 16, position: "GK", nation: "FRA" },
    { id: "grohs", name: "Maria-Luisa Grohs", number: 25, position: "GK", nation: "GER" },

    { id: "renard", name: "Wendie Renard", number: 3, position: "DF", nation: "FRA" },
    { id: "bacha", name: "Selma Bacha", number: 4, position: "DF", nation: "FRA" },
    { id: "junttila-nelhage", name: "Elma Junttila Nelhage", number: 5, position: "DF", nation: "SWE" },
    { id: "lawrence", name: "Ashley Lawrence", number: 12, position: "DF", nation: "CAN" },
    { id: "fathallah", name: "Maïssa Fathallah", number: 17, position: "DF", nation: "FRA" },
    { id: "sangare", name: "Wassa Sangaré", number: 26, position: "DF", nation: "FRA" },
    { id: "rafalski", name: "Romane Rafalski", number: 28, position: "DF", nation: "FRA" },
    { id: "tarciane", name: "Tarciane", number: 33, position: "DF", nation: "BRA" },

    { id: "dumornay", name: "Melchie Dumornay", number: 6, position: "MF", nation: "HAI" },
    { id: "shrader", name: "Korbin Shrader", number: 8, position: "MF", nation: "USA" },
    { id: "benyahia", name: "Inès Benyahia", number: 10, position: "MF", nation: "FRA" },
    { id: "egurrola", name: "Damaris Egurrola", number: 13, position: "MF", nation: "NED" },
    { id: "engen", name: "Ingrid Engen", number: 15, position: "MF", nation: "NOR" },
    { id: "yohannes", name: "Lily Yohannes", number: 20, position: "MF", nation: "USA" },
    { id: "weir", name: "Caroline Weir", number: 23, position: "MF", nation: "SCO" },
    { id: "swierot", name: "Julie Swierot", number: 24, position: "MF", nation: "FRA" },

    { id: "becho", name: "Vicki Becho", number: 7, position: "FW", nation: "FRA" },
    { id: "katoto", name: "Marie-Antoinette Katoto", number: 9, position: "FW", nation: "FRA" },
    { id: "chawinga", name: "Tabitha Chawinga", number: 11, position: "FW", nation: "MWI" },
    { id: "hegerberg", name: "Ada Hegerberg", number: 14, position: "FW", nation: "NOR" },
    { id: "kaneryd", name: "Johanna Rytting Kaneryd", number: 19, position: "FW", nation: "SWE" },
    { id: "brand", name: "Jule Brand", number: 29, position: "FW", nation: "GER" },
    { id: "waksman", name: "Giovanna Waksman", number: 30, position: "FW", nation: "BRA" },
    { id: "paralluelo", name: "Salma Paralluelo", number: 77, position: "FW", nation: "ESP" }
  ]
});