import { Command, CommanderCommand, CommandEvent } from "@alarife/commander";
import { copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync } from "fs";
import { basename, isAbsolute, join } from "path";

const copyDirectorySync = (source: string, target: string): void => {
  mkdirSync(target, { recursive: true });

  const items = readdirSync(source, { withFileTypes: true });

  for (const item of items) {
    const srcPath = join(source, item.name);
    const destPath = join(target, item.name);

    if (item.isDirectory()) {
      copyDirectorySync(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
};

const copySingleFile = (source: string, target: string): void => {
  let targetFile = target;

  if (existsSync(target) && lstatSync(target).isDirectory()) {
    targetFile = join(target, basename(source));
  }

  copyFileSync(source, targetFile);
};

/**
 * command: copy
 * argument: ./lib (source) (REQUIRED)
 * argument: ./dist (target) (REQUIRED)
 * option: --deep, -d (boolean) (default: false)
 * 
 * example:
 * copy ./lib ./dist --deep
 */
export default (event: CommandEvent, command: CommanderCommand, commandConfig: Command) => {
  const [source, target] = event.args;
  const { deep } = event.options;

  const resolvedSource = isAbsolute(source) ? source : join(process.cwd(), source);
  const resolvedTarget = isAbsolute(target) ? target : join(process.cwd(), target);

  if (deep) {
    copyDirectorySync(resolvedSource, resolvedTarget);
  } else {
    copySingleFile(resolvedSource, resolvedTarget);
  }
};