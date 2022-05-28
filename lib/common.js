var core = {
  "start": function () {
    core.load();
  },
  "install": function () {
    core.load();
  },
  "load": function () {
    core.netrequest.register();
  },
  "update": {
    "toolbar": {
      "button": function () {
        var current = config.addon.state === "enabled" ? "ON" : "OFF";
        /*  */
        app.button.icon(null, config.addon.state);
        app.button.title(null, "Modify Header Value: " + current);
      }
    }
  },
  "netrequest": {
    "register": async function () {
      core.update.toolbar.button();
      /*  */
      await app.netrequest.display.badge.text(false);
      await app.netrequest.remove.action.type("modifyHeaders", "requestHeaders");
      /*  */
      if (config.addon.state === "enabled") {
        for (var i = config.header.array.length - 1; i >= 0; i--) {
          var header = config.header.array[i];
          if (header) {
            if (header.state === "active") {
              var target = {};
              /*  */
              if (header.checked_r) target = {"operation": "remove", "header": header.name};
              if (header.checked_m) target = {"operation": "set", "header": header.name, "value": header.value};
              /*  */
              var resourceTypes = ["main_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "webtransport", "webbundle", "other"];
              if (header.checked_s) {
                resourceTypes.push("sub_frame");
              }
              /*  */
              var rule = {
                "id": i + 1,
                "priority": i + 1,
                "condition": {
                  "resourceTypes": resourceTypes,
                  "isUrlFilterCaseSensitive": false,
                  "regexFilter": header.url ? header.url : '.*',
                  "requestMethods": ["connect", "delete", "get", "head", "options", "patch", "post", "put"]
                }
              };
              if (header.checked_a) {
                rule.action = {
                  "type": "allow"
                };
              } else if (header.checked_aa) {
                rule.action = {
                  "type": "allowAllRequests"
                };
                rule.condition.resourceTypes = header.checked_s ? ["main_frame", "sub_frame"] : ["main_frame"];
                delete rule.condition.requestMethods;
              } else if (header.checked_b) {
                rule.action = {
                  "type": "block"
                };
              } else {
                rule.action = {
                  "type": "modifyHeaders",
                  "requestHeaders": [target]
                };
              }
              app.netrequest.rules.add(rule);
            }
          }
        }
      }
      /*  */
      await app.netrequest.rules.update();
    }
  }
};

app.options.receive("store", function (e) {
  config.header.array = e.headerArray;
  core.netrequest.register();
});

app.popup.receive("load", function () {
  app.popup.send("storage", {
    "state": config.addon.state
  });
});

app.options.receive("load", function () {
  app.options.send("storage", {
    "log": config.addon.log,
    "headerArray": config.header.array
  });
});

app.popup.receive("state", function () {
  config.addon.state = config.addon.state === "disabled" ? "enabled" : "disabled";
  core.netrequest.register();
  /*  */
  app.popup.send("storage", {
    "state": config.addon.state
  });
});

app.popup.receive("reload", app.tab.reload);
app.popup.receive("options", app.tab.options);

app.on.startup(core.start);
app.on.installed(core.install);
