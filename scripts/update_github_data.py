#!/usr/bin/env python3
"""Discover DevelopersCoffee's public GitHub repos + latest releases and
write normalized JSON the static site can fetch client-side.

No auth required: GitHub's org-repos and releases endpoints serve public
data unauthenticated (rate-limited to 60 req/hour/IP, which is enough for
a weekly cron run over a couple dozen repos). Defense-in-depth: every repo
is checked for private == False before it's written anywhere, even though
the API call is already filtered to type=public.
"""
import datetime
import json
import os
import sys
import urllib.error
import urllib.request

ORG = os.environ.get("GITHUB_ORG", "DevelopersCoffee")
API = "https://api.github.com"
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
REPOS_FILE = os.path.join(DATA_DIR, "github-repositories.json")
WEEKLY_FILE = os.path.join(DATA_DIR, "github-weekly.json")
WEEK_SECONDS = 7 * 24 * 60 * 60


def api_get(path):
    url = f"{API}{path}"
    req = urllib.request.Request(url, headers={
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "developerscoffee-github-io-weekly-digest",
    })
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read())


def list_public_repos():
    repos = []
    page = 1
    while True:
        batch = api_get(f"/orgs/{ORG}/repos?type=public&per_page=100&sort=pushed&direction=desc&page={page}")
        if not batch:
            break
        repos.extend(batch)
        if len(batch) < 100:
            break
        page += 1
    return repos


def latest_release(full_name):
    try:
        r = api_get(f"/repos/{full_name}/releases/latest")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise
    return {
        "tag": r.get("tag_name"),
        "name": r.get("name") or r.get("tag_name"),
        "url": r.get("html_url"),
        "publishedAt": r.get("published_at"),
        "prerelease": r.get("prerelease", False),
        "body": (r.get("body") or "")[:500],
    }


def normalize(repo):
    if repo.get("private") or repo.get("visibility") not in (None, "public"):
        return None
    release = None
    try:
        release = latest_release(repo["full_name"])
    except Exception as e:
        print(f"  ! release fetch failed for {repo['full_name']}: {e}", file=sys.stderr)
    return {
        "name": repo["name"],
        "fullName": repo["full_name"],
        "description": repo.get("description"),
        "url": repo["html_url"],
        "homepage": repo.get("homepage") or None,
        "language": repo.get("language"),
        "topics": repo.get("topics", []),
        "stars": repo.get("stargazers_count", 0),
        "forks": repo.get("forks_count", 0),
        "openIssues": repo.get("open_issues_count", 0),
        "defaultBranch": repo.get("default_branch"),
        "createdAt": repo.get("created_at"),
        "updatedAt": repo.get("updated_at"),
        "pushedAt": repo.get("pushed_at"),
        "archived": repo.get("archived", False),
        "latestRelease": release,
    }


def parse_iso(ts):
    if not ts:
        return None
    return datetime.datetime.strptime(ts, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=datetime.timezone.utc)


def build_weekly(repositories, now):
    cutoff = now - datetime.timedelta(seconds=WEEK_SECONDS)
    updated = []
    released = []
    for r in repositories:
        if r["archived"]:
            continue
        pushed = parse_iso(r["pushedAt"])
        if pushed and pushed >= cutoff:
            updated.append({
                "name": r["name"],
                "url": r["url"],
                "description": r["description"],
                "pushedAt": r["pushedAt"],
            })
        rel = r["latestRelease"]
        if rel:
            published = parse_iso(rel["publishedAt"])
            if published and published >= cutoff:
                released.append({
                    "name": r["name"],
                    "url": rel["url"],
                    "tag": rel["tag"],
                    "releaseName": rel["name"],
                    "publishedAt": rel["publishedAt"],
                })
    updated.sort(key=lambda x: x["pushedAt"], reverse=True)
    released.sort(key=lambda x: x["publishedAt"], reverse=True)
    return {
        "generatedAt": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "weekStart": cutoff.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "organization": ORG,
        "updatedRepos": updated,
        "newReleases": released,
    }


def load_existing(path):
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)


def strip_volatile(data, keys):
    """Drop keys that always change (timestamps) so we can compare content."""
    if isinstance(data, dict):
        return {k: strip_volatile(v, keys) for k, v in data.items() if k not in keys}
    if isinstance(data, list):
        return [strip_volatile(v, keys) for v in data]
    return data


def write_if_changed(path, new_data):
    existing = load_existing(path)
    if existing is not None:
        if strip_volatile(existing, {"generatedAt"}) == strip_volatile(new_data, {"generatedAt"}):
            print(f"no content change, skipping write: {path}")
            return False
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(new_data, f, indent=2)
        f.write("\n")
    print(f"wrote {path}")
    return True


def main():
    now = datetime.datetime.now(datetime.timezone.utc)
    print(f"Discovering public repos for org={ORG}...")
    raw_repos = list_public_repos()
    print(f"Found {len(raw_repos)} public repos")

    repositories = []
    for repo in raw_repos:
        norm = normalize(repo)
        if norm is None:
            continue
        repositories.append(norm)
        print(f"  - {norm['fullName']} (release: {norm['latestRelease']['tag'] if norm['latestRelease'] else 'none'})")

    repos_payload = {
        "generatedAt": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "organization": ORG,
        "repositories": repositories,
    }
    weekly_payload = build_weekly(repositories, now)

    changed_repos = write_if_changed(REPOS_FILE, repos_payload)
    changed_weekly = write_if_changed(WEEKLY_FILE, weekly_payload)

    if not (changed_repos or changed_weekly):
        print("Nothing changed.")


if __name__ == "__main__":
    main()
