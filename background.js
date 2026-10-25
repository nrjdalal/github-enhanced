// An unpacked install reloads itself once its files change on disk, so a git pull in its folder is all an update takes; the files read at install or reload are the baseline. Each install or reload also moves a config from an older shape (top-level pullRequests, allRepositories and repoTabs, or bookmarks and links) into sidebar and repository.
const FILES = ["manifest.json", "background.js", "bridge.js", "github.js", "github.css", "settings.html", "settings.js"]
const read = () => Promise.all(FILES.map((file) => fetch(chrome.runtime.getURL(file)).then((res) => res.text()))).then((texts) => texts.join("\0"))

let ready = Promise.resolve()
chrome.runtime.onInstalled.addListener(async () => {
  ready = read().then((files) => chrome.storage.local.set({ files }))
  const { config } = await chrome.storage.sync.get("config")
  if (typeof config !== "string") return
  const { bookmarks, links, pullRequests, allRepositories, repoTabs, ...rest } = JSON.parse(config)
  if (![bookmarks, links, pullRequests, allRepositories, repoTabs].some(Boolean)) return
  const owner = (href) => {
    const [first, second] = new URL(href, "https://github.com").pathname.split("/").filter(Boolean)
    return first === "orgs" ? second : first
  }
  const sidebar = {
    pullRequests: pullRequests ?? Object.entries(bookmarks ?? {}).map(([repo, label]) => ({ [repo]: label })),
    allRepositories: allRepositories ?? Object.entries(links ?? {}).map(([href, label]) => ({ [owner(href)]: [].concat(label)[0] })),
  }
  const repository = repoTabs ? { tabs: repoTabs } : undefined
  await chrome.storage.sync.remove("text")
  await chrome.storage.sync.set({ config: JSON.stringify({ sidebar, repository, ...rest }) })
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
