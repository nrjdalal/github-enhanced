// An unpacked install reloads itself once its files change on disk, so a git pull in its folder is all an update takes.
const FILES = ["manifest.json", "background.js", "bridge.js", "github.js", "github.css", "settings.html", "settings.js"]
const read = () => Promise.all(FILES.map((file) => fetch(chrome.runtime.getURL(file)).then((res) => res.text()))).then((texts) => texts.join("\0"))

chrome.runtime.onMessage.addListener((message) => {
  if (message !== "check-update") return
  ;(async () => {
    if ((await chrome.management.getSelf()).installType !== "development") return
    const now = await read()
    const { files } = await chrome.storage.session.get("files")
    if (files === undefined) await chrome.storage.session.set({ files: now })
    else if (files !== now) chrome.runtime.reload()
  })()
})
