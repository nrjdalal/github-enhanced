const fields = { bookmarks: document.getElementById("bookmarks"), nav: document.getElementById("nav") }
const parse = (text) => text.split("\n").map((line) => line.split("|").map((part) => part.trim())).filter(([first, second]) => first && second)

chrome.storage.sync.get("config", ({ config = {} }) => {
  fields.bookmarks.value = (config.bookmarks ?? []).map((row) => row.join(" | ")).join("\n")
  fields.nav.value = (config.nav ?? []).map((row) => row.join(" | ")).join("\n")
})

document.getElementById("save").addEventListener("click", async () => {
  const nav = parse(fields.nav.value).map(([label, url, icon]) => [label, url, icon === "book-locked" ? "book-locked" : "book"])
  await chrome.storage.sync.set({ config: { bookmarks: parse(fields.bookmarks.value), nav } })
  document.getElementById("status").textContent = "Saved. Open tabs update right away."
})
