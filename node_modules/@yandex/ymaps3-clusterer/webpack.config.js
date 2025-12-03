module.exports = (args, env, dir = process.cwd()) => {
    return require('@yandex/ymaps3-cli/webpack.config')(args, env, dir);
}
