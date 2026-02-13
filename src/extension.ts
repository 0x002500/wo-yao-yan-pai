import * as vscode from "vscode";
import * as path from "path";
const player = require("play-sound")({});

export function activate(context: vscode.ExtensionContext) {
  function playSound(fileName: string) {
    const soundPath = path.join(context.extensionPath, "media", fileName);

    player.play(soundPath, (err: any) => {
      if (err) {
        console.error("Error playing sound:", err);
      }
    });
  }

  vscode.tasks.onDidStartTask(() => {
    playSound("start.wav");
  });

  vscode.tasks.onDidEndTaskProcess((event) => {
    if (event.exitCode === 0) {
      playSound("success.wav");
    } else {
      playSound("fail.wav");
    }
  });
}

export function deactivate() {}
