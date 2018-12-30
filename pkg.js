const url = require('url')
const getPackageRepo = require('./lib/api/getPackageRepo')
const html = require('./lib/utils/html')

function Pkg({ pkg }) {
  return html`
    <div>Hello ${pkg}</div>
  `
}

module.exports = async (req, res) => {
  let { pathname } = url.parse(req.url, true)

  let pkgName = pathname.substring(1)
  let { repo, err } = await getPackageRepo(pkgName)

  if (repo) {
    res.writeHead(302, { Location: repo })
    res.end()
  } else {
    console.error({ err })
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(
      html`
        <html lang="en">
          <head>
            <title>repo</title>
            <link
              rel="stylesheet"
              type="text/css"
              href="https://unpkg.com/tachyons@4.11.1/css/tachyons.min.css"
            />
          </head>
          <body class="sans-serif">
            <${Pkg} pkg=${pathname} />
          </body>
        </html>
      `
    )
  }
}