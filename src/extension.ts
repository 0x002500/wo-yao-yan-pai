import * as vscode from "vscode";
import * as path from "path";
const player = require("play-sound")({});

export function activate(context: vscode.ExtensionContext) {
  let enabled = context.globalState.get<boolean>("buildSoundEnabled", true);

  // 创建状态栏按钮
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );

  function updateStatusBar() {
    statusBarItem.text = enabled ? "我要验牌: 开" : "🔇 我要验牌: 关";
    statusBarItem.tooltip = "点击按钮打开或关闭法(fà)国赌神";
    statusBarItem.command = "buildSound.toggle";
    statusBarItem.show();
  }

  function playSound(fileName: string) {
    if (!enabled) {
      return;
    }

    const soundPath = path.join(context.extensionPath, "media", fileName);

    player.play(soundPath, (err: any) => {
      if (err) {
        console.error("Error playing sound:", err);
      }
    });
  }

  // 注册开关命令
  const toggleCommand = vscode.commands.registerCommand(
    "buildSound.toggle",
    () => {
      enabled = !enabled;
      context.globalState.update("buildSoundEnabled", enabled);
      updateStatusBar();
    },
  );

  // 编译开始
  vscode.tasks.onDidStartTask((event: vscode.TaskStartEvent) => {
    playSound("start.wav");
  });

  // 编译结束
  vscode.tasks.onDidEndTaskProcess((event: vscode.TaskProcessEndEvent) => {
    if (event.exitCode === 0) {
      playSound("success.wav");
    } else {
      playSound("fail.wav");
    }
  });

  updateStatusBar();

  context.subscriptions.push(statusBarItem, toggleCommand);
}

export function deactivate() {}
