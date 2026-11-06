window.SQUAD_MANIFEST = {
  siteUrl: "player-sorter.github.io",
  requestsUrl: "https://script.google.com/macros/s/AKfycbxfNGqxn7fo8MHxpZp5ewRqJ8ve0y1FL7AXEouRIdHx4UfLzygcPx58Ghj7vR9sXUOx/exec",
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
      groups: []
    },
    {
      id: "wcs",
      name: "World Cup squads",
      groups: [
        {
          id: "world-cup",
          name: "World Cup winners",
          teams: []
        }
      ]
    }
  ]
};