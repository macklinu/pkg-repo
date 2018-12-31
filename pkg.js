const url = require('url')
const getPackageRepo = require('./lib/api/getPackageRepo')
const ErrorTypes = require('./lib/models/ErrorTypes')
const html = require('./lib/utils/html')

module.exports = async (req, res) => {
  let { pathname } = url.parse(req.url, true)

  let pkg = pathname.substring(1)
  let { repo, err } = await getPackageRepo(pkg)

  if (repo) {
    res.writeHead(302, { Location: repo })
    res.end()
  } else {
    let ErrorComponent = createErrorComponent(err)
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(
      html`
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <meta http-equiv="X-UA-Compatible" content="ie=edge" />
            <link
              rel="stylesheet"
              type="text/css"
              href="https://unpkg.com/tachyons@4.11.1/css/tachyons.min.css"
            />
            <title>repo.now.sh: ${pkg}</title>
          </head>
          <body class="sans-serif">
            <main class="pa3 ph5-ns">
              <h1 class="f-headline-l f1 lh-solid">Uh oh!</h1>
              <${ErrorComponent} pkg=${pkg} />
            </main>
          </body>
        </html>
      `
    )
  }
}

function createErrorComponent(err) {
  switch (err) {
    case ErrorTypes.Unauthorized: {
      return ({ pkg }) => html`
        ${err}
      `
    }
    case ErrorTypes.PackageMissingRepo: {
      return ({ pkg }) => html`
        <main class="f3 lh-copy">
          <p>
            It looks like <span class="b">${pkg}</span> doesn't have a
            repository defined in its package.json.
          </p>
          <p>Here's how you can help! 🙏</p>
          <section class="f4 lh-copy measure">
            <p>
              Confirm\
              <a
                href="https://www.npmjs.com/package/${pkg}"
                class="no-underline underline-hover link black bg-light-blue pa1"
                >${pkg}</a
              >\ exists on npm's website.
            </p>
            <p>
              Do you see a <b>repository</b> field in the right-hand column of
              the npm package page?
            </p>
            <img
              src="https://file-ioapobjbxn.now.sh/"
              width="357"
              height="169"
            />
            <p>
              ✅ <b>If there is a repository field</b>, please\
              <a
                href="https://github.com/macklinu/pkg-repo/issues/new"
                class="no-underline underline-hover link black bg-light-blue pa1"
                >file an issue on repo.now.sh</a
              >, as this is an application error.
            </p>
            <p>
              ❌ <b>If there is not a repository field</b>, please find the
              package's repo online and open a pull request adding the
              repository field to its\
              <a
                href="https://docs.npmjs.com/files/package.json#repository"
                class="no-underline underline-hover link black bg-light-blue pa1"
                >package.json</a
              >.
            </p>
          </section>
        </main>
      `
    }
    case ErrorTypes.PackageNotFound: {
      return ({ pkg }) => html`
        <section>
          <p class="f3 lh-copy">
            It looks like <span class="bg-light-blue pa1">${pkg}</span> wasn't
            found in the npm registry.
          </p>
          <p class="f3 lh-copy">Here's how you can help!</p>
        </section>
      `
    }
    case ErrorTypes.UnknownError:
    default:
      return ({ pkg }) =>
        html`
          ${err}
        `
  }
}
