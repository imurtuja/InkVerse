export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/settings",
        "/verify",
      ],
    },
    sitemap: "https://inkverse.murtuja.in/sitemap.xml",
  };
}
