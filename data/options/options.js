var background = (function () {
  var tmp = {};
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    for (var id in tmp) {
      if (tmp[id] && (typeof tmp[id] === "function")) {
        if (request.path === "background-to-options") {
          if (request.method === id) {
            tmp[id](request.data);
          }
        }
      }
    }

    sendResponse();
  });
  /*  */
  return {
    "receive": function (id, callback) {
      tmp[id] = callback;
    },
    "send": function (id, data) {
      chrome.runtime.sendMessage({
        "method": id, 
        "data": data,
        "path": "options-to-background"
      });
    }
  }
})();

var config = {
  "header": {
    "array": []
  },
  "store": function (render) {
    background.send("store", {"headerArray": config.header.array});
    if (render) config.render({"headerArray": config.header.array});
  },
  "load": function () {
    document.getElementById("input-field-add").addEventListener("click", config.storage.add);
    /*  */
    document.addEventListener("keypress", function (e) {
      var active = document.activeElement;
      if (active) {
        var tr = active.closest("tr");
        if (tr) {
          var id = tr.getAttribute("id");
          if (id) {
            if (id === "input-field") {
              if (e.key === "Enter" || e.code === "Enter") {
                config.storage.add();
              }
            }
          }
        }
      }
    });
    /*  */
    background.send("load");
    window.removeEventListener("load", config.load, false);
  },
  "handle": {
    "checkbox": function (e) {
      var tr = e.target.closest("tr");
      if (tr) {
        var allow = tr.querySelector("input[rule='allow']");
        var allowAll = tr.querySelector("input[rule='allow-all']");
        var modify = tr.querySelector("input[rule='modify']");
        var remove = tr.querySelector("input[rule='remove']");
        var block = tr.querySelector("input[rule='block']");
        /*  */
        if (e.target.getAttribute("rule") === "allow") {
          allowAll.checked = false;
          modify.checked = false;
          remove.checked = false;
          block.checked = false;
        }
        /*  */
        if (e.target.getAttribute("rule") === "allow-all") {
          allow.checked = false;
          modify.checked = false;
          remove.checked = false;
          block.checked = false;
          }
        /*  */
        if (e.target.getAttribute("rule") === "modify") {
          allow.checked = false;
          allowAll.checked = false;
          remove.checked = false;
          block.checked = false;
        }
        /*  */
        if (e.target.getAttribute("rule") === "remove") {
          allow.checked = false;
          allowAll.checked = false;
          modify.checked = false;
          block.checked = false;
        }
        /*  */
        if (e.target.getAttribute("rule") === "block") {
          allow.checked = false;
          allowAll.checked = false;
          modify.checked = false;
          remove.checked = false;
        }
      }
    }
  },
  "storage": {
    "remove": function (e) {
      var tr = e.target.closest("tr");
      if (tr) {
        var index = tr.getAttribute("index");
        if (index !== undefined) {
          var tmp = [...config.header.array].reverse();
          tmp.splice(index, 1);
          config.header.array = tmp.reverse();
          config.store(true);
        }
      }
    },
    "state": function (e) {
      var tr = e.target.closest("tr");
      if (tr) {
        var index = tr.getAttribute("index");
        if (index !== undefined) {
          var tmp = [...config.header.array].reverse();
          tmp[index].state = tmp[index].state === "active" ? "inactive" : "active";
          config.header.array = tmp.reverse();
          config.store(true);
        }
      }
    },
    "update": function (e, render) {
      config.handle.checkbox(e);
      /*  */
      var tmp = [];
      var tbody = document.getElementById("header-value-tbody");
      var trs = [...tbody.querySelectorAll("tr")];
      /*  */
      if (trs && trs.length) {
        for (var i = 0; i < trs.length; i++) {
          if (trs[i]) {
            tmp.push({
              "url": trs[i].querySelector("input[rule='url']").value.trim(),
              "name": trs[i].querySelector("input[rule='name']").value.trim(),
              "value": trs[i].querySelector("input[rule='value']").value.trim(),
              "state": trs[i].querySelector("td[type='toggle']").textContent,
              "checked_d": trs[i].querySelector("input[rule='domain']").checked,
              "checked_s": trs[i].querySelector("input[rule='sub']").checked,
              "checked_a": trs[i].querySelector("input[rule='allow']").checked,
              "checked_aa": trs[i].querySelector("input[rule='allow-all']").checked,
              "checked_m": trs[i].querySelector("input[rule='modify']").checked,
              "checked_r": trs[i].querySelector("input[rule='remove']").checked,
              "checked_b": trs[i].querySelector("input[rule='block']").checked
            });
          }
        }
      }
      /*  */
      if (tmp && tmp.length) {
        if (tmp.length === config.header.array.length) {
          config.header.array = tmp.reverse();
          config.store(render ? render : false);
        }
      }
    },
    "add": function () {
      var obj = {
        "url": '',
        "name": '',
        "value": '',
        "state": "active",
        "checked_d": true,
        "checked_s": true,
        "checked_a": false,
        "checked_aa": false,
        "checked_m": false,
        "checked_r": false,
        "checked_b": false
      };
      /*  */
      var tr = document.getElementById("input-field");
      var url = tr.children[0].children[0];
      var name = tr.children[1].children[0];
      var value = tr.children[2].children[0];
      obj.url = url.value.trim();
      obj.name = name.value.trim();
      obj.value = value.value.trim();
      if (config.header.array && config.header.array.length) {
        config.header.array = config.header.array.filter(function (e) {
          return e.url !== obj.url || e.name !== obj.name || e.value !== obj.value;
        });
      }
      /*  */
      config.header.array.push(obj);
      config.store(true);
    }
  },
  "render": function (o) {
    var count = 1;
    var tbody = document.getElementById("header-value-tbody");
    config.header.array = o.headerArray !== undefined ? o.headerArray : [];
    /*  */
    tbody.textContent = '';
    for (var i = config.header.array.length - 1; i >= 0; i--) {
      var url = document.createElement("td");
      var sub = document.createElement("td");
      var allow = document.createElement("td");
      var allowAll = document.createElement("td");
      var name = document.createElement("td");
      var close = document.createElement("td");
      var value = document.createElement("td");
      var toggle = document.createElement("td");
      var header = document.createElement("tr");
      var number = document.createElement("td");
      var modify = document.createElement("td");
      var domain = document.createElement("td");
      var remove = document.createElement("td");
      var block = document.createElement("td");
      var input_d = document.createElement("input");
      var input_s = document.createElement("input");
      var input_a = document.createElement("input");
      var input_aa = document.createElement("input");
      var input_m = document.createElement("input");
      var input_r = document.createElement("input");
      var input_b = document.createElement("input");
      var input_u = document.createElement("input");
      var input_n = document.createElement("input");
      var input_v = document.createElement("input");
      /*  */
      url.setAttribute("type", "url");
      sub.setAttribute("type", "check");
      name.setAttribute("type", "name");
      allow.setAttribute("type", "check");
      allowAll.setAttribute("type", "check");
      value.setAttribute("type", "value");
      close.setAttribute("type", "close");
      domain.setAttribute("type", "check");
      modify.setAttribute("type", "check");
      remove.setAttribute("type", "check");
      block.setAttribute("type", "check");
      toggle.setAttribute("type", "toggle");
      number.setAttribute("type", "number");
      /*  */
      close.textContent = '⛌';
      number.textContent = count;
      input_u.value = config.header.array[i].url;
      input_n.value = config.header.array[i].name;
      input_v.value = config.header.array[i].value;
      toggle.textContent = config.header.array[i].state;
      /*  */
      input_s.setAttribute("rule", "sub");
      input_a.setAttribute("rule", "allow");
      input_aa.setAttribute("rule", "allow-all");
      input_u.setAttribute("rule", "url");
      input_u.setAttribute("type", "text");
      input_n.setAttribute("type", "text");
      input_n.setAttribute("rule", "name");
      input_v.setAttribute("type", "text");
      input_v.setAttribute("rule", "value");
      input_d.setAttribute("rule", "domain");
      input_m.setAttribute("rule", "modify");
      input_r.setAttribute("rule", "remove");
      input_b.setAttribute("rule", "block");
      input_d.setAttribute("type", "checkbox");
      input_s.setAttribute("type", "checkbox");
      input_a.setAttribute("type", "checkbox");
      input_aa.setAttribute("type", "checkbox");
      input_m.setAttribute("type", "checkbox");
      input_r.setAttribute("type", "checkbox");
      input_b.setAttribute("type", "checkbox");
      /*  */
      input_d.checked = config.header.array[i].checked_d;
      input_s.checked = config.header.array[i].checked_s;
      input_a.checked = config.header.array[i].checked_a;
      input_aa.checked = config.header.array[i].checked_aa;
      input_m.checked = config.header.array[i].checked_m;
      input_r.checked = config.header.array[i].checked_r;
      input_b.checked = config.header.array[i].checked_b;
      /*  */
      close.addEventListener("click", config.storage.remove);
      toggle.addEventListener("click", config.storage.state);
      input_d.addEventListener("change", config.storage.update);
      input_s.addEventListener("change", config.storage.update);
      input_a.addEventListener("change", config.storage.update);
      input_aa.addEventListener("change", config.storage.update);
      input_m.addEventListener("change", config.storage.update);
      input_r.addEventListener("change", config.storage.update);
      input_b.addEventListener("change", config.storage.update);
      input_u.addEventListener("change", config.storage.update);
      input_n.addEventListener("change", config.storage.update);
      input_v.addEventListener("change", config.storage.update);
      /*  */
      header.setAttribute("index", count - 1);
      toggle.setAttribute("state", config.header.array[i].state);
      header.setAttribute("state", config.header.array[i].state);
      /*  */
      url.appendChild(input_u);
      domain.appendChild(input_d);
      sub.appendChild(input_s);
      name.appendChild(input_n);
      allow.appendChild(input_a);
      allowAll.appendChild(input_aa);
      modify.appendChild(input_m);
      remove.appendChild(input_r);
      block.appendChild(input_b);
      value.appendChild(input_v);
      /*  */
      header.appendChild(number);
      header.appendChild(url);
      header.appendChild(domain);
      header.appendChild(sub);
      header.appendChild(name);
      header.appendChild(allow);
      header.appendChild(allowAll);
      header.appendChild(modify);
      header.appendChild(remove);
      header.appendChild(block);
      header.appendChild(value);
      header.appendChild(toggle);
      header.appendChild(close);
      tbody.appendChild(header);
      count++;
    }
    /*  */
    Sortable.create(tbody, {
      "items": "tr",
      "animation": 200,
      "onEnd": function (e) {
        config.storage.update(e, true);
      }
    });
  }
};

background.receive("storage", config.render);
window.addEventListener("load", config.load, false);
