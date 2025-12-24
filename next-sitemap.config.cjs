const siteUrl = process.env.NEXT_PUBLIC_BASE_URL;

if (!siteUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is required");
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  // 站点域名（用 env 变量更好）
  siteUrl,
  // 自动生成 robots.txt（推荐开启）
  generateRobotsTxt: true,
  // 生成 index sitemap
  sitemapSize: 1000,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        // 排除敏感路径
        disallow: ["/history", "/subscription/checkout"],
      },
    ],
  },
  // 排除不需要索引的页面（强烈推荐，避免爬虫访问构建 artifact）
  exclude: ["/admin/*", "/_next/*", "/subscription/checkout", "/history"],
  // i18n 多语言支持
  alternateRefs: [
    {
      href: `${siteUrl}/en`,
      hreflang: "en",
    },
    {
      href: `${siteUrl}/zh`,
      hreflang: "zh-CN",
    },
  ],
  priority: 0.7,
  changefreq: "daily",
  // 小型站点可关闭 index sitemap
  generateIndexSitemap: false,
};
