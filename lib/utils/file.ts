export function getFileExtension(filename: string) {
  if (filename && filename.includes(".")) {
    const pop = filename.split(".").pop() || "";
    return pop.toLowerCase();
  }
  return "";
}