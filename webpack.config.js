const path = require('path');

module.exports = {
    entry: {
        content: path.join(__dirname, "js/content.js"),
        popup: path.join(__dirname, "js/popup.js")
    },
    output: {
        path: path.join(__dirname, "dist/js"),
        filename: "[name].js",
    },
    resolve: {
        fallback: {
            "path": require.resolve("path-browserify")
        }
    }
};