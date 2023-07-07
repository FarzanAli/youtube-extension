const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        'content-script/index': path.join(__dirname, 'src','content-script','index.jsx'),
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                    }
                }
            },
            {
                test: /\.css$/i,
                include: path.resolve(__dirname, 'src'),
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            }
        ]
    },
    plugins: [
        // new HtmlWebpackPlugin({
        //     template: './src/popup.html',
        //     filename: 'popup.html'
        // }),
        new CopyPlugin({
            patterns: [
                { from: 'public' }
            ]
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: 'src/css/*.css',
                    to({ context, absoluteFilename }){
                        return "content-script/[name][ext]"
                    }
                }
            ]
        })
    ]
}