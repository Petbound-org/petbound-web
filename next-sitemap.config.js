/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://petbound.org',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'Googlebot-Image', allow: '/' },
      { userAgent: 'Googlebot-News', allow: '/' },
      { userAgent: 'Googlebot-Video', allow: '/' },
      { userAgent: 'Bingbot', allow: '/' },
      { userAgent: 'DuckDuckBot', allow: '/' },
      { userAgent: 'Yahoo! Slurp', allow: '/' },
      { userAgent: 'Baiduspider', allow: '/' },
      { userAgent: 'YandexBot', allow: '/' },
      { userAgent: '*', disallow: '/' },
    ],
  },
};
