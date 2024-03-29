import * as vscode from "vscode";
import { spawn } from "child_process";
import { getInterpreterDetails } from "../common/python";
import { getSqlFmtArgs, getSqlFmtPath } from "../common/settings";
import { traceError, traceInfo, traceLog } from "../common/logging";
import { file } from "tmp-promise";

export class SqlfmtFormatProvider
  implements vscode.DocumentFormattingEditProvider
{
  constructor() {}

  async provideDocumentFormattingEdits(
    document: vscode.TextDocument
  ): Promise<vscode.TextEdit[]> {
    return this.formatFile(document);
  }

  async formatFile(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
    const textEdits = [];

    traceInfo(`Formatting "${document.fileName}" file`);
    const { path, cleanup } = await file({ postfix: ".sql" });

    try {
      const tmpFileUri = vscode.Uri.file(path);
      await vscode.workspace.fs.writeFile(
        tmpFileUri,
        new TextEncoder().encode(document.getText())
      );

      await this.executeSqlfmt(
        vscode.workspace.getWorkspaceFolder(document.uri),
        [tmpFileUri.fsPath]
      );

      const text = new TextDecoder().decode(
        await vscode.workspace.fs.readFile(tmpFileUri)
      );

      textEdits.push(
        vscode.TextEdit.replace(
          document.validateRange(
            new vscode.Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE)
          ),
          text.toString()
        )
      );
    } catch (error) {
      vscode.window.showErrorMessage("Failed to format file: " + error);
    } finally {
      cleanup();
    }

    return textEdits;
  }

  async formatWorkspace(document: vscode.TextDocument) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    traceInfo(`Formatting "${workspaceFolder?.name}" workspace`);

    if (!workspaceFolder) {
      return;
    }
    try {
      await this.executeSqlfmt(workspaceFolder, [workspaceFolder.uri.fsPath]);
    } catch (error) {
      vscode.window.showErrorMessage("Failed to format workspace: " + error);
    }
  }

  private async executeSqlfmt(
    workspaceFolder: vscode.WorkspaceFolder | undefined,
    commandArgs: string[]
  ) {
    const interpreterDetails = await getInterpreterDetails(
      workspaceFolder?.uri
    );

    const command = getSqlFmtPath(workspaceFolder, interpreterDetails?.path);
    const args = [
      ...getSqlFmtArgs(workspaceFolder, interpreterDetails?.path),
      ...commandArgs,
    ];

    traceLog(`Execute: "${[command, ...args].join(" ")}"`);

    return await new Promise((resolve, reject) => {
      const commandProcess = spawn(command, args, {
        cwd: workspaceFolder?.uri.fsPath,
      });

      if (commandProcess.pid) {
        let stdoutBuffer = "";
        let stderrBuffer = "";

        commandProcess.stdout!.on(
          "data",
          (chunk) => (stdoutBuffer += chunk.toString())
        );
        commandProcess.stderr!.on(
          "data",
          (chunk) => (stderrBuffer += chunk.toString())
        );

        commandProcess.once("close", () => {
          if (stdoutBuffer) {
            traceLog(stdoutBuffer);
          }
          if (stderrBuffer) {
            if (commandProcess.exitCode !== 0) {
              traceError(stderrBuffer);
              reject(stderrBuffer);
            }

            traceLog(stderrBuffer);
            resolve({ success: true });
          }
        });

        commandProcess.once("error", (error) => {
          traceError(error);
          reject(error);
        });
      }
    });
  }
}
