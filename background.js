// An unpacked install reloads itself once its files change on disk, so a git pull in its folder is all an update takes; the files read at install or reload are the baseline. Each install or reload also rewrites a link kept as [label, icon], the old shape, to its label.
const FILES = ["manifest.json", "background.js", "bridge.js", "github.js", "github.css", "settings.html", "settings.js"]
const read = () => Promise.all(FILES.map((file) => fetch(chrome.runtime.getURL(file)).then((res) => res.text()))).then((texts) => texts.join("\0"))

let ready = Promise.resolve()
chrome.runtime.onInstalled.addListener(async () => {
  ready = read().then((files) => chrome.storage.local.set({ files }))
  const { config } = await chrome.storage.sync.get("config")
  if (typeof config !== "string") return
  const parsed = JSON.parse(config)
  const links = Object.entries(parsed.links ?? {})
  if (!links.some(([, value]) => Array.isArray(value))) return
  parsed.links = Object.fromEntries(links.map(([href, value]) => [href, [].concat(value)[0]]))
  await chrome.storage.sync.remove("text")
  await chrome.storage.sync.set({ config: JSON.stringify(parsed) })
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
