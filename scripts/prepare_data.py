"""Prepare compact JSON for the Vue app from ../pcngon-data.

Validates source data, rewrites internal pcngon.vn links in HTML content,
and outputs into public/data/:
  products.json          compact list of all products (for listing + search)
  products/<slug>.json   full detail per product (loaded on demand)
  categories.json        category tree
  posts.json             post index
  posts/<slug>.json      post content
  pages.json             static pages index (guides, policies, services)
  pages/<slug>.json      static page content
"""
import json
import os
import re
from urllib.parse import urlparse

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA = os.path.join(os.path.dirname(ROOT), "pcngon-data")
OUT = os.path.join(ROOT, "public", "data")

HREF_RE = re.compile(
    r'href=(["\'])https?://(?:www\.)?pcngon\.vn(/[^"\']*)\1',
    re.IGNORECASE,
)
STATIC_ROUTES = {
    "": "/",
    "san-pham": "/san-pham",
    "cua-hang": "/san-pham",
    "tin-tuc": "/tin-tuc",
    "lien-he": "/lien-he",
}


def read(*parts):
    with open(os.path.join(DATA, *parts), encoding="utf-8") as f:
        return json.load(f)


def write(rel, obj):
    path = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))


def load_all_products():
    products = []
    products_dir = os.path.join(DATA, "products")
    for root, _, files in os.walk(products_dir):
        for name in sorted(files):
            if not name.endswith(".json") or name == "index.json":
                continue
            with open(os.path.join(root, name), encoding="utf-8") as f:
                d = json.load(f)
            if isinstance(d, dict) and "products" in d:
                products.extend(d["products"] or [])
            elif isinstance(d, dict):
                products.append(d)
    return products


def load_all_posts():
    posts = []
    content_dir = os.path.join(DATA, "posts", "content")
    for name in sorted(os.listdir(content_dir)):
        if not name.endswith(".json"):
            continue
        posts.append(read("posts", "content", name))
    return posts


def load_all_pages():
    pages = []
    pages_dir = os.path.join(DATA, "pages")
    if not os.path.isdir(pages_dir):
        return pages
    for root, _, files in os.walk(pages_dir):
        rel = os.path.relpath(root, pages_dir)
        for name in sorted(files):
            if not name.endswith(".json"):
                continue
            with open(os.path.join(root, name), encoding="utf-8") as f:
                d = json.load(f)
            if isinstance(d, list):
                group = name[:-5]
                for item in d:
                    pages.append((group, item))
            elif isinstance(d, dict):
                group = rel if rel != "." else "pages"
                pages.append((group, d))
    return pages


def validate_data(products, flat_cats, posts):
    """Validate IDs, slugs, prices, and category references. Returns (errors, warnings)."""
    errors = []
    warnings = []

    cat_ids = set()
    cat_slugs = set()
    for c in flat_cats:
        cid, cslug = c.get("id"), c.get("slug")
        if cid in cat_ids:
            errors.append(f"Duplicate category id: {cid}")
        if cslug in cat_slugs:
            errors.append(f"Duplicate category slug: {cslug}")
        cat_ids.add(cid)
        cat_slugs.add(cslug)

    prod_ids = set()
    prod_slugs = set()
    for p in products:
        pid, pslug = p.get("id"), p.get("slug")
        if not pid or not pslug or not p.get("name"):
            errors.append(f"Product missing required field (id={pid}, slug={pslug})")
            continue
        if pid in prod_ids:
            errors.append(f"Duplicate product id: {pid}")
        if pslug in prod_slugs:
            errors.append(f"Duplicate product slug: {pslug}")
        prod_ids.add(pid)
        prod_slugs.add(pslug)

        price = p.get("price") or {}
        for field in ("current", "regular"):
            val = price.get(field)
            if isinstance(val, (int, float)) and val < 0:
                errors.append(f"Negative {field} price on product {pslug}: {val}")

        for cid in p.get("category_ids") or []:
            if cid not in cat_ids:
                warnings.append(f"Product {pslug} references unknown category_id {cid}")

    post_slugs = set()
    for post in posts:
        slug = post.get("slug")
        if not slug:
            errors.append(f"Post missing slug (id={post.get('id')})")
            continue
        if slug in post_slugs:
            errors.append(f"Duplicate post slug: {slug}")
        post_slugs.add(slug)

    return errors, warnings


def make_link_rewriter(prod_slugs, cat_slugs, post_slugs, page_slugs):
    """Build a rewriter that maps internal pcngon.vn links to Vue router paths."""
    stats = {"rewritten": 0}

    def rewrite(html):
        if not html or "pcngon.vn" not in html:
            return html

        def _replace(match):
            quote = match.group(1)
            raw_path = match.group(2)
            parsed = urlparse(raw_path)
            path = parsed.path.strip("/")

            if path.startswith("wp-content/"):
                return match.group(0)

            target = None
            if path in STATIC_ROUTES:
                target = STATIC_ROUTES[path]
            else:
                slug = path.split("/")[-1]
                if slug in prod_slugs:
                    target = f"/san-pham/{slug}"
                elif slug in cat_slugs:
                    target = f"/danh-muc/{slug}"
                elif slug in post_slugs:
                    target = f"/tin-tuc/{slug}"
                elif slug in page_slugs:
                    target = f"/trang/{slug}"

            if not target:
                return match.group(0)

            if parsed.fragment:
                target = f"{target}#{parsed.fragment}"
            stats["rewritten"] += 1
            return f"href={quote}{target}{quote}"

        return HREF_RE.sub(_replace, html)

    return rewrite, stats


