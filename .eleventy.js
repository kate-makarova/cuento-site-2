module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/styles.css");
  eleventyConfig.addPassthroughCopy("src/cuento-2.png");
  eleventyConfig.addPassthroughCopy("src/.nojekyll");

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

  return {
    pathPrefix: "/cuento-site-2/",
    dir: {
      input: "src",
      output: "_site",
      layouts: "_layouts"
    }
  };
};
