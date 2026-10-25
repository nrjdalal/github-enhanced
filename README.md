# GitHub Enhanced

Flash-free tweaks for github.com, as a browser extension. Every tweak lands as the page parses, before its first paint, so nothing flashes or shifts.

## Tweaks

### Dashboard sidebar

Home and Feed side by side, then two sections above "Top repositories": Pull Requests, linking to your chosen repos' pull requests, and All Repositories, linking to your chosen users' and orgs' repositories. Your avatar links to your profile.

<img src="assets/dashboard.png" alt="Dashboard sidebar with Home and Feed side by side, three repos under Pull Requests and a user and an org under All Repositories" width="330">

### Navbar

The GitHub mark becomes a home button styled like the menu button.

<img src="assets/navbar.png" alt="Navbar with the menu button and a home button side by side" width="440">

### Repo tabs

Code, Actions, Issues and Pull requests stay in the bar; the rest move under More at every width.

![Repo tab bar with Code, Actions, Issues and Pull requests, and More on the right](assets/repo-tabs.png)

### Pull requests page

The "All pull requests" heading becomes three icon tabs with GitHub-style tooltips: Pull requests, Authored by me (your open pull requests) and Merged by me (your pull requests that were merged). Merged by me also joins the page's sidebar under Authored by me. They read your username from the page, so they show only when you are signed in. A repo's pull request lists open sorted by last update, so a pull request with a new comment or push comes first; a search that names its own `sort:` keeps it.

<img src="assets/pull-requests.png" alt="Pull requests page with three icon tabs, the Merged by me tooltip, and Merged by me in the sidebar" width="660">

### Pull request sidebar

A box with nothing in it shows only its title: "No reviews", "No one assigned", "None yet" and "No milestone" are hidden, and so is Development's "Successfully merging this pull request may close these issues." while no issue is linked. Its gear still opens the box to fill it.

<img src="assets/pr-sidebar.png" alt="A pull request's sidebar before, with an empty line under Reviewers, Assignees, Labels, Projects and Milestone, and after, with only their titles" width="680">

### Squash and merge title

Squash and merge fills its commit title with the pull request's title and number, as GitHub already does for a pull request of two or more commits; for one commit, GitHub would use that commit's message. Edit it before you confirm and your edit stays.

<img src="assets/squash-title.png" alt="Squash and merge form with the commit message set to the pull request title and number" width="560">

## Install

1. Clone or download this repo.
2. Open `chrome://extensions`, turn on **Developer mode** and click **Load unpacked**.
3. Pick the repo's folder.

It works in Chrome and other Chromium browsers, such as Helium, Arc, Brave and Edge.

## Settings

Click the extension's toolbar button, or its **Options**, to edit its config, one JSON object; `//` comments are allowed and kept. An empty config starts with commented-out examples. Open github.com tabs update as soon as you save.

<img src="assets/settings.png" alt="Settings with the config as JSON: pullRequests and allRepositories" width="512">

```json
{
  "pullRequests": ["nrjdalal/zerostarter"],
  "allRepositories": ["octocat"]
}
```

- `pullRequests` lists `owner/repo`, in order; each shows as the repo's name and links to its pull requests.
- `allRepositories` lists users and orgs, in order; each links to its repositories. Whether a name is an org is learned once, from whether its `github.com/orgs/<name>` page exists, and kept in github.com's localStorage.

The config syncs through your browser profile. Avatars are kept in github.com's localStorage and refreshed after each dashboard load, so from the second visit on they paint with the page.

## Updates

With **Developer mode** on, the extension reloads itself once its folder changes, so `git pull` is all an update takes; the next github.com page load picks it up.

## License

MIT
