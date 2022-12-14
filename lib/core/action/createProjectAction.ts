import { origin } from "../../config/repo-config.json";
import { fnLoadingByOra } from "../../common/utils";
import { commandExec } from "../../common/terminal";

import inquirer from "inquirer";
import fs from "fs";
import {promisify} from 'util';
const download = promisify(require("download-git-repo"));

interface ResType {
  frame: "vue" | "react";
}
const { prompt } = inquirer;
export const createProjectAction = async (projectName: string) => {
  const res: ResType = await prompt({
    type: "rawlist",
    name: "frame",
    message: "选择一个框架",
    default: "vue",
    choices: ["vue", "react"],
  });
  if (res.frame === "react") {
    console.log("react暂无");
    return;
  }

  if (fs.existsSync(projectName)) {
    const res = await prompt({
      type: "confirm",
      name: "isCover",
      message: `${projectName} 目录已存在, 是否覆盖？`,
    });
    const rmDir = process.platform === 'win32' ? 'rd /s /q' : 'rm -rf';
    if (res.isCover) await commandExec(`${rmDir} ${projectName}`, {});
    else return;
  }

  await fnLoadingByOra(
    () => download(origin[res.frame], projectName, { clone: true }),
    "正在拉取项目...",
    "下载成功～"
  );

  const packagePath = `${projectName}/package.json`;
  if (fs.existsSync(packagePath)) {
    let _package: any = fs.readFileSync(packagePath).toString();
    _package = JSON.parse(_package);
    _package.name = projectName;
    _package.version = "1.0.0";
    fs.unlinkSync(packagePath);
    fs.writeFileSync(packagePath, JSON.stringify(_package, undefined, 2));
  }
};