// Parses JSON with // comments and trailing commas, for the config.
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
