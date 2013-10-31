// Generated by CoffeeScript 1.6.2
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('models/SectionModel', ['models/ProtoModel', 'helpers'], function(ProtoModel, helpers) {
    var SectionModel, _ref;

    SectionModel = (function(_super) {
      __extends(SectionModel, _super);

      function SectionModel() {
        _ref = SectionModel.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      SectionModel.prototype.url = 'section';

      SectionModel.prototype.defaults = {
        name: '',
        author: '',
        email: '',
        website: '',
        license: false,
        isClosed: false,
        moderated: false,
        icons: []
      };

      SectionModel.prototype.initialize = function(o) {
        this.o = o != null ? o : {};
        SectionModel.__super__.initialize.apply(this, arguments);
        return this;
      };

      return SectionModel;

    })(ProtoModel);
    return SectionModel;
  });

}).call(this);
