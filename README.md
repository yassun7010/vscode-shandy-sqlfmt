# shandy-sqlfmt extension for VSCode

[![GitHub license](https://badgen.net/github/license/Naereen/Strapdown.js?style=flat-square)](https://github.com/Naereen/StrapDown.js/blob/master/LICENSE)
[![Actions status](https://github.com/yassun7010/vscode-shandy-sqlfmt/workflows/CI/badge.svg)](https://github.com/yassun7010/vscode-shandy-sqlfmt/actions)
[![Marketplace Version](https://vsmarketplacebadges.dev/version/yassun7010.vscode-shandy-sqlfmt.png?label=VS%20Code%20Marketplace&logo=visual-studio-code "Current Release")](https://marketplace.visualstudio.com/items?itemName=yassun7010.vscode-shandy-sqlfmt)

A Visual Studio Code extension for [shandy-sqlfmt](https://github.com/tconbeer/sqlfmt). Available on the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=yassun7010.vscode-shandy-sqlfmt).

![icon](images/icon.png)

## Usage

### Install shandy-sqlfmt

Please install [shandy-sqlfmt](https://github.com/tconbeer/sqlfmt) first.

This extension will automatically detect the `sqlfmt` command in your workspace, and if can't find it, it will find it in your `$PATH`.

#### Global install

```sh
pipx install shandy-sqlfmt[jinja]
```

#### Local install

```sh
# Use your virtualenv tool
cd workspace
python -m venv .venv
source .venv/bin/activate

pip install shandy-sqlfmt[jinja]
```

### Example configuration

You can configure shandy-sqlfmt to format SQL or Jinja-SQL on-save by enabling the `editor.formatOnSave` action in `settings.json`, and setting shandy-sqlfmt as your default formatter.

```json
{
  "[sql]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "yassun7010.shandy-sqlfmt"
  },
  "[jinja-sql]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "yassun7010.shandy-sqlfmt"
  }
}
```

## Commands

| Command                         | Description                        |
| ------------------------------- | ---------------------------------- |
| shandy-sqlfmt: Format Workspace | Format all SQL files in workspace. |

## License

MIT
