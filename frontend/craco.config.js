// craco.config.js
module.exports = {
  webpack: {
    configure: (config) => {
      const rule = config.module.rules.find(
        (r) => r.use && r.use.some((u) => u.loader && u.loader.includes('source-map-loader'))
      );
      if (rule) {
        if (!rule.exclude) rule.exclude = [];
        rule.exclude.push(/node_modules\/jspdf/);
      }
      return config;
    },
  },
};
