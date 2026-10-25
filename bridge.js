// Copies the config from the extension's storage into github.com's localStorage, where github.js reads it synchronously as the page starts. The config is kept as JSON text, since the browser's storage sorts object keys and the order of bookmarks and links matters.
const KEY = "github-enhanced-config"
const sync = (text) => {
  if (localStorage.getItem(KEY) === text) return
  localStorage.setItem(KEY, text)
  document.dispatchEvent(new Event("github-enhanced:config"))
}
chrome.storage.sync.get("config", ({ config }) => sync(typeof config === "string" ? config : "{}"))
chrome.storage.onChanged.addListener((changes) => changes.config && sync(changes.config.newValue ?? "{}"))
chrome.runtime.sendMessage("check-update")
