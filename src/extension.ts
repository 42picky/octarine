// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

/* local */
import {
  getConflictingExtensions,
  showUninstallConflictsNotification,
} from "./extensionConflicts";

export function activate(context: vscode.ExtensionContext) {
  notifyAboutConflicts();
}

export function deactivate() {}

function notifyAboutConflicts(): void {
  const conflictingExtensions = getConflictingExtensions();
  if (conflictingExtensions.length > 0) {
    showUninstallConflictsNotification(conflictingExtensions);
  }
}
