import { commands, Extension, extensions, window } from "vscode";

// A set of VSCode extension ID's that conflict with our extension
const conflictingIDs = [
  "amodio.tsl-problem-matcher", // https://github.com/eamodio/vscode-tsl-problem-matcher/issues/13
  "haaaad.ansible", // replaced by redhat.ansible
  "lextudio.restructuredtext", // https://github.com/vscode-restructuredtext/vscode-restructuredtext/issues/286
  "sysninja.vscode-ansible-mod", // replaced by redhat.ansible
  "zbr.vscode-ansible", // replaced by redhat.ansible
  "vscoss.vscode-ansible", // replaced by redhat.ansible
  "zbr.vscode-ansible", // replaced by redhat.ansible
];

// A set of VSCode extension ID's that are currently uninstalling
const uninstallingIDs = new Set();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isExtensionPresent(obj: any): obj is Extension<any> {
  return typeof obj !== "undefined" && !uninstallingIDs.has(obj.id);
}

/**
 * Get all of the installed extensions that currently conflict with us
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getConflictingExtensions(): Extension<any>[] {
  return (
    conflictingIDs
      .map((x) => extensions.getExtension(x))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter<Extension<any>>((ext): ext is Extension<any> =>
        isExtensionPresent(ext)
      )
  );
}

/**
 * Display the uninstall conflicting extension notification if there are any conflicting extensions currently installed
 */
export async function showUninstallConflictsNotification(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conflictingExts: Extension<any>[]
): Promise<void> {
  // Add all available conflicting extensions to the uninstalling IDs map
  for (const ext of conflictingExts) {
    uninstallingIDs.add(ext.id);
  }

  const uninstallMsg = "Uninstall";

  if (!conflictingExts.length) {
    return;
  }
  // Gather all the conflicting display names
  let conflictMsg = "";
  if (conflictingExts.length === 1) {
    conflictMsg = `[${conflictingExts[0].packageJSON.displayName}](https://marketplace.visualstudio.com/items?itemName=${conflictingExts[0].id}) extension`;
  } else {
    const extNames: string[] = conflictingExts.map(
      (ext) =>
        `[${ext.packageJSON.displayName}](https://marketplace.visualstudio.com/items?itemName=${ext.id})`
    );
    conflictMsg = `The ${extNames.join(", ")} extensions`;
  }
  conflictMsg += " may be pining for the fjords. How about uninstalling?";

  await window
    .showInformationMessage(conflictMsg, uninstallMsg)
    .then((clickedMsg) => {
      if (clickedMsg !== uninstallMsg) {
        return;
      }
      for (const ext of conflictingExts) {
        commands.executeCommand(
          "workbench.extensions.uninstallExtension",
          ext.id
        );
        uninstallingIDs.delete(ext.id);
      }
    });
}
