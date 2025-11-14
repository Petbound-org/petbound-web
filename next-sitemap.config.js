/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://petbound.org',
  generateRobotsTxt: true, // will generate robots.txt automatically
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },            // allow all crawlers
      { userAgent: 'Googlebot', allow: '/' },    // explicitly allow Google
      { userAgent: 'Bingbot', allow: '/' },      // explicitly allow Bing
    ],
    additionalSitemaps: [
      'https://petbound.org/sitemap.xml',        // optional extra sitemaps
    ],
  },
};
