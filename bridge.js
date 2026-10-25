// Copies the config from the extension's storage into github.com's localStorage, where github.js reads it synchronously as the page starts; a fresh install with no config adopts the one this browser last used on github.com.
const KEY = "github-enhanced-config"
const sync = (config) => {
  const next = JSON.stringify(config ?? {})
  if (localStorage.getItem(KEY) === next) return
  localStorage.setItem(KEY, next)
  document.dispatchEvent(new Event("github-enhanced:config"))
}
chrome.storage.sync.get("config", ({ config }) => {
  if (config !== undefined) return sync(config)
  const saved = localStorage.getItem(KEY)
  if (saved && saved !== "{}") chrome.storage.sync.set({ config: JSON.parse(saved) })
})
chrome.storage.onChanged.addListener((changes) => changes.config && sync(changes.config.newValue))
chrome.runtime.sendMessage("check-update")
