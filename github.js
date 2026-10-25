// Puts Home and Feed side by side, links the account avatar to its profile and adds Pull Requests (each repo set in the extension popup, linking to its pull requests) and All Repositories (each user or org set there, linking to its repositories, an org found by whether its /orgs page exists) above the dashboard's "Top repositories", in static markup with avatars kept in localStorage, so they render at first paint, swaps a repo's "All pull requests" heading for Pull requests, Authored by me and Merged by me icon tabs, adding Merged by me to its sidebar too, and opens a repo's pull request lists sorted by last update unless the search names a sort.
;(() => {
  const sortedUrl = (href) => {
    const url = new URL(href, location.href)
    const [, owner, repo, page, login, extra] = url.pathname.split("/")
    if (url.origin !== location.origin || !repo || page !== "pulls" || extra !== undefined || (login && url.searchParams.has("q"))) return null
    const q = url.searchParams.get("q") ?? (login ? `is:pr state:open author:${login}` : "is:pr is:open")
    if (/(^|\s)sort:/.test(q)) return null
    url.pathname = `/${owner}/${repo}/pulls`
    url.searchParams.set("q", `${q} sort:updated-desc`)
    return url.href
  }
  const start = sortedUrl(location.href)
  if (start) return location.replace(start)
  addEventListener(
    "click",
    (event) => {
      const a = event.target.closest?.("a[href]")
      const url = a && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && a.target !== "_blank" && sortedUrl(a.href)
      if (!url) return
      event.preventDefault()
      event.stopImmediatePropagation()
      location.assign(url)
    },
    true,
  )
  const ICONS = {
    "git-merge": '<path d="M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm8.5-4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM5 3.25a.75.75 0 1 0 0 .005V3.25Z"/>',
    inbox: '<path d="M2.8 2.06A1.75 1.75 0 0 1 4.41 1h7.18c.7 0 1.333.417 1.61 1.06l2.74 6.395c.04.093.06.194.06.295v4.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25v-4.5c0-.101.02-.202.06-.295Zm1.61.44a.25.25 0 0 0-.23.152L1.887 8H4.75a.75.75 0 0 1 .6.3L6.625 10h2.75l1.275-1.7a.75.75 0 0 1 .6-.3h2.863L11.82 2.652a.25.25 0 0 0-.23-.152Zm10.09 7h-2.875l-1.275 1.7a.75.75 0 0 1-.6.3h-3.5a.75.75 0 0 1-.6-.3L4.375 9.5H1.5v3.75c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25Z"/>',
    smiley: '<path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm3.82 1.636a.75.75 0 0 1 1.038.175l.007.009c.103.118.22.222.35.31.264.178.683.37 1.285.37.602 0 1.02-.192 1.285-.371.13-.088.247-.192.35-.31l.007-.008a.75.75 0 0 1 1.222.87l-.022-.015c.02.013.021.015.021.015v.001l-.001.002-.002.003-.005.007-.014.019a2.066 2.066 0 0 1-.184.213c-.16.166-.338.316-.53.445-.63.418-1.37.638-2.127.629-.946 0-1.652-.308-2.126-.63a3.331 3.331 0 0 1-.715-.657l-.014-.02-.005-.006-.002-.003v-.002h-.001l.613-.432-.614.43a.75.75 0 0 1 .183-1.044ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM5 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm5.25 2.25.592.416a97.71 97.71 0 0 0-.592-.416Z"/>',
  }
  const AVATARS = "ujc-avatars"
  const avatarUrl = (owner) => `https://github.com/${owner}.png?size=32`
  const avatars = JSON.parse(localStorage.getItem(AVATARS) ?? "{}")
  const ORGS = "ujc-orgs"
  const orgs = JSON.parse(localStorage.getItem(ORGS) ?? "{}")
  const avatar = (owner) => {
    const img = document.createElement("img")
    img.src = avatars[owner] ?? avatarUrl(owner)
    img.alt = ""
    return img
  }
  const CONFIG = "github-enhanced-config"
  let config = JSON.parse(localStorage.getItem(CONFIG) ?? "{}")
  const hydrated = (el) => Object.keys(el).some((key) => key.startsWith("__reactFiber$"))

  const sections = () => {
    for (const partial of document.querySelectorAll("react-partial[partial-name='dashboard-repositories']")) {
      if (partial.previousElementSibling?.hasAttribute("data-ujc-sections")) continue
      const pulls = (config.pullRequests ?? []).map((repo) => [`/${repo}/pulls`, repo.split("/")[1], repo.split("/")[0]])
      const all = (config.allRepositories ?? []).map((owner) => [orgs[owner] ? `/orgs/${owner}/repositories` : `/${owner}?tab=repositories`, owner, owner])
      for (const [title, rows] of [["Pull Requests", pulls], ["All Repositories", all]]) {
        if (!rows.length) continue
        const box = document.createElement("div")
        box.setAttribute("data-ujc-sections", "")
        const head = document.createElement("h2")
        head.textContent = title
        const list = document.createElement("ul")
        for (const [href, text, owner] of rows) {
          const li = document.createElement("li")
          const a = document.createElement("a")
          a.href = href
          const label = document.createElement("span")
          label.textContent = text
          a.append(avatar(owner), label)
          li.append(a)
          list.append(li)
        }
        box.append(head, list)
        partial.before(box)
      }
    }
  }

  const terms = (q) => (q ?? "").trim().split(/\s+/).filter((term) => term && !term.startsWith("sort:")).sort().join(" ")
  const DEFAULT_PR_QUERIES = ["", terms("is:pr state:open"), terms("is:pr is:open")]

  const ctx = document.createElement("canvas").getContext("2d")
  const alignTip = ({ currentTarget: a }) => {
    ctx.font = getComputedStyle(a, "::after").font
    const half = (ctx.measureText(a.getAttribute("aria-label")).width + 16) / 2
    const { left, width } = a.getBoundingClientRect()
    const mid = left + width / 2
    a.dataset.tip = mid - half < a.parentElement.getBoundingClientRect().left ? "start" : mid + half > innerWidth - 8 ? "end" : "center"
  }

  let pending = false
  const overlay = (node, top, left) => {
    if (node.parentElement !== document.body) document.body.append(node)
    node.style.cssText = `position: absolute; top: ${top + scrollY}px; left: ${left + scrollX}px; margin: 0`
    pending = true
  }

  let merged
  const prSidebar = (authoredHref, authoredActive, [label, icon, href, active]) => {
    const authored = document.querySelector(`aside a[href='${authoredHref}']`)?.closest("li")
    if (!authored) return
    if (!merged) {
      merged = authored.cloneNode(true)
      merged.setAttribute("data-ujc-merged", "")
      const a = merged.querySelector("a")
      merged.querySelector(`[id='${a.getAttribute("aria-labelledby")}']`)?.removeAttribute("id")
      a.removeAttribute("id")
      a.removeAttribute("aria-labelledby")
      a.href = href
      const svg = merged.querySelector("svg")
      svg.setAttribute("class", `octicon octicon-${icon}`)
      svg.innerHTML = ICONS[icon]
      const walker = document.createTreeWalker(merged, NodeFilter.SHOW_TEXT)
      while (walker.nextNode()) if (walker.currentNode.nodeValue.trim() === "Authored by me") walker.currentNode.nodeValue = label
    }
    if (hydrated(authored)) {
      if (authored.nextElementSibling !== merged) {
        merged.style.cssText = ""
        authored.after(merged)
      }
    } else {
      const { bottom, left, width } = authored.getBoundingClientRect()
      overlay(merged, bottom, left)
      merged.style.width = `${width}px`
      merged.style.listStyle = "none"
      document.documentElement.style.setProperty("--ujc-merged-row", `${authored.offsetHeight}px`)
    }
    merged.querySelector("a").setAttribute("aria-current", active ? "page" : "false")
    for (const [li, on] of [[authored, authoredActive], [merged, active]]) {
      if (on) {
        li.setAttribute("data-active", "true")
        li.setAttribute("data-ujc-active", "")
      } else if (li.hasAttribute("data-ujc-active")) {
        li.removeAttribute("data-active")
        li.removeAttribute("data-ujc-active")
      }
    }
  }

  let nav
  const prTabs = () => {
    const [, owner, repo, page, rest] = location.pathname.split("/")
    const login = document.querySelector("meta[name='user-login']")?.content
    const title = page === "pulls" && login && (!rest || rest === login) && document.querySelector("h1[data-testid='header-title']")
    if (!title) return
    const pulls = `/${owner}/${repo}/pulls`
    const q = terms(new URLSearchParams(location.search).get("q"))
    const tabs = [
      ["Pull requests", "inbox", pulls, !rest && DEFAULT_PR_QUERIES.includes(q)],
      ["Authored by me", "smiley", `${pulls}/${login}`, rest === login || q === terms(`is:pr state:open author:${login}`)],
      ["Merged by me", "git-merge", `${pulls}?q=${encodeURIComponent(`is:pr state:merged author:${login}`)}`, !rest && q === terms(`is:pr state:merged author:${login}`)],
    ]
    prSidebar(`${pulls}/${login}`, tabs[1][3], tabs[2])
    if (!nav) {
      nav = document.createElement("nav")
      nav.setAttribute("data-ujc-pr-tabs", "")
      nav.setAttribute("aria-label", "Pull request filters")
      for (const [label, icon, href] of tabs) {
        const a = document.createElement("a")
        a.href = href
        a.setAttribute("aria-label", label)
        a.addEventListener("pointerenter", alignTip)
        a.addEventListener("focus", alignTip)
        a.innerHTML = `<svg class="octicon octicon-${icon}" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">${ICONS[icon]}</svg>`
        nav.append(a)
      }
    }
    if (hydrated(title)) {
      if (title.previousElementSibling !== nav) {
        nav.style.cssText = ""
        title.before(nav)
      }
    } else {
      const { top, left, height } = title.getBoundingClientRect()
      overlay(nav, top + (height - 32) / 2, left)
    }
    tabs.forEach(([, , , active], i) => {
      if (active) nav.children[i].setAttribute("aria-current", "page")
      else nav.children[i].removeAttribute("aria-current")
    })
  }

  const linkAvatar = () => {
    for (const img of document.querySelectorAll("img.avatar")) {
      if (img.closest("a") || !img.parentElement.querySelector("select-panel[id^='switch_dashboard_context']")) continue
      const a = document.createElement("a")
      a.setAttribute("data-ujc-avatar", "")
      a.href = `/${img.alt.replace(/^@/, "")}`
      img.before(a)
      a.append(img)
    }
  }

  const apply = () => {
    if (location.pathname === "/") {
      linkAvatar()
      sections()
    }
    pending = false
    prTabs()
    document.documentElement.toggleAttribute("data-ujc-pending", pending)
    if (pending) schedule()
  }

  let queued = false
  const schedule = () => {
    if (queued) return
    queued = true
    requestAnimationFrame(() => {
      queued = false
      apply()
    })
  }

  const toDataUrl = (src) =>
    new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = canvas.height = 32
        canvas.getContext("2d").drawImage(img, 0, 0, 32, 32)
        resolve(canvas.toDataURL())
      }
      img.onerror = () => resolve(null)
      img.src = src
    })

  const cacheAvatars = async () => {
    const next = {}
    const owners = [...(config.pullRequests ?? []).map((repo) => repo.split("/")[0]), ...(config.allRepositories ?? [])]
    for (const owner of new Set(owners.filter(Boolean))) {
      const url = (await toDataUrl(avatarUrl(owner))) ?? avatars[owner]
      if (url) next[owner] = url
    }
    localStorage.setItem(AVATARS, JSON.stringify(next))
    const unknown = (config.allRepositories ?? []).filter((owner) => !(owner in orgs))
    for (const owner of unknown) {
      const org = await fetch(`/orgs/${owner}/repositories`, { method: "HEAD" }).then((res) => res.ok, () => undefined)
      if (org !== undefined) orgs[owner] = org
    }
    if (!unknown.some((owner) => orgs[owner])) return
    localStorage.setItem(ORGS, JSON.stringify(orgs))
    for (const node of document.querySelectorAll("[data-ujc-sections]")) node.remove()
    schedule()
  }

  if (location.pathname === "/") addEventListener("load", () => requestIdleCallback(cacheAvatars))
  document.addEventListener("github-enhanced:config", () => {
    config = JSON.parse(localStorage.getItem(CONFIG) ?? "{}")
    for (const node of document.querySelectorAll("[data-ujc-sections]")) node.remove()
    schedule()
  })
  apply()
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true })
})()
