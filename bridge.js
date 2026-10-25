// Copies the settings from the extension's storage into github.com's localStorage, where github.js reads them synchronously as the page starts.
const sync = (config) => {
  const next = JSON.stringify(config ?? {})
  if (localStorage.getItem("github-enhanced-config") === next) return
  localStorage.setItem("github-enhanced-config", next)
  document.dispatchEvent(new Event("github-enhanced:config"))
}
chrome.storage.sync.get("config", ({ config }) => sync(config))
chrome.storage.onChanged.addListener((changes) => changes.config && sync(changes.config.newValue))
chrome.runtime.sendMessage("check-update")
