window.SQUAD_MANIFEST = {
  siteUrl: "player-sorter.github.io",
  requestsUrl: "https://script.google.com/macros/s/AKfycbyOk-IQ6VX5IgwKEGdJUy6M2oQ9zOmopCBxr7bHtb4JriwA3CB_m_UczgFQVeM_uaan/exec",
  showFirst: 5,
  sections: [
    {
      id: "mens-clubs",
      name: "Men's clubs",
      groups: [
        {
          id: "laliga",
          name: "LaLiga",
          country: "Spain",
          teams: ["atletico-madrid", "barcelona", "real-madrid"]//, "real-betis", "villarreal"]
        },
        {
          id: "premier-league",
          name: "Premier League",
          country: "England",
          teams: ["arsenal", "liverpool", "manchester-city", "manchester-united", "aston-villa"]//, "chelsea", "tottenham"]
        },
        {
          id: "bundesliga",
          name: "Bundesliga",
          country: "Germany",
          teams: ["bayern-munich", "dortmund"]
        },
        {
          id: "ligue-1",
          name: "Ligue 1",
          country: "France",
          teams: ["psg"]
        },
        {
          id: "serie-a",
          name: "Serie A",
          country: "Italy",
          teams: ["roma"]//, "juventus"]
        }
      ]
    },
    {
      id: "womens-clubs",
      name: "Women's clubs",
      groups: [
        {
          id: "wsl",
          name: "WSL",
          country: "England",
          teams: ["arsenal-women"]
        }
      ]
    },
    {
      id: "wcs",
      name: "World Cup squads",
      groups: [
        {
          id: "world-cup",
          name: "World Cup winners",
          teams: ["2026-spain"]
        }
      ]
    }
  ]
};