const webpack = require("webpack");

class RuntimeUpdateValue {
  _pluginFn = null;
  _options = null;

  constructor(pluginFn, options) {
    this._pluginFn = pluginFn;
    this._options = options;
  }

  async getValue() {
    let tmpPluginValue =
      typeof this._pluginFn === "function" ? this._pluginFn() : this._pluginFn;
    tmpPluginValue =
      (await tmpPluginValue?.then?.(function (data) {
        return data;
      })) ?? tmpPluginValue;

    return typeof tmpPluginValue === "object" &&
      tmpPluginValue instanceof Object &&
      !Array.isArray(tmpPluginValue)
      ? { ...tmpPluginValue, date: Date.now() }
      : tmpPluginValue;
  }

  setRuntime(pluginKey, instanceOfPlugin, compiler) {
    if (!pluginKey || !instanceOfPlugin || !this._options || !compiler) return;

    const self = this;

    compiler.hooks.watchRun.tapAsync("MyPlugin", async (compilation, cb) => {
      if (
        compilation.modifiedFiles &&
        [...compilation.modifiedFiles][0] === this._options.fileDependencies
      ) {
        instanceOfPlugin.definitions[pluginKey] = await self.getValue();
      }
      cb();
    });

    compiler.hooks.afterCompile.tap("MyPlugin", (compilation) => {
      compilation.fileDependencies.add(this._options.fileDependencies);
    });
  }
}

class WebpackCustomizeDefinePlugin {
  _objPlugin = null;

  constructor(objPlugin) {
    this._objPlugin = objPlugin;
  }

  async apply(compiler) {
    if (
      !compiler ||
      !this._objPlugin ||
      !(
        typeof this._objPlugin === "object" &&
        this._objPlugin instanceof Object &&
        !Array.isArray(this._objPlugin)
      )
    )
      return;

    const objInstanceOfPlugin = {};

    // NOTE - The key is name of plugin that we want to define in project
    for (const key in this._objPlugin) {
      if (this._objPlugin[key] instanceof RuntimeUpdateValue) {
        objInstanceOfPlugin[key] = new webpack.DefinePlugin({
          [key]: await this._objPlugin[key].getValue(),
        });
        objInstanceOfPlugin[key].apply(compiler);
        this._objPlugin[key].setRuntime(
          key,
          objInstanceOfPlugin[key],
          compiler
        );
      } else if (
        typeof this._objPlugin[key] === "string" ||
        (typeof this._objPlugin[key] === "object" &&
          this._objPlugin[key] instanceof Object)
      ) {
        objInstanceOfPlugin[key] = new webpack.DefinePlugin({
          [key]: this._objPlugin[key],
        });
        objInstanceOfPlugin[key].apply(compiler);
        continue;
      }
    }
  }

  static RuntimeUpdateValue(pluginFn, options) {
    return new RuntimeUpdateValue(pluginFn, options);
  }
}

module.exports = { WebpackCustomizeDefinePlugin };
