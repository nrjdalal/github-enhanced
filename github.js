// Keeps a repo's tabs listed in repository.tabs in the bar, in that order, moving the rest under More; puts Home and Feed side by side, links the account avatar to its profile and adds Pull Requests (each repo in sidebar.pullRequests, linking to its pull requests) and All Repositories (each user or org in sidebar.allRepositories, linking to its repositories, an org found by whether its /orgs page exists) above "Top repositories" on the dashboard and in the ☰ menu, in static markup with avatars kept in localStorage, so they render at first paint, shows the Copilot box, Pull requests and Issues, Top repositories and the changelog from the last visit until GitHub's own load, then animates rows that moved, came or went under a blue progress line, swaps a repo's "All pull requests" heading for Pull requests, Authored by me and Merged by me icon tabs, adding Merged by me to its sidebar too, opens a repo's pull request lists sorted by last update unless the search names a sort, hides the recent pushes banner for a base branch such as main, staging or canary, shows every relative time as its date and time, shows a commit or pull request title's Conventional Commits type as a colored label and its scope, or a leading ticket key, as an outline in commit lists, pull request lists and on a pull request, and on a pull request hides each sidebar box's "None yet" style line, keeping its title, fills Squash and merge's commit title with the pull request's title and number, indents a text box's line or selected lines on Tab and outdents them on Shift+Tab until Esc, folds or opens a changed file when its header bar is clicked anywhere but a button or link, and gives every file between the last Viewed click and a shift-clicked Viewed the same mark.
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
  document.addEventListener("click", (event) => {
    const path = event.composedPath().filter((node) => node instanceof Element)
    const header = path.find((node) => node.matches("[class*='diff-file-header']"))
    if (!header || event.button !== 0 || path.some((node) => node.matches("a, button, input, label, select, summary, textarea, [role='button'], [role='checkbox']")) || getSelection().toString()) return
    const label = (button) => (button.getAttribute("aria-label") ?? document.getElementById(button.getAttribute("aria-labelledby"))?.textContent ?? "").trim()
    ;[...header.querySelectorAll("button")].find((button) => /^(Collapse|Expand) file$/.test(label(button)))?.click()
  })
  const escaped = new WeakSet()
  document.addEventListener(
    "keydown",
    (event) => {
      const box = event.target
      if (!(box instanceof HTMLTextAreaElement)) return
      if (event.key === "Escape") return escaped.add(box)
      if (event.key !== "Tab" || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || escaped.has(box) || box.getAttribute("aria-expanded") === "true") return
      event.preventDefault()
      const { selectionStart, selectionEnd, value } = box
      const start = value.lastIndexOf("\n", selectionStart - 1) + 1
      const newline = value.indexOf("\n", selectionEnd - (selectionEnd > selectionStart && value[selectionEnd - 1] === "\n" ? 1 : 0))
      const end = newline < 0 ? value.length : newline
      const lines = value.slice(start, end).split("\n")
      const changed = lines.map((line) => (event.shiftKey ? line.replace(/^ {1,2}/, "") : `  ${line}`))
      const first = changed[0].length - lines[0].length
      const total = changed.join("\n").length - (end - start)
      if (!total) return
      box.setSelectionRange(start, end)
      document.execCommand("insertText", false, changed.join("\n"))
      box.setSelectionRange(selectionStart === start && selectionEnd > selectionStart ? start : Math.max(start, selectionStart + first), Math.max(start, selectionEnd + total))
    },
    true,
  )
  document.addEventListener("input", (event) => escaped.delete(event.target), true)
  document.addEventListener("focusout", (event) => escaped.delete(event.target), true)

  const VIEWED = "[class*='diff-file-header'] button:is([aria-label='Viewed'], [aria-label='Not Viewed'])"
  let lastViewed = -1
  document.addEventListener(
    "click",
    (event) => {
      const button = event.composedPath().find((node) => node instanceof Element && node.matches(VIEWED))
      if (!button) return
      const buttons = [...document.querySelectorAll(VIEWED)]
      const index = buttons.indexOf(button)
      if (event.shiftKey && lastViewed >= 0 && lastViewed !== index) {
        getSelection().removeAllRanges()
        const viewed = button.getAttribute("aria-pressed") !== "true"
        const range = buttons.slice(Math.min(lastViewed, index), Math.max(lastViewed, index) + 1)
        for (const other of range) if (other !== button && (other.getAttribute("aria-pressed") === "true") !== viewed) other.click()
      }
      lastViewed = index
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
  const entries = (list) => (list ?? []).flatMap((item) => (typeof item === "string" ? [[item]] : Object.entries(item ?? {})))
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
  const repoTabs = () => {
    document.getElementById("ujc-repo-tabs")?.remove()
    const tabs = config.repository?.tabs ?? []
    if (!tabs.length) return
    const nav = 'nav[aria-label="Repository"]'
    const style = document.createElement("style")
    style.id = "ujc-repo-tabs"
    style.textContent = [
      `${nav}[data-overflow-mode="wrap"] { --UnderlineNav_moreButton-display: flex; }`,
      `${nav} > ul > li:has(> a[data-tab-item]) { order: ${tabs.length + 2}; }`,
      ...tabs.map((tab, i) => `${nav} > ul > li:has(> a[data-tab-item="${CSS.escape(tab)}"]) { order: ${i + 1}; }`),
      `${nav} > ul::after { content: ""; order: ${tabs.length + 1}; flex-basis: 100%; }`,
    ].join("\n")
    document.documentElement.append(style)
  }
  repoTabs()
  const hydrated = (el) => Object.keys(el).some((key) => key.startsWith("__reactFiber$"))

  const sidebarRows = () => [
    ["Pull Requests", entries(config.sidebar?.pullRequests).map(([repo, label]) => [`/${repo}/pulls`, label ?? repo.split("/")[1], repo.split("/")[0]])],
    ["All Repositories", entries(config.sidebar?.allRepositories).map(([owner, label]) => [orgs[owner] ? `/orgs/${owner}/repositories` : `/${owner}?tab=repositories`, label ?? owner, owner])],
  ].filter(([, rows]) => rows.length)

  const sections = () => {
    for (const partial of document.querySelectorAll("react-partial[partial-name='dashboard-repositories']")) {
      if (partial.previousElementSibling?.hasAttribute("data-ujc-sections")) continue
      for (const [title, rows] of sidebarRows()) {
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

  const drawerSections = () => {
    const heading = [...document.querySelectorAll("[role='dialog'] h3")].find((h3) => h3.firstElementChild?.textContent === "Top repositories")
    const top = heading?.closest("li[data-component='ActionList.Group']")
    const item = top?.querySelector("ul > li")
    if (!item || top.previousElementSibling?.hasAttribute("data-ujc-drawer")) return
    for (const [title, rows] of sidebarRows()) {
      const group = top.cloneNode(false)
      group.setAttribute("data-ujc-drawer", "")
      const head = top.firstElementChild.cloneNode(true)
      head.querySelector("h3").removeAttribute("id")
      head.querySelector("h3").replaceChildren(Object.assign(document.createElement("div"), { textContent: title }))
      const list = top.querySelector("ul").cloneNode(false)
      list.removeAttribute("aria-labelledby")
      for (const [href, text, owner] of rows) {
        const li = item.cloneNode(true)
        const a = li.querySelector("a")
        a.href = href
        for (const attr of ["id", "aria-labelledby", "data-discover"]) a.removeAttribute(attr)
        const label = li.querySelector("[data-component='ActionList.Item.Label']")
        label.removeAttribute("id")
        label.textContent = text
        const img = li.querySelector("img")
        if (img) img.src = avatars[owner] ?? avatarUrl(owner)
        list.append(li)
      }
      group.append(head, list)
      top.before(group)
    }
    const divider = top.previousElementSibling?.hasAttribute("data-ujc-drawer") && [...top.parentElement.children].find((li) => li.getAttribute("data-component") === "ActionList.Divider")
    if (divider) top.before(Object.assign(divider.cloneNode(true), { className: divider.className }))
    top.previousElementSibling?.setAttribute("data-ujc-drawer", "")
  }

  const SKELETON = "[class*='keleton'], [aria-busy='true']"
  const repoRows = (el) => [...el.querySelectorAll("li[data-component='ActionList.Item']")].filter((li) => li.querySelector(":scope > a[href]"))
  const reactRoot = (name) => document.querySelector(`react-partial[partial-name='${name}'] [data-target='react-partial.reactRoot']`)
  const CACHE = "ujc-dashboard-"
  const login = () => document.querySelector("meta[name='user-login']")?.content
  const cached = (key) => {
    try {
      const entry = JSON.parse(localStorage.getItem(CACHE + key))
      if (entry.login === login() && Date.now() - entry.savedAt < 7 * 864e5) return entry.html
    } catch {}
  }
  const REGIONS = [
    ["copilot", () => reactRoot("copilot-chat-input-partial"), (root) => root.querySelector("textarea") && (root.querySelector("[class*='menuButton']") || !cached("copilot")?.includes("menuButton"))],
    ["lists", () => reactRoot("dashboard-lists"), (root) => root.querySelector("li a[href]") && !root.querySelector(SKELETON)],
    ["repositories", () => reactRoot("dashboard-repositories"), (root) => repoRows(root).length],
    ["changelog", () => document.querySelector("aside.feed-right-column"), (root) => !root.querySelector("include-fragment") && root.querySelector(".dashboard-changelog a")],
  ]
  const saved = new Set()
  const rows = (el) => [...el.querySelectorAll("li")].filter((li) => !li.querySelector("li") && li.querySelector("a[href]"))
  const rowKey = (li) => li.querySelector("a[href]").getAttribute("href")
  const motion = { duration: 300, easing: "ease-out" }
  let bar
  const progress = (done) => {
    if (!bar && !done) {
      bar = document.createElement("div")
      bar.setAttribute("data-ujc-progress", "")
      document.documentElement.append(bar)
      bar.animate([{ width: "0%" }, { width: "80%" }], { duration: 1500, easing: "ease-out", fill: "forwards" })
    } else if (bar && done) {
      const line = bar
      bar = undefined
      line.animate([{ width: getComputedStyle(line).width, opacity: 1 }, { width: "100%", opacity: 1, offset: 0.6 }, { width: "100%", opacity: 0 }], { duration: 500, easing: "ease-out", fill: "forwards" }).finished.then(() => line.remove())
    }
  }
  const swap = (node, live) => {
    const cached = rows(node)
    const before = new Map(cached.map((li) => [rowKey(li), li.getBoundingClientRect().top]))
    live.removeAttribute("data-ujc-loading")
    live.style.removeProperty("width")
    const fresh = rows(live)
    const keys = new Set(fresh.map(rowKey))
    const leaving = cached.filter((li) => !keys.has(rowKey(li))).map((li) => [li, li.getBoundingClientRect()])
    node.remove()
    for (const li of fresh) {
      const from = before.get(rowKey(li))
      const top = li.getBoundingClientRect().top
      if (from === undefined) li.animate([{ opacity: 0 }, { opacity: 1 }], motion)
      else if (from !== top) li.animate([{ transform: `translateY(${from - top}px)` }, { transform: "none" }], motion)
    }
    for (const [li, rect] of leaving) {
      li.style.cssText = `position: absolute; top: ${rect.top + scrollY}px; left: ${rect.left + scrollX}px; width: ${rect.width}px; margin: 0; list-style: none; pointer-events: none`
      document.body.append(li)
      li.animate([{ opacity: 1 }, { opacity: 0 }], motion).finished.then(() => li.remove())
    }
    if (!document.querySelector("[data-ujc-cache]")) progress(true)
  }
  const dashboard = () => {
    for (const [key, find, ready] of REGIONS) {
      const root = find()
      if (!root) continue
      const live = root.closest("react-partial") ?? root
      const node = document.querySelector(`[data-ujc-cache='${key}']`)
      if (!ready(root)) {
        const html = cached(key)
        if (node || saved.has(key) || !html) continue
        const copy = document.createElement(live.tagName === "ASIDE" ? "aside" : "div")
        copy.className = live.className
        copy.setAttribute("data-ujc-cache", key)
        copy.innerHTML = html
        for (const el of copy.querySelectorAll("[id]")) el.removeAttribute("id")
        live.style.width = `${live.offsetWidth}px`
        live.after(copy)
        live.setAttribute("data-ujc-loading", "")
        document.documentElement.setAttribute("data-ujc-shown", "")
        progress(false)
        const fallback = () => setTimeout(() => copy.isConnected && swap(copy, live), 5000)
        if (document.readyState === "complete") fallback()
        else addEventListener("load", fallback, { once: true })
        continue
      }
      saved.add(key)
      if (node) swap(node, live)
    }
  }

  const snapshot = () => {
    if (location.pathname !== "/") return
    const user = login()
    for (const [key, find, ready] of REGIONS) {
      if (!user) {
        localStorage.removeItem(CACHE + key)
        continue
      }
      const root = find()
      if (!root || !ready(root) || document.querySelector(`[data-ujc-cache='${key}']`)) continue
      const copy = root.cloneNode(true)
      const shown = [...root.querySelectorAll("relative-time")].map((el) => el.shadowRoot?.textContent || el.textContent)
      copy.querySelectorAll("relative-time").forEach((el, i) => el.replaceWith(shown[i]))
      if (copy.innerHTML.length > 2e5) continue
      try {
        localStorage.setItem(CACHE + key, JSON.stringify({ login: user, savedAt: Date.now(), html: copy.innerHTML }))
      } catch {}
    }
  }
  addEventListener("pagehide", snapshot)
  addEventListener("visibilitychange", () => document.visibilityState === "hidden" && snapshot())

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

  const EMPTY = new Set(["No reviews", "No one—", "No one assigned", "None yet", "No milestone"])
  const hide = (node) => {
    if (node.nodeType === Node.ELEMENT_NODE) return node.setAttribute("data-ujc-empty", "")
    const span = document.createElement("span")
    span.setAttribute("data-ujc-empty", "")
    node.replaceWith(span)
    span.append(node)
  }
  const emptySidebar = () => {
    for (const item of document.querySelectorAll(".discussion-sidebar-item")) {
      const walker = document.createTreeWalker(item, NodeFilter.SHOW_TEXT)
      const found = []
      while (walker.nextNode()) {
        const node = walker.currentNode
        if (EMPTY.has(node.nodeValue.trim()) && !node.parentElement.closest("[data-ujc-empty], summary, details-menu, h3")) found.push(node)
      }
      for (const node of found) {
        const assign = node.nodeValue.trim() === "No one—" && node.nextElementSibling
        const line = node.parentElement.matches("p") && node.parentElement.textContent.trim() === node.nodeValue.trim()
        hide(line ? node.parentElement : node)
        if (assign?.matches?.(".js-issue-assign-self")) hide(assign)
        const merging = node.parentElement?.closest("form")?.querySelector(":scope > p")
        if (merging?.textContent.startsWith("Successfully merging")) hide(merging)
      }
    }
  }

  const titled = new WeakSet()
  const squashTitle = () => {
    const confirm = [...document.querySelectorAll("button")].find((button) => button.textContent.trim() === "Confirm squash and merge")
    const label = confirm && [...document.querySelectorAll("label")].find((label) => label.textContent.trim() === "Commit message")
    const input = label && document.getElementById(label.htmlFor)
    const [, title, number] = document.title.match(/^(.*) by \S+ · Pull Request #(\d+) · /) ?? []
    if (!input || !title || titled.has(input)) return
    titled.add(input)
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, `${title} (#${number})`)
    input.dispatchEvent(new Event("input", { bubbles: true }))
  }

  const TYPES = new Set(["build", "chore", "ci", "docs", "feat", "fix", "perf", "refactor", "revert", "style", "test"])
  const TYPE = /^(\w+)(?:\(([^)]+)\))?(!)?:\s+/
  const TICKET = /^()([A-Z][A-Z0-9]*-\d+)():\s+/
  const titleText = (title) => {
    const text = document.createTreeWalker(title, NodeFilter.SHOW_TEXT, { acceptNode: (node) => (node.parentElement.closest("[data-ujc-type]") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) }).nextNode()
    return [text, ...(text?.nodeValue.match(TYPE) ?? text?.nodeValue.match(TICKET) ?? [])]
  }
  const typeLabel = (title) => {
    const [text, prefix, type, scope, breaking] = titleText(title)
    const shown = title.querySelector("[data-ujc-type]")
    if (!prefix || (type && !TYPES.has(type)) || (shown && shown.getAttribute("data-ujc-type") !== type)) return
    text.nodeValue = text.nodeValue.slice(prefix.length)
    if (shown) return
    const labels = []
    if (type) {
      const label = document.createElement("span")
      label.setAttribute("data-ujc-type", type)
      label.textContent = type + (breaking ?? "")
      labels.push(label)
    }
    if (scope) {
      const outline = document.createElement("span")
      outline.setAttribute("data-ujc-type", "")
      outline.textContent = scope
      labels.push(outline)
    }
    title.prepend(...labels)
  }
  const TITLES = [
    "h4:has(a[href*='/commit/'], a[href*='/commits/'], a[href*='/changes/'])",
    "h3:has(> a[data-testid='listitem-title-link'][href*='/pull/'])",
    "h1 > .markdown-title",
  ].join(", ")
  const covers = new Map()
  let anchors = 0
  const commitTypes = () => {
    for (const [title, cover] of covers) {
      if (title.isConnected && !hydrated(title)) continue
      cover.remove()
      covers.delete(title)
      title.removeAttribute("data-ujc-covered")
      title.style.removeProperty("anchor-name")
      title.style.removeProperty("margin-inline-start")
    }
    for (const title of document.querySelectorAll(TITLES)) {
      if (title.hasAttribute("data-ujc-cover")) continue
      if (hydrated(title)) {
        typeLabel(title)
        continue
      }
      pending = true
      if (covers.has(title)) {
        fit(title, covers.get(title))
        continue
      }
      const cover = title.cloneNode(true)
      const anchor = `--ujc-cover-${++anchors}`
      const { font, color } = getComputedStyle(title)
      cover.setAttribute("data-ujc-cover", "")
      typeLabel(cover)
      title.style.setProperty("anchor-name", anchor)
      cover.style.cssText = `position: absolute; position-anchor: ${anchor}; position-visibility: always; top: anchor(top); left: anchor(left); width: anchor-size(width); margin: 0`
      Object.assign(cover.style, { font, color })
      document.body.append(cover)
      covers.set(title, cover)
      title.setAttribute("data-ujc-covered", "")
      fit(title, cover)
    }
  }
  const fit = (title, cover) => {
    const [text, prefix] = titleText(title)
    const labels = [...cover.querySelectorAll("[data-ujc-type]")]
    if (!prefix || !labels.length) return
    const range = document.createRange()
    range.setStart(text, 0)
    range.setEnd(text, prefix.length)
    const width = labels.reduce((sum, label) => sum + label.getBoundingClientRect().width + parseFloat(getComputedStyle(label).marginRight), 0)
    const shift = width - range.getBoundingClientRect().width
    title.style.setProperty("margin-inline-start", `${shift}px`)
    cover.style.setProperty("margin-inline-start", `${-shift}px`)
  }

  const BASES = /\/tree\/(canary|dev|develop|main|master|prod|production|staging)$/
  const recentPushes = () => {
    for (const flash of document.querySelectorAll("[data-component='Flash']:not([data-ujc-base]):has(a[href*='/compare/'])")) {
      if ([...flash.querySelectorAll("a[href*='/tree/']")].some((a) => BASES.test(a.getAttribute("href")))) flash.setAttribute("data-ujc-base", "")
    }
  }

  const DATE = { format: "datetime", weekday: "", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", prefix: "" }
  const absoluteDates = () => {
    for (const time of document.querySelectorAll("relative-time:is(:not([format]), [format='auto'], [format='relative'])")) {
      if (Date.now() - Date.parse(time.getAttribute("datetime")) < 1.5 * 864e5) continue
      for (const [name, value] of Object.entries(DATE)) time.setAttribute(name, value)
    }
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
      dashboard()
    }
    if (/^\/[^/]+\/[^/]+\/pull\/\d+/.test(location.pathname)) {
      emptySidebar()
      squashTitle()
    }
    pending = false
    absoluteDates()
    recentPushes()
    if (/^(\/[^/]+\/[^/]+)?\/(commits|pulls?)(\/|$)/.test(location.pathname)) commitTypes()
    prTabs()
    drawerSections()
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
    const owners = [...entries(config.sidebar?.pullRequests).map(([repo]) => repo.split("/")[0]), ...entries(config.sidebar?.allRepositories).map(([owner]) => owner)]
    for (const owner of new Set(owners.filter(Boolean))) {
      const url = (await toDataUrl(avatarUrl(owner))) ?? avatars[owner]
      if (url) next[owner] = url
    }
    localStorage.setItem(AVATARS, JSON.stringify(next))
    const unknown = entries(config.sidebar?.allRepositories).map(([owner]) => owner).filter((owner) => !(owner in orgs))
    for (const owner of unknown) {
      const org = await fetch(`/orgs/${owner}/repositories`, { method: "HEAD" }).then((res) => res.ok, () => undefined)
      if (org !== undefined) orgs[owner] = org
    }
    if (!unknown.length) return
    localStorage.setItem(ORGS, JSON.stringify(orgs))
    if (!unknown.some((owner) => orgs[owner])) return
    for (const node of document.querySelectorAll("[data-ujc-sections]")) node.remove()
    schedule()
  }

  if (location.pathname === "/") addEventListener("load", () => requestIdleCallback(cacheAvatars))
  document.addEventListener("github-enhanced:config", () => {
    config = JSON.parse(localStorage.getItem(CONFIG) ?? "{}")
    repoTabs()
    for (const node of document.querySelectorAll("[data-ujc-sections], [data-ujc-drawer]")) node.remove()
    schedule()
  })
  apply()
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true })
})()
