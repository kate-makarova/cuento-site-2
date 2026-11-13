module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/styles.css");
  eleventyConfig.addPassthroughCopy("src/cuento-2.png");
  eleventyConfig.addPassthroughCopy("src/dominion.png");
  eleventyConfig.addPassthroughCopy("src/cruce.png");
  eleventyConfig.addPassthroughCopy("src/cuento-2-trimmed.png");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addPassthroughCopy("src/apple-touch-icon.png");
  eleventyConfig.addPassthroughCopy("src/.nojekyll");
  eleventyConfig.addPassthroughCopy("src/CNAME");

  eleventyConfig.addCollection("devDocs", api =>
    api.getFilteredByGlob("src/developers/*.md")
       .sort((a, b) => (a.data.nav_order || 0) - (b.data.nav_order || 0))
  );
  eleventyConfig.addCollection("adminDocs", api =>
    api.getFilteredByGlob("src/admins/*.md")
       .sort((a, b) => (a.data.nav_order || 0) - (b.data.nav_order || 0))
  );
  eleventyConfig.addCollection("playerDocs", api =>
    api.getFilteredByGlob("src/players/*.md")
       .sort((a, b) => (a.data.nav_order || 0) - (b.data.nav_order || 0))
  );

  eleventyConfig.addCollection("ruDevDocs", api =>
    api.getFilteredByGlob("src/ru/developers/*.md")
       .sort((a, b) => (a.data.nav_order || 0) - (b.data.nav_order || 0))
  );
  eleventyConfig.addCollection("ruAdminDocs", api =>
    api.getFilteredByGlob("src/ru/admins/*.md")
       .sort((a, b) => (a.data.nav_order || 0) - (b.data.nav_order || 0))
  );
  eleventyConfig.addCollection("ruPlayerDocs", api =>
    api.getFilteredByGlob("src/ru/players/*.md")
       .sort((a, b) => (a.data.nav_order || 0) - (b.data.nav_order || 0))
  );

  return {
    pathPrefix: "/",
    dir: {
      input: "src",
      output: "_site",
      layouts: "_layouts"
    }
  };
};
