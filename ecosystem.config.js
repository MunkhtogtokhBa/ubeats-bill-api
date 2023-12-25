module.export = {
    apps: [
        {
            name: "print-bill",
            script: "./app.js",
            instances: 1,
            exec_mode: 'fork'
        }
    ]
}