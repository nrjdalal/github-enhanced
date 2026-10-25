// Copies the config from the extension's storage into github.com's localStorage, where github.js reads it synchronously as the page starts. The config is kept as JSON text, since the browser's storage sorts object keys and the order of bookmarks and links matters; an empty config adopts one left on github.com under github-enhanced-seed.
const KEY = "github-enhanced-config"
const SEED = "github-enhanced-seed"
const empty = (text) => Object.values(JSON.parse(text ?? "{}")).every((value) => !value || !Object.keys(value).length)
const sync = (text) => {
  if (localStorage.getItem(KEY) === text) return
  localStorage.setItem(KEY, text)
  document.dispatchEvent(new Event("github-enhanced:config"))
}
chrome.storage.sync.get("config", ({ config }) => {
  const text = typeof config === "string" ? config : "{}"
  const seed = localStorage.getItem(SEED)
  if (empty(text) && seed && !empty(seed)) chrome.storage.sync.remove("text").then(() => chrome.storage.sync.set({ config: seed }))
  else sync(text)
})
chrome.storage.onChanged.addListener((changes) => changes.config && sync(changes.config.newValue ?? "{}"))
chrome.runtime.sendMessage("check-update")
