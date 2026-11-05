# Squad Sorter

Rank a football squad two players at a time until you have one definitive list. Static site, no build step, works on GitHub Pages and when opened straight from your computer.

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

- Crest: save as `assets/teams/atletico-madrid/crest.png` (.svg, .webp or .jpg also work)
- Player photo: save as `assets/teams/atletico-madrid/players/<player-id>.jpg` (.jpeg, .png or .webp also work), where `<player-id>` is the `id` in the team file (e.g. `oblak.jpg`, `alvarez.png`). Names are case-sensitive once on GitHub Pages, so keep them lowercase.
- Different file name or format? Add `crest: "path"` to the team or `photo: "path"` to a player.

Portrait-ish photos cropped from the top work best on the cards.

### Linking photos instead of downloading

`photo` can be a full web address. Wikimedia Commons links work best: they're free to reuse with credit, they don't expire, and Commons allows them to be drawn into exported images. On a Commons file page, click the image and copy the address of the full image (it starts with `https://upload.wikimedia.org/`), then:

```js
{ id: "oblak", name: "Jan Oblak", number: 13, position: "GK", nation: "SVN",
  photo: "https://upload.wikimedia.org/wikipedia/commons/...jpg",
  credit: "Photographer Name, CC BY-SA 4.0", creditUrl: "https://commons.wikimedia.org/wiki/File:..." }
```

Images from sites that don't allow other sites to draw them still show on the page, but that player gets a number badge in exported images.

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
- `solid`: plain `base` colour

Text sitting directly on the page background uses `onPaper`, `onPaperMuted` and `paperPrimary` / `paperOnPrimary` (for buttons and highlights). Set these when `paper` is a strong colour, like Atleti's red home mode; otherwise they default to the card colours. Set `dark: true` (and a light `line` colour) for dark kits. The club's card on the home page always uses its home kit (`paper`, `onPaper`, `onPaperMuted` and `pattern`). A club with only one kit hides the colour switcher. The visitor's choice is remembered per club.

## Photo credits

Photos from Wikimedia Commons need a credit. Add it to the player in the team file:

```js
{ id: "oblak", name: "Jan Oblak", number: 13, position: "GK", nation: "SVN",
  credit: "Photographer Name, CC BY-SA 4.0", creditUrl: "https://commons.wikimedia.org/wiki/File:..." }
```

Credited players are listed under "Photo credits" on the club page, and exported images get a one-line note pointing there.

## Share images

The results page has a Share button that builds a PNG (story 9:16 or post 4:5; top 3, top 10 or full squad).

- Download image saves the PNG.
- Instagram story and Post on X open the phone's share sheet with the image attached. On a computer they download the image instead (X also opens a pre-written post).
- Set `siteUrl` in `data/manifest.js` to your GitHub Pages address so it appears on the image and in the X post.
- Photos only appear in exported images when the site is served (Live Preview, GitHub Pages). Opened straight from a file, the browser blocks them and the image uses number badges instead.