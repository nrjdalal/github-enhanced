const field = document.getElementById("config")
const status = document.getElementById("status")
const EMPTY = { bookmarks: {}, links: {} }

chrome.storage.sync.get("config", ({ config }) => {
  field.value = JSON.stringify(config ?? EMPTY, null, 2)
})

document.getElementById("save").addEventListener("click", async () => {
  let config
  try {
    config = JSON.parse(field.value)
  } catch (error) {
    status.textContent = `Not valid JSON: ${error.message}`
    return
  }
  if (typeof config !== "object" || config === null || Array.isArray(config)) {
    status.textContent = "The config must be a JSON object."
    return
  }
  await chrome.storage.sync.set({ config })
  field.value = JSON.stringify(config, null, 2)
  status.textContent = "Saved. Open tabs update right away."
})
