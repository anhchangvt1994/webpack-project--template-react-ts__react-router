module.exports = {
  plugins: [
    "postcss-preset-env",
    "autoprefixer",
    require("tailwindcss")("./tailwind.config.js"),
  ],
};
