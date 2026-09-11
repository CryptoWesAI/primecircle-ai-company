"""Download a generated audio file: python dl.py <url> <out>"""
import sys, urllib.request
url, out = sys.argv[1], sys.argv[2]
with urllib.request.urlopen(url, timeout=120) as r, open(out, "wb") as f:
    f.write(r.read())
print(out, "bytes", __import__("os").path.getsize(out))
