var config = {};

config.addon = {
  set state (val) {app.storage.write("state", val)},
  get state () {return app.storage.read("state") !== undefined ? app.storage.read("state") : "enabled"}
};

config.welcome = {
  set lastupdate (val) {app.storage.write("lastupdate", val)},
  get lastupdate () {return app.storage.read("lastupdate") !== undefined ? app.storage.read("lastupdate") : 0}
};

config.header = {
  set array (val) {app.storage.write("header", JSON.stringify(val))},
  get array () {return app.storage.read("header") !== undefined ? JSON.parse(app.storage.read("header")) : []}
};