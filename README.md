# Shellui Marketplace

The directory of apps for a Shellui shell.

[![CI](https://github.com/shellui/marketplace/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/shellui/marketplace/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

Shellui Marketplace lists official Shellui apps and community listings. Open it in a browser to browse and copy a navigation item into `shellui.config.json`. Open it inside a Shellui shell to install and remove apps when the host exposes `shellui.marketplace`.

Shellui 0.9 listings are free to install. This directory has no prices and no checkout.

## Get started

You need [pnpm](https://pnpm.io/) and Node.js 22 or newer.

```bash
git clone https://github.com/shellui/marketplace.git
cd marketplace
cp .env.example .env.local
pnpm install
pnpm start   # http://localhost:5176
```

`VITE_MARKETPLACE_API_URL` points at marketplace-service. The default is `https://api.marketplace.shellui.com`. When that origin does not answer, the directory keeps the local catalog (Files, Admin, Dashboard, AI Assistant, Docs, and two sample listings) and shows "Showing the local catalog."

## Two ways to add an app

In a browser, each app page has **Config JSON** and **CLI** tabs:

- Config JSON is one `NavigationItem` for the `navigation` array in `shellui.config.json` (`label`, `path`, `url`, `icon`)
- CLI is `shellui add <slug>`

Inside a Shellui shell, the same page shows **Install** and **Remove** when `shellui.marketplace` is present. Those buttons call `listInstalledApps`, `installApp`, and `uninstallApp`. After a successful call, the page sends a best-effort `POST /api/apps/<slug>/install` or `POST /api/apps/<slug>/uninstall`. An older host without `shellui.marketplace` still offers the config snippet and the CLI command.

The page follows `@shellui/sdk` theme and `colorScheme` while it is embedded. Opened on its own, it follows the system color scheme, and the header can switch light, dark, or system.

## marketplace-service

| Method | Path                         | Role                                                     |
| ------ | ---------------------------- | -------------------------------------------------------- |
| `GET`  | `/api/apps`                  | App list. A JSON array, or `{ "apps": [] }`              |
| `GET`  | `/api/apps/<slug>`           | One app, or `{ "app": {} }`                              |
| `GET`  | `/api/categories`            | Categories. A JSON array, or `{ "categories": [] }`      |
| `POST` | `/api/apps/<slug>/install`   | Install counter. The shell install does not wait on this |
| `POST` | `/api/apps/<slug>/uninstall` | Remove counter. Same best-effort rule                    |

## Docker

The image is a static build on unprivileged nginx, port `8080`, health check on `/health`.

```bash
docker build -t shellui-marketplace .
docker run -p 8080:8080 -e FRAME_ANCESTORS="https://dashboard.shellui.com" shellui-marketplace
```

`FRAME_ANCESTORS` lists the exact shell origins allowed to embed the directory. A bare `*` is refused. The image holds no secrets.

The `dev` target installs dependencies for a bind-mounted source tree:

```bash
docker build --target dev -t shellui-marketplace:dev .
```

## Development

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
```

## Shellui projects

| Project                                       | What it does                        |
| --------------------------------------------- | ----------------------------------- |
| [shellui](https://github.com/shellui/shellui) | The shell, CLI, and SDK             |
| [admin](https://github.com/shellui/admin)     | Administration app inside the shell |
| [files](https://github.com/shellui/files)     | File explorer for storage-service   |
| [docs](https://docs.shellui.com)              | Shellui documentation               |

## License

[MIT](LICENSE)
