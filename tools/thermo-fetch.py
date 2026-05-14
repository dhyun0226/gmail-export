"""
Thermo Fisher 카탈로그 번호 → 제품정보 → Excel 추출기.

사용법:
    python thermo-fetch.py input.txt output.xlsx
    (input.txt: 한 줄에 카탈로그 번호 하나)

또는 모듈로:
    from thermo_fetch import fetch_one
"""
from __future__ import annotations

import html
import random
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from pathlib import Path

import requests
from openpyxl import Workbook

PDP_URL = "https://www.thermofisher.com/order/catalog/product/{cat}"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
}

RX_BRAND = re.compile(r'<div class="umbrella-brand">([^<]+)</div>')
RX_NAME = re.compile(r'<h1[^>]*role="heading"[^>]*>([^<]+)</h1>')
RX_DESC = re.compile(r'<div class="short-description">([^<]+)</div>')
RX_CAT = re.compile(r'pdp-table-product-selector__catalog-number">([^<]+)<')


@dataclass
class Row:
    catalog: str
    name: str
    description: str
    url: str
    status: str  # "ok" | "not_found" | "blocked" | f"error:{...}"


def _clean(s: str | None) -> str:
    if not s:
        return ""
    return html.unescape(s).strip()


def fetch_one(session: requests.Session, catalog: str, timeout: int = 20) -> Row:
    url = PDP_URL.format(cat=catalog)
    try:
        r = session.get(url, headers=HEADERS, timeout=timeout, allow_redirects=True)
    except requests.RequestException as e:
        return Row(catalog, "", "", url, f"error:{type(e).__name__}")

    if r.status_code == 403:
        return Row(catalog, "", "", url, "blocked")
    if r.status_code == 404:
        return Row(catalog, "", "", url, "not_found")
    if r.status_code != 200:
        return Row(catalog, "", "", url, f"error:http_{r.status_code}")

    body = r.text
    name = _clean(RX_NAME.search(body).group(1) if RX_NAME.search(body) else "")
    desc = _clean(RX_DESC.search(body).group(1) if RX_DESC.search(body) else "")
    # name 비어있으면 PDP 페이지가 아닌 리다이렉트/검색 폴백일 가능성
    if not name:
        return Row(catalog, "", "", url, "not_found")
    return Row(catalog, name, desc, url, "ok")


def run(
    catalogs: list[str],
    out_xlsx: Path,
    max_workers: int = 4,
    sleep_jitter: tuple[float, float] = (0.3, 0.8),
) -> list[Row]:
    session = requests.Session()
    rows: list[Row] = [None] * len(catalogs)  # type: ignore[list-item]

    def worker(idx: int, cat: str) -> tuple[int, Row]:
        time.sleep(random.uniform(*sleep_jitter))
        return idx, fetch_one(session, cat)

    with ThreadPoolExecutor(max_workers=max_workers) as ex:
        futs = [ex.submit(worker, i, c) for i, c in enumerate(catalogs)]
        for fut in as_completed(futs):
            idx, row = fut.result()
            rows[idx] = row
            mark = "OK " if row.status == "ok" else f"!! {row.status:<12}"
            print(f"  [{idx+1:>5}/{len(catalogs)}] {mark} {row.catalog}  {row.name[:60]}")

    MISSING = "없음"
    wb = Workbook()
    ws = wb.active
    ws.title = "products"
    ws.append(["catalog", "name", "description", "url"])
    for row in rows:
        if row.status == "ok":
            ws.append([row.catalog, row.name, row.description, row.url])
        else:
            ws.append([row.catalog, MISSING, MISSING, row.url])
    for col, width in zip("ABCD", [16, 60, 80, 60]):
        ws.column_dimensions[col].width = width
    wb.save(out_xlsx)
    return rows


def main() -> int:
    if len(sys.argv) < 3:
        print("usage: python thermo-fetch.py <input.txt> <output.xlsx> [workers]")
        return 1
    in_path = Path(sys.argv[1])
    out_path = Path(sys.argv[2])
    workers = int(sys.argv[3]) if len(sys.argv) >= 4 else 4

    catalogs = [
        ln.strip()
        for ln in in_path.read_text(encoding="utf-8").splitlines()
        if ln.strip() and not ln.startswith("#")
    ]
    print(f"loading {len(catalogs)} catalogs, workers={workers}")
    rows = run(catalogs, out_path, max_workers=workers)

    ok = sum(1 for r in rows if r.status == "ok")
    print(f"\nsummary: ok={ok}/{len(rows)}  -> {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
