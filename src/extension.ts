import * as vscode from "vscode";
import * as path from "path";
const player = require("play-sound")({});

export function activate(context: vscode.ExtensionContext) {
  let enabled = context.globalState.get<boolean>("buildSoundEnabled", true);

  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );

  function updateStatusBar() {
    statusBarItem.text = enabled ? "我要验牌: 开" : "我要验牌: 关";
    statusBarItem.tooltip = "击按钮打开或关闭法(fà)国赌神";
    statusBarItem.command = "buildSound.toggle";
    statusBarItem.show();
  }

  function playSound(fileName: string) {
    if (!enabled) return;

    const soundPath = path.join(context.extensionPath, "media", fileName);

    player.play(soundPath, (err: any) => {
      if (err) {
        console.error("Error playing sound:", err);
      }
    });
  }

  // 过滤掉无意义命令
  function isBuildLikeCommand(command: string): boolean {
    const ignore = ["ls", "cd", "pwd", "clear", "git status"];
    const keywords = [
      "python",
      "node",
      "npm",
      "yarn",
      "pnpm",
      "gcc",
      "g++",
      "go",
      "rustc",
      "cargo",
      "javac",
      "java",
      "dotnet",
      "make",
      "cmake",
      "gradle",
      "mvn",
    ];

    if (ignore.some((cmd) => command.startsWith(cmd))) {
      return false;
    }

    return keywords.some((key) => command.includes(key));
  }

  // 开始执行命令
  let commandStartDisposable = vscode.window.onDidStartTerminalShellExecution(
    (event) => {
      if (!enabled) return;

      const command =
        typeof event.execution.commandLine === "string"
          ? event.execution.commandLine
          : event.execution.commandLine.value;
      if (isBuildLikeCommand(command)) {
        playSound("start.wav");
      }
    },
  );

  // 命令结束
  let commandEndDisposable = vscode.window.onDidEndTerminalShellExecution(
    (event) => {
      if (!enabled) return;

      const command =
        typeof event.execution.commandLine === "string"
          ? event.execution.commandLine
          : event.execution.commandLine.value;
      if (!isBuildLikeCommand(command)) return;

      if (event.exitCode === 0) {
        playSound("success.wav");
      } else {
        playSound("fail.wav");
      }
    },
  );

  // 注册开关
  const toggleCommand = vscode.commands.registerCommand(
    "buildSound.toggle",
    () => {
      enabled = !enabled;
      context.globalState.update("buildSoundEnabled", enabled);
      updateStatusBar();
    },
  );

  updateStatusBar();
  context.subscriptions.push(
    commandStartDisposable,
    commandEndDisposable,
    statusBarItem,
    toggleCommand,
  );
}

export function deactivate() {}
