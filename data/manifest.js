window.SQUAD_MANIFEST = {
  siteUrl: "player-sorter.github.io",
  requestsUrl: "https://script.google.com/macros/s/AKfycbwBsWPWUBbBRoGEGGxUZfLfPQCpkZo4xTdowO7fFycVpBD8_4-xyXCpZCcjt6kWzTIW/exec",
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
          teams: ["atletico-madrid", "barcelona", "real-madrid", "real-betis", "villarreal", "rayo-vallecano"]
        },
        {
          id: "premier-league",
          name: "Premier League",
          country: "England",
          teams: ["arsenal", "liverpool", "manchester-city", "manchester-united", "aston-villa", "chelsea", "tottenham", "newcastle", "fulham"]
        },
        {
          id: "bundesliga",
          name: "Bundesliga",
          country: "Germany",
          teams: ["bayern-munich", "dortmund", "schalke"]
        },
        {
          id: "ligue-1",
          name: "Ligue 1",
          country: "France",
          teams: ["psg", "monaco"]
        },
        {
          id: "serie-a",
          name: "Serie A",
          country: "Italy",
          teams: ["roma", "juventus", "ac-milan", "inter"]
        },
        /*
        {
          id: "championship",
          name: "Championship",
          country: "England",
          teams: ["sheffield-united"]
        },
        {
          id: "liga-profesional",
          name: "Liga Profesional de Futbol (LPF)",
          country: "Argentina",
          teams: ["river-plate", "boca-juniors"]
        },
        {
          id: "brasileiro",
          name: "Campeonato Brasileiro Série A",
          country: "Brazil",
          teams: ["flamengo"]
        }
          */
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
        },
        {
          id: "liga-f",
          name: "Liga F",
          country: "Spain",
          teams: ["atletico-madrid-femenino"]
        },
        /*
        {
          id: "premiere-ligue",
          name: "Première Ligue",
          country: "France",
          teams: ["ol-lyonnes"]
        }
          */
      ]
    },
    {
      id: "wcs",
      name: "National teams",
      groups: [
        {
          id: "world-cup-2026",
          name: "World Cup 2026",
          teams: ["2026-spain", "2026-france", "2026-argentina", "2026-england"]
        },
        /*
        {
          id: "world-cup-2022",
          name: "World Cup 2022",
          teams: ["2022-argentina"]
        },
        {
          id: "world-cup-2018",
          name: "World Cup 2018",
          teams: ["2018-france"]
        }
          */
      ]
    }
  ]
};