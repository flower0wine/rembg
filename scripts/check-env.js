#!/usr/bin/env node

/**
 * 环境变量检查脚本
 * 验证所有必需的环境变量是否已配置
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载 .env.local
config({ path: join(__dirname, "..", ".env.local") });

const requiredEnvVars = {
  "Supabase": [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ],
  "reCAPTCHA": [
    "NEXT_PUBLIC_RECAPTCHA_SITE_KEY",
    "RECAPTCHA_SECRET_KEY",
  ],
  "Background Removal API": [
    "BG_REMOVAL_API_KEY",
  ],
};

const optionalEnvVars = {
  "Sentry (可选)": [
    "NEXT_PUBLIC_SENTRY_DSN",
    "SENTRY_ORG",
    "SENTRY_PROJECT",
  ],
  "Background Removal API (可选)": [
    "BG_REMOVAL_API_URL",
  ],
};

console.log("🔍 检查环境变量配置...\n");

let hasErrors = false;
let hasWarnings = false;

// 检查必需的环境变量
for (const [category, vars] of Object.entries(requiredEnvVars)) {
  console.log(`📦 ${category}:`);

  for (const varName of vars) {
    const value = process.env[varName];

    if (!value) {
      console.log(`  ❌ ${varName} - 未配置`);
      hasErrors = true;
    }
    else if (value.includes("your_") || value.includes("xxxxx")) {
      console.log(`  ⚠️  ${varName} - 包含占位符，请替换为实际值`);
      hasWarnings = true;
    }
    else {
      // 显示部分值（保护敏感信息）
      const displayValue = value.length > 20
        ? `${value.substring(0, 10)}...${value.substring(value.length - 5)}`
        : value;
      console.log(`  ✅ ${varName} - ${displayValue}`);
    }
  }
  console.log("");
}

// 检查可选的环境变量
console.log("📦 可选配置:");
for (const [category, vars] of Object.entries(optionalEnvVars)) {
  console.log(`  ${category}:`);

  for (const varName of vars) {
    const value = process.env[varName];

    if (!value) {
      console.log(`    ⚪ ${varName} - 未配置（可选）`);
    }
    else {
      const displayValue = value.length > 20
        ? `${value.substring(0, 10)}...${value.substring(value.length - 5)}`
        : value;
      console.log(`    ✅ ${varName} - ${displayValue}`);
    }
  }
}
console.log("");

// 验证 URL 格式
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url.startsWith("https://") || !url.includes(".supabase.co")) {
    console.log("⚠️  NEXT_PUBLIC_SUPABASE_URL 格式可能不正确");
    console.log("   应该类似: https://xxxxx.supabase.co");
    hasWarnings = true;
  }
}

// 验证 reCAPTCHA 密钥格式
if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
  const key = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!key.startsWith("6L")) {
    console.log("⚠️  NEXT_PUBLIC_RECAPTCHA_SITE_KEY 格式可能不正确");
    console.log("   reCAPTCHA 密钥通常以 6L 开头");
    hasWarnings = true;
  }
}

// 总结
console.log("━".repeat(50));
if (hasErrors) {
  console.log("❌ 配置检查失败！请配置所有必需的环境变量。");
  console.log("\n📝 步骤:");
  console.log("1. 复制 .env.example 到 .env.local");
  console.log("2. 填写所有必需的环境变量");
  console.log("3. 参考 SETUP_GUIDE.md 获取详细配置说明");
  process.exit(1);
}
else if (hasWarnings) {
  console.log("⚠️  配置检查通过，但有一些警告。");
  console.log("   请检查上述警告信息。");
  process.exit(0);
}
else {
  console.log("✅ 所有必需的环境变量都已正确配置！");
  console.log("\n🚀 你可以运行以下命令启动开发服务器:");
  console.log("   pnpm dev");
  process.exit(0);
}