def build_categories(flat, products):
    by_id = {c["id"]: c for c in flat}
    products_by_cat = {}
    for p in products:
        for cid in p["category_ids"]:
            products_by_cat.setdefault(cid, []).append(p["id"])

    def desc_ids(cid):
        out, stack = [cid], [cid]
        while stack:
            cur = stack.pop()
            for c in flat:
                if c.get("parent_id") == cur:
                    out.append(c["id"])
                    stack.append(c["id"])
        return out

    cats = []
    for c in flat:
        ids = desc_ids(c["id"])
        count = len({pid for i in ids for pid in products_by_cat.get(i, [])})
        kids = [k["id"] for k in flat if k.get("parent_id") == c["id"]]
        parent = c.get("parent_id")
        cats.append({
            "id": c["id"],
            "slug": c["slug"],
            "name": c["name"],
            "parentId": parent,
            "parentSlug": by_id[parent]["slug"] if parent in by_id else None,
            "children": kids,
            "count": count,
            "desc": (c.get("description") or "")[:600],
        })
    return cats


def export_pages(pages_data, rewrite_html):
    pages_index = []
    for group, item in pages_data:
        slug = item.get("slug")
        if not slug:
            continue
        pages_index.append({
            "id": item.get("id"),
            "slug": slug,
            "title": item.get("title") or "",
            "group": group,
        })
        write(f"pages/{slug}.json", {
            "id": item.get("id"),
            "slug": slug,
            "title": item.get("title") or "",
            "group": group,
            "html": rewrite_html(item.get("content_html") or ""),
        })
    write("pages.json", pages_index)
    return pages_index


def main():
    os.makedirs(OUT, exist_ok=True)

    products = load_all_products()
    flat_cats = read("categories.json")["flat_categories"]
    raw_posts = load_all_posts()
    pages_data = load_all_pages()

    errors, warnings = validate_data(products, flat_cats, raw_posts)
    if warnings:
        print(f"validation warnings: {len(warnings)} (first 3: {warnings[:3]})")
    if errors:
        for err in errors[:10]:
            print(f"ERROR: {err}")
        raise SystemExit(f"Validation failed with {len(errors)} error(s).")

    prod_slugs = {p["slug"] for p in products}
    cat_slugs = {c["slug"] for c in flat_cats}
    post_slugs = {p["slug"] for p in raw_posts}
    page_slugs = {item["slug"] for _, item in pages_data if item.get("slug")}
    rewrite_html, link_stats = make_link_rewriter(prod_slugs, cat_slugs, post_slugs, page_slugs)

    listing = []
    for p in products:
        listing.append({
            "id": p["id"],
            "slug": p["slug"],
            "name": p["name"],
            "brand": p.get("brand") or "",
            "cats": p["category_path"],
            "catIds": p["category_ids"],
            "price": p["price"].get("current") or 0,
            "regular": p["price"].get("regular") or 0,
            "priceText": p["price"].get("display_text") or "Liên hệ",
            "stock": p["stock_status"],
            "badges": p.get("badges") or [],
            "img": p["images"][0]["url"] if p["images"] else "",
            "imgs": [i["url"] for i in p["images"]],
            "url": p["url"],
        })
    write("products.json", listing)

    for p in products:
        write("products/%s.json" % p["slug"], {
            "id": p["id"],
            "slug": p["slug"],
            "name": p["name"],
            "brand": p.get("brand") or "",
            "sku": p.get("sku"),
            "cats": p["category_path"],
            "catIds": p["category_ids"],
            "price": p["price"].get("current") or 0,
            "regular": p["price"].get("regular") or 0,
            "priceText": p["price"].get("display_text") or "Liên hệ",
            "stock": p["stock_status"],
            "imgs": [i["url"] for i in p["images"]],
            "variants": p.get("variants") or [],
            "specs": p.get("specifications") or {},
            "warranty": p.get("warranty") or "",
            "html": rewrite_html(p.get("description_html") or ""),
            "url": p["url"],
        })

    cats = build_categories(flat_cats, products)
    write("categories.json", cats)

    posts = []
    for full in raw_posts:
        posts.append({
            "id": full["id"],
            "slug": full["slug"],
            "title": full["title"],
            "date": (full.get("published_at") or "")[:10],
            "excerpt": full.get("excerpt") or "",
            "img": full.get("featured_image") or "",
            "url": full["url"],
        })
    posts.sort(key=lambda x: x["date"], reverse=True)
    write("posts.json", posts)

    for full in raw_posts:
        write("posts/%s.json" % full["slug"], {
            "slug": full["slug"],
            "title": full["title"],
            "date": (full.get("published_at") or "")[:10],
            "excerpt": full.get("excerpt") or "",
            "img": full.get("featured_image") or "",
            "html": rewrite_html(full.get("content_html") or ""),
            "imgs": full.get("images") or [],
        })

    pages = export_pages(pages_data, rewrite_html)

    for f in ("site.json", "navigation.json", "homepage.json", "contact.json", "brands.json"):
        write(f, read(f))

    print(
        f"products: {len(listing)}, categories: {len(cats)}, "
        f"posts: {len(posts)}, pages: {len(pages)}, "
        f"internal_links_rewritten: {link_stats['rewritten']}"
    )
    print("out: %s" % OUT)


if __name__ == "__main__":
    main()
