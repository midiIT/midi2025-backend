/** @type {import('pm2').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  apps: [
    {
      name: "MIDI Backend",
      script: "bundle.js",
      env: {
        PORT: 8000,
        NODE_ENV: "production",
      },
    },
  ],
};
