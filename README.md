# github-enhanced

Small, flash-free tweaks to github.com, run through the [User JavaScript and CSS](https://chromewebstore.google.com/detail/user-javascript-and-css/nbhcbdghjpllgmfilhnhkllmkecfmpld) browser extension.

- **Dashboard sidebar:** Home and Feed side by side, your own links under them, and a Bookmarks section above "Top repositories".
- **Navbar:** the GitHub mark becomes a home button styled like the menu button.
- **Repo tabs:** Code, Actions, Issues and Pull requests stay in the bar; the rest move under More at every width.
- **Pull requests page:** the "All pull requests" heading becomes three icon tabs, Pull requests, Authored by me and Merged by me, with GitHub-style tooltips, and Merged by me joins the page's sidebar under Authored by me. They read your username from the page, so they show only when you are signed in.

Everything changes as the page parses, before its first paint, so nothing flashes or shifts.

## Install

1. Install [User JavaScript and CSS](https://chromewebstore.google.com/detail/user-javascript-and-css/nbhcbdghjpllgmfilhnhkllmkecfmpld) and turn on **Allow user scripts** on its Details page.
2. Copy `config.example.js` to `config.js` and set your own links.
3. Create the two rules:

| File         | Rule            | Setup                                                                           |
| ------------ | --------------- | ------------------------------------------------------------------------------- |
| `config.js`  | `github-config` | JS, shared rule, no URL patterns                                                |
| `github.js`  | `github`        | JS, URL `https://github.com/*`, depends on `github-config`, **Run at start** on |
| `github.css` | `github`        | CSS of the same rule                                                            |

**Run at start** lets the script work while the page parses; without it, the changes land after the first paint.

## Config

`config.js` stays on your machine (it is git-ignored):

- `githubBookmarks` maps `owner/repo` to the name shown in Bookmarks, in order.
- `githubNav` maps a URL to a row under Home and Feed as `[label, icon]`, the icon `book` or `book-locked`.

Bookmark avatars are kept in localStorage (`ujc-avatars`) and refreshed after each load, so from the second visit on they paint with the page.

## As an unpacked extension

The same folder loads as an unpacked Chrome extension through `manifest.json`, once `config.js` exists. Branded Chrome ignores `--load-extension`, so launch it with `--enable-unsafe-extension-debugging` and send the CDP command `Extensions.loadUnpacked` with the folder's path.

## License

MIT
