import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

from playwright.sync_api import sync_playwright


def slug(text):
    text = text.replace("ø", "o").replace("Ø", "O").replace("æ", "ae").replace("ß", "ss").replace("ł", "l")
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")


def team_players(team_file):
    source = Path(team_file).read_text(encoding="utf-8")
    pattern = re.compile(r'\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)"(?:,\s*number:\s*(\d+))?[^}]*position:')
    return [{"id": m[0], "name": m[1], "number": int(m[2]) if m[2] else None} for m in pattern.findall(source)]


def match_player(scraped, players):
    name_slug = slug(scraped["name"])
    last = name_slug.split("-")[-1] if name_slug else ""
    for p in players:
        if slug(p["name"]) == name_slug:
            return p
    if scraped.get("number") is not None:
        for p in players:
            if p["number"] == scraped["number"]:
                return p
    hits = [p for p in players if last and last in slug(p["name"]).split("-")]
    return hits[0] if len(hits) == 1 else None


def text_of(value):
    if isinstance(value, list) and value:
        first = value[0]
        return first.get("Description") if isinstance(first, dict) else str(first)
    return value if isinstance(value, str) else None


def players_from_json(data, found):
    if isinstance(data, dict):
        picture = data.get("PlayerPicture") or data.get("Picture")
        name = text_of(data.get("ShortName")) or text_of(data.get("PlayerName")) or text_of(data.get("Name"))
        url = picture.get("PictureUrl") if isinstance(picture, dict) else None
        if name and url:
            number = data.get("JerseyNum") or data.get("ShirtNumber")
            found[slug(name)] = {"name": name, "url": url, "number": int(number) if str(number).isdigit() else None}
        for value in data.values():
            players_from_json(value, found)
    elif isinstance(data, list):
        for item in data:
            players_from_json(item, found)


def full_size(url):
    url = url.replace("{format}", "sq").replace("{size}", "4096").replace("{quality}", "100")
    return re.sub(r"[?&]io=[^&]*", "", url)


def main():
    parser = argparse.ArgumentParser(description="Download player photos from a FIFA squad page.")
    parser.add_argument("url", help="FIFA squad page URL")
    parser.add_argument("--team", help="Site team .js file, used to name photos with the site's player ids")
    parser.add_argument("--out", default="fifa_photos", help="Folder to save photos into")
    parser.add_argument("--show", action="store_true", help="Show the browser window while it runs")
    args = parser.parse_args()

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    players = team_players(args.team) if args.team else []
    found = {}

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=not args.show)
        page = browser.new_page(viewport={"width": 1400, "height": 1000})

        def on_response(response):
            if "json" not in (response.headers.get("content-type") or ""):
                return
            try:
                players_from_json(response.json(), found)
            except Exception:
                pass

        page.on("response", on_response)
        page.goto(args.url, wait_until="domcontentloaded", timeout=90000)
        for label in ["Accept All Cookies", "Accept all cookies", "I Accept", "Accept"]:
            try:
                page.get_by_role("button", name=label).first.click(timeout=2500)
                break
            except Exception:
                continue
        for _ in range(12):
            page.mouse.wheel(0, 1600)
            page.wait_for_timeout(700)
        page.wait_for_timeout(2500)

        if not found:
            images = page.eval_on_selector_all(
                "img",
                """els => els.map(e => ({ src: e.currentSrc || e.src, alt: e.alt || '',
                     card: (e.closest('a, li, article, div[class*="card"], div[class*="player"]') || e.parentElement).innerText || '' }))""",
            )
            for img in images:
                if "digitalhub.fifa.com" not in img["src"] and "fifa.com" not in img["src"]:
                    continue
                name = img["alt"].strip() or img["card"].strip().split("\n")[0]
                if not name or len(name) > 40:
                    continue
                numbers = re.findall(r"\b(\d{1,2})\b", img["card"])
                found.setdefault(slug(name), {"name": name, "url": img["src"], "number": int(numbers[0]) if numbers else None})

        if not found:
            Path(out / "page_dump.html").write_text(page.content(), encoding="utf-8")
            print("No player photos found. Saved the page HTML to", out / "page_dump.html")
            browser.close()
            sys.exit(1)

        unmatched, saved = [], 0
        for scraped in found.values():
            player = match_player(scraped, players) if players else None
            if players and not player:
                unmatched.append(scraped["name"])
            file_id = player["id"] if player else slug(scraped["name"])
            for url in [full_size(scraped["url"]), scraped["url"]]:
                response = page.request.get(url)
                if response.ok and response.body():
                    kind = response.headers.get("content-type", "")
                    ext = ".png" if "png" in kind else ".webp" if "webp" in kind else ".jpg"
                    (out / f"{file_id}{ext}").write_bytes(response.body())
                    saved += 1
                    break
            else:
                print("Could not download", scraped["name"])
        browser.close()

    print(f"Saved {saved} photos to {out}")
    if players:
        got = {p.stem for p in out.iterdir()}
        missing = [p["name"] for p in players if p["id"] not in got]
        if unmatched:
            print("On FIFA but not matched to the team file (saved under their own name):", ", ".join(unmatched))
        if missing:
            print("In the team file but no photo found:", ", ".join(missing))
    (out / "scraped.json").write_text(json.dumps(list(found.values()), indent=2, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    main()