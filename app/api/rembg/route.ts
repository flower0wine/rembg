import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 获取环境变量中的服务 URL
    const webUrl = process.env.REMBG_SERVICE_URL;

    if (!webUrl) {
      return NextResponse.json(
        { error: "服务配置错误：未设置 REMBG_SERVICE_URL" },
        { status: 500 }
      );
    }

    // 获取请求体中的图片数据
    const imageData = await request.arrayBuffer();

    if (!imageData || imageData.byteLength === 0) {
      return NextResponse.json(
        { error: "未提供图片数据" },
        { status: 400 }
      );
    }

    // 调用云端服务
    const response = await fetch(webUrl, {
      method: "POST",
      headers: {
        "Content-Type": "image/jpeg",
      },
      body: imageData,
    });

    // 处理响应
    if (response.status === 400) {
      return NextResponse.json(
        { error: "图片未提供或格式不正确" },
        { status: 400 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `服务错误：${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // 获取处理后的图片数据
    const processedImageData = await response.arrayBuffer();

    // 返回处理后的图片
    return new NextResponse(processedImageData, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  }
  catch (error) {
    console.error("背景移除服务错误:", error);
    return NextResponse.json(
      { error: "处理图片时发生错误" },
      { status: 500 }
    );
  }
}
