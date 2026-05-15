module.exports = {
  apps : [{
    name: "Sistema_Ganadero",
    script: "./node_modules/next/dist/bin/next",
    args: "start",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
}