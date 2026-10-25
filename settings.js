const field = document.getElementById("config")
const status = document.getElementById("status")
const TEMPLATE = `{
  "sidebar": {
    "pullRequests": [
      // "owner/repo", or { "owner/repo": "Label" } to name it
      // "nrjdalal/zerostarter",
      // { "vercel/next.js": "Next.js" }
    ],
    "allRepositories": [
      // "user or org", or { "user or org": "Label" } to name it
      // "octocat",
      // { "github": "GitHub" }
    ]
  },
  "repository": {
    "tabs": [
      // tabs kept in a repo's bar, in order; the rest move under More
      // "code", "issues", "pull-requests", "actions"
    ]
  }
}`

const parse = (text) => {
  let out = ""
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (quoted) {
      out += char
      if (char === "\\") out += text[++i] ?? ""
      else if (char === '"') quoted = false
    } else if (char === "/" && text[i + 1] === "/") {
      while (i < text.length && text[i] !== "\n") i++
      out += "\n"
    } else {
      if (char === '"') quoted = true
      out += char
    }
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, "$1"))
}

chrome.storage.sync.get(["config", "text"], ({ config, text }) => {
  const parsed = typeof config === "string" ? JSON.parse(config) : {}
  const empty = Object.values(parsed).every((value) => !value || !Object.keys(value).length)
  field.value = text ?? (empty ? TEMPLATE : JSON.stringify(parsed, null, 2).replace(/\{\n\s+("(?:[^"\\]|\\.)*": "(?:[^"\\]|\\.)*")\n\s+\}/g, "{ $1 }"))
})

document.getElementById("save").addEventListener("click", async () => {
  let config
  try {
    config = parse(field.value)
  } catch (error) {
    status.textContent = `Not valid JSON: ${error.message}`
    return
  }
  if (typeof config !== "object" || config === null || Array.isArray(config)) {
    status.textContent = "The config must be a JSON object."
    return
  }
  await chrome.storage.sync.set({ config: JSON.stringify(config), text: field.value })
  status.textContent = "Saved. Open tabs update right away."
})
