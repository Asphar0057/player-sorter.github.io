# Squad Sorter

Rank your favorite players from your favorite clubs.
Note: Currently only Atleti, Bayern, Arsenal, and Barcelona available.


## Folder layout

```
index.html
css/style.css
js/sorter.js              ranking engine (merge sort with ties and undo)
js/app.js                 screens, theming, saving progress
data/manifest.js          which leagues and clubs appear on the home page
data/teams/<club-id>.js   one file per club: colours + players
assets/teams/<club-id>/crest.png
assets/teams/<club-id>/players/<player-id>.jpg
```


## Adding images

Images are optional. Anything missing falls back to a club-coloured badge.

- Crest: save as `assets/teams/<team-name>/crest.png` (.svg, .webp or .jpg also work)
- Player photo: save as `assets/teams/<team-name>/players/<player-id>.jpg` (.jpeg, .png or .webp also work), where `<player-id>` is the `id` in the team file (e.g. `oblak.jpg`, `alvarez.png`). Names are case-sensitive once on GitHub Pages, so keep them lowercase.
- Different file name or format? Add `crest: "path"` to the team or `photo: "path"` to a player.

Portrait-ish photos cropped from the top work best on the cards.


## Adding a club

1. Copy `data/teams/atletico-madrid.js` to `data/teams/<new-id>.js` and edit the id, names, theme colours and players.
2. Add `"<new-id>"` to the right league in `data/manifest.js` (or add a new league block).
3. Drop images into `assets/teams/<new-id>/`.


## Colour modes (kits)

Each club file has a `kits` block with `home`, `away` and `third`. Each kit sets the page colours (`paper`, `card`, `ink`, `muted`, `primary`, `accent` and the text colours on top of them), the exported image header (`header`, `onHeader`, `headerBand`), and a `pattern` used for player badges:

- `stripes`: vertical stripes (`base` plus one band colour)
- `pinstripe`: thin vertical lines
- `hoops`: horizontal bands (can alternate several colours)
- `bolts`: plain `base` with two thin lightning-bolt stripes near the edges
- `gradient`: `base` fading top to bottom into the band colour
- `split`: `base` on the left, band colour on the right, divided by a vertical zigzag
- `sleeves`: `base` body with band-coloured shoulders and sleeves (Arsenal home)
- `zigzag`: horizontal zigzag lines across `base`, cycling through the band colours
- `tipping`: plain `base` with two thin horizontal stripes near the top, like collar tipping (Bayern away)
- `solid`: plain `base` colour

Text sitting directly on the page background uses `onPaper`, `onPaperMuted` and `paperPrimary` / `paperOnPrimary` (for buttons and highlights). Set `dark: true` (and a light `line` colour) for dark kits. The club's card on the home page always uses its home kit (`paper`, `onPaper`, `onPaperMuted` and `pattern`). The visitor's choice is remembered per club.


## Share images

The results page has a Share button that builds a PNG (story 9:16 or post 4:5; top 3, top 10 or full squad).

- Download image saves the PNG.
- Instagram story and Post on X open the phone's share sheet with the image attached. On a computer they download the image instead (X also opens a pre-written post).
