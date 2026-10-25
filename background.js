// An unpacked install reloads itself once its files change on disk, so a git pull in its folder is all an update takes; the files read at install or reload are the baseline. Each install or reload also rewrites a config in the old bookmarks and links shape to pullRequests and allRepositories.
const FILES = ["manifest.json", "background.js", "bridge.js", "github.js", "github.css", "settings.html", "settings.js"]
const read = () => Promise.all(FILES.map((file) => fetch(chrome.runtime.getURL(file)).then((res) => res.text()))).then((texts) => texts.join("\0"))

let ready = Promise.resolve()
chrome.runtime.onInstalled.addListener(async () => {
  ready = read().then((files) => chrome.storage.local.set({ files }))
  const { config } = await chrome.storage.sync.get("config")
  if (typeof config !== "string") return
  const { bookmarks, links, ...rest } = JSON.parse(config)
  if (!bookmarks && !links) return
  const owner = (href) => {
    const [first, second] = new URL(href, "https://github.com").pathname.split("/").filter(Boolean)
    return first === "orgs" ? second : first
  }
  await chrome.storage.sync.remove("text")
  await chrome.storage.sync.set({ config: JSON.stringify({ pullRequests: Object.keys(bookmarks ?? {}), allRepositories: Object.keys(links ?? {}).map(owner), ...rest }) })
})

chrome.runtime.onMessage.addListener((message) => {
  if (message !== "check-update") return
  ;(async () => {
    await ready
    if ((await chrome.management.getSelf()).installType !== "development") return
    const { files } = await chrome.storage.local.get("files")
    if (files !== undefined && files !== (await read())) chrome.runtime.reload()
  })()
})
