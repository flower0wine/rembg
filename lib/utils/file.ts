export function getFileExtension(filename: string) {
  if (filename && filename.includes(".")) {
    const pop = filename.split(".").pop() || "";
    return pop.toLowerCase();
  }
  return "";
}

export function getFileName(filename: string) {
  if (filename === "") {
    return "";
  }

  // 1. 找到最后一个点的位置
  const lastDotIndex = filename.lastIndexOf(".");

  // 2. 如果没有点号，或者点号在开头（如 .gitignore），直接返回原文件名
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return filename;
  }

  // 3. 截取从开头到最后一个点号之间的内容
  return filename.substring(0, lastDotIndex);
}