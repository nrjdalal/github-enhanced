// Copies the config from the extension's storage into github.com's localStorage, where github.js reads it synchronously as the page starts; an install with an empty config adopts the one this browser last used on github.com.
const KEY = "github-enhanced-config"
const sync = (config) => {
  const next = JSON.stringify(config ?? {})
  if (localStorage.getItem(KEY) === next) return
  localStorage.setItem(KEY, next)
  document.dispatchEvent(new Event("github-enhanced:config"))
}
const empty = (config) => !config || Object.values(config).every((value) => !value || !Object.keys(value).length)
chrome.storage.sync.get("config", ({ config }) => {
  const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}")
  if (empty(config) && !empty(saved)) chrome.storage.sync.set({ config: saved })
  else sync(config)
})
chrome.storage.onChanged.addListener((changes) => changes.config && sync(changes.config.newValue))
chrome.runtime.sendMessage("check-update")
