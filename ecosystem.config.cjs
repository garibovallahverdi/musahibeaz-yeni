
module.exports = {
    apps: [
      {
        name: 'musahibe',
        script: 'node_modules/next/dist/bin/next',
        args: 'start', 
        instances: '2', 
        watch:false,
        exec_mode: 'cluster', 
        cwd: 'E:/musahibe.az/musahibeaz-next', 
        env: {
          NODE_ENV: 'production', 
        },
      },
    ],
  };