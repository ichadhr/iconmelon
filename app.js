// Generated by CoffeeScript 1.6.2
(function() {
  var Filter, FilterSchema, Main, Promise, Section, SectionSchema, app, che, express, fs, http, io, main, mongo, path, port;

  express = require('express');

  http = require('http');

  fs = require('fs');

  mongo = require('mongoose');

  path = require('path');

  che = require('cheerio');

  Promise = require('node-promise').Promise;

  port = 3000;

  app = express();

  app.set('port', process.env.PORT || port);

  app.use(express.favicon(__dirname + '/frontend/favicon.ico'));

  app.use(express["static"](__dirname + '/frontend'));

  app.use(express.bodyParser({
    uploadDir: 'uploads'
  }));

  app.use(express.methodOverride());

  mongo.connect('mongodb://localhost/iconmelon');

  SectionSchema = new mongo.Schema({
    name: String,
    author: String,
    email: String,
    website: String,
    creationDate: String,
    icons: Array,
    moderated: Boolean
  });

  SectionSchema.virtual('id').get(function() {
    return this._id.toHexString();
  });

  SectionSchema.set('toJSON', {
    virtuals: true
  });

  Section = mongo.model('Section', SectionSchema);

  FilterSchema = new mongo.Schema({
    name: String,
    author: String,
    email: String,
    hash: String,
    filter: String,
    moderated: Boolean
  });

  Filter = mongo.model('Filter', FilterSchema);

  io = require('socket.io').listen(app.listen(process.env.PORT || port), {
    log: false
  });

  Main = (function() {
    Main.prototype.SVG_PATH = 'frontend/css/';

    function Main(o) {
      this.o = o != null ? o : {};
    }

    Main.prototype.generateMainPageSvg = function() {
      var prm,
        _this = this;

      prm = new Promise();
      this.getIconsData({
        moderated: true
      }).then(function(iconsData) {
        return _this.makeMainSvgFile(iconsData).then(function(data) {
          return _this.writeFile("" + _this.SVG_PATH + "icons-main-page.svg", data).then(function() {
            return prm.resolve();
          });
        });
      });
      return prm;
    };

    Main.prototype.writeFile = function(filename, data) {
      var prm;

      prm = new Promise();
      fs.writeFile(filename, data, function(err) {
        err && (console.error(err));
        return prm.resolve();
      });
      return prm;
    };

    Main.prototype.makeMainSvgFile = function(iconsData, filename) {
      var prm;

      prm = new Promise();
      fs.readFile("" + this.SVG_PATH + "icons.svg", {
        encoding: 'utf8'
      }, function(err, data) {
        data = data.replace(/\<\/svg\>/gi, '');
        data = "" + data + iconsData + "</svg>";
        return prm.resolve(data);
      });
      return prm;
    };

    Main.prototype.getIconsData = function(search) {
      var prm;

      prm = new Promise();
      Section.find(search, function(err, docs) {
        var doc, i, icon, iconData, j, _i, _j, _len, _len1, _ref;

        iconData = '';
        for (i = _i = 0, _len = docs.length; _i < _len; i = ++_i) {
          doc = docs[i];
          _ref = doc.icons;
          for (j = _j = 0, _len1 = _ref.length; _j < _len1; j = ++_j) {
            icon = _ref[j];
            iconData += "<g id='" + icon.hash + "'>" + icon.shape + "</g>";
          }
        }
        return Filter.find(search, function(err, docs) {
          var _k, _len2;

          for (i = _k = 0, _len2 = docs.length; _k < _len2; i = ++_k) {
            doc = docs[i];
            iconData += doc.filter.replace(/\<filter/, "<filter id='" + doc.hash + "'");
          }
          return prm.resolve(iconData);
        });
      });
      return prm;
    };

    return Main;

  })();

  main = new Main;

  io.sockets.on("connection", function(socket) {
    socket.on("sections:read", function(data, callback) {
      return Section.find({
        moderated: true
      }, function(err, docs) {
        return callback(null, docs);
      });
    });
    socket.on("filters:read", function(data, callback) {
      return Filter.find({
        moderated: true
      }, function(err, docs) {
        if (err) {
          callback(500, 'DB error');
          console.error(err);
        }
        return callback(null, docs);
      });
    });
    socket.on("sections-all:read", function(data, callback) {
      return Section.find({}, function(err, docs) {
        return callback(null, docs);
      });
    });
    socket.on("section:create", function(data, callback) {
      data.moderated = false;
      return new Section(data).save(function(err) {
        if (err) {
          callback(500, 'DB error');
          return console.error(err);
        } else {
          return callback(null, 'ok');
        }
      });
    });
    socket.on("section:update", function(data, callback) {
      var id;

      id = data.id;
      delete data._id;
      return Section.update({
        '_id': id
      }, data, {
        upsert: true
      }, function(err) {
        if (err) {
          callback(500, 'DB error');
          console.error(err);
        } else {
          callback(null, 'ok');
        }
        return main.generateMainPageSvg();
      });
    });
    return socket.on("section:delete", function(data, callback) {
      return Section.findById(data.id, function(err, doc) {
        if (err) {
          callback(500, 'DB error');
          console.error(err);
        } else {
          callback(null, 'ok');
        }
        return doc.remove(function(err) {
          if (err) {
            callback(500, 'DB error');
            return console.error(err);
          } else {
            return callback(null, 'ok');
          }
        });
      });
    });
  });

  app.post('/file-upload', function(req, res, next) {
    return fs.readFile(req.files.files[0].path, {
      encoding: 'utf8'
    }, function(err, data) {
      var $;

      $ = che.load(data);
      res.send($('svg').html());
      return fs.unlink(req.files.files[0].path, function(err) {
        return err && console.error(err);
      });
    });
  });

  app.get('/generate-main-svg-data', function(req, res, next) {
    return main.generateMainPageSvg().then(function() {
      return res.send('ok');
    });
  });

}).call(this);
