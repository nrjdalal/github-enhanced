// An unpacked install reloads itself once its files change on disk, so a git pull in its folder is all an update takes; the files read at install or reload are the baseline.
const FILES = ["manifest.json", "background.js", "bridge.js", "github.js", "github.css", "settings.html", "settings.js"]
const read = () => Promise.all(FILES.map((file) => fetch(chrome.runtime.getURL(file)).then((res) => res.text()))).then((texts) => texts.join("\0"))

let ready = Promise.resolve()
chrome.runtime.onInstalled.addListener(() => {
  ready = read().then((files) => chrome.storage.local.set({ files }))
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
