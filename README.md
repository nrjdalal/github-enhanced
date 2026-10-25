# GitHub Enhanced

Flash-free tweaks for github.com, as a browser extension. Every tweak lands as the page parses, before its first paint, so nothing flashes or shifts.

## Tweaks

### Dashboard sidebar

Home and Feed side by side, then two sections above "Top repositories": All Repositories, your own links with their user's or org's avatar, and Pull Requests, linking to your chosen repos' pull requests. Your avatar links to your profile.

<img src="assets/dashboard.png" alt="Dashboard sidebar with Home and Feed side by side, two links under All Repositories and three repos under Pull Requests" width="330">

### Navbar

The GitHub mark becomes a home button styled like the menu button.

<img src="assets/navbar.png" alt="Navbar with the menu button and a home button side by side" width="440">

### Repo tabs

Code, Actions, Issues and Pull requests stay in the bar; the rest move under More at every width.

![Repo tab bar with Code, Actions, Issues and Pull requests, and More on the right](assets/repo-tabs.png)

### Pull requests page

The "All pull requests" heading becomes three icon tabs with GitHub-style tooltips: Pull requests, Authored by me (your open pull requests) and Merged by me (your pull requests that were merged). Merged by me also joins the page's sidebar under Authored by me. They read your username from the page, so they show only when you are signed in. A repo's pull request lists open sorted by last update, so a pull request with a new comment or push comes first; a search that names its own `sort:` keeps it.

<img src="assets/pull-requests.png" alt="Pull requests page with three icon tabs, the Merged by me tooltip, and Merged by me in the sidebar" width="660">

## Install

1. Clone or download this repo.
2. Open `chrome://extensions`, turn on **Developer mode** and click **Load unpacked**.
3. Pick the repo's folder.

It works in Chrome and other Chromium browsers, such as Helium, Arc, Brave and Edge.

## Settings

Click the extension's toolbar button, or its **Options**, to edit its config, one JSON object; `//` comments are allowed and kept. An empty config starts with commented-out examples. Open github.com tabs update as soon as you save.

<img src="assets/settings.png" alt="Settings with the config as JSON: bookmarks and links" width="512">

```json
{
  "bookmarks": {
    "nrjdalal/zerostarter": "ZeroStarter"
  },
  "links": {
    "https://github.com/octocat?tab=repositories": "Octocat"
  }
}
```

- `bookmarks` maps `owner/repo` to the name shown under Pull Requests, in order; each links to the repo's pull requests.
- `links` maps a URL to its label under All Repositories, shown with the avatar of the user or org the URL points to (`github.com/<user>` or `github.com/orgs/<org>`).

The config syncs through your browser profile. Avatars are kept in github.com's localStorage and refreshed after each dashboard load, so from the second visit on they paint with the page.

## Updates

With **Developer mode** on, the extension reloads itself once its folder changes, so `git pull` is all an update takes; the next github.com page load picks it up.

## License

MIT
