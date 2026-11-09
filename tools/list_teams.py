import re
import sys
from pathlib import Path

manifest = Path(__file__).resolve().parent.parent / "data" / "manifest.js"
text = manifest.read_text(encoding="utf-8")
text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
text = re.sub(r"(?<![:\"'])//.*", "", text)

for block in re.findall(r"teams\s*:\s*\[(.*?)\]", text, flags=re.S):
    for team_id in re.findall(r"[\"']([^\"']+)[\"']", block):
        print(team_id)