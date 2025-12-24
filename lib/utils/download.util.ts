export async function download(url: string, filename: string) {
  try {
    // 1. 使用 fetch 获取数据
    const response = await fetch(url);
    if (!response.ok)
      throw new Error("网络请求失败");

    // 2. 将响应转换为 Blob 对象
    const blob = await response.blob();

    // 3. 创建一个指向该 Blob 的本地 URL
    const blobUrl = window.URL.createObjectURL(blob);

    // 4. 执行你原有的下载逻辑
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // 5. 善后处理：移除元素并释放内存
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  }
  catch (error) {
    console.error("强制下载失败，尝试普通链接:", error);
    // 降级处理：如果 fetch 失败（如跨域且无 CORS 权限），则尝试原有的跳转逻辑
    window.open(url, "_blank");
  }
}