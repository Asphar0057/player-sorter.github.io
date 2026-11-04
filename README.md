# player-sorter
A fun little side project to rank football players.

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

- Crest: save as `assets/teams/atletico-madrid/crest.png`
- Player photo: save as `assets/teams/atletico-madrid/players/<player-id>.jpg`, where `<player-id>` is the `id` in the team file (e.g. `oblak.jpg`, `alvarez.jpg`)
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
- `solid`: plain `base` colour

Set `dark: true` (and a light `line` colour) for dark kits. A club with only one kit hides the colour switcher. The visitor's choice is remembered per club.

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