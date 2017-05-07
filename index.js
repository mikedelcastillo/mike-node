var mike = {
  silent: true,
  modules: {},
  defaults: {
    pug: {
      options: {
        pretty: true
      }
    },
    beautify: {
      enable: true,
      html: {
        indent_size: 2,
        wrap_line_length: 0,
        indent_inner_html: true,
        extra_liners: []
      },
      css: {
        indent_size: 2,
        wrap_line_length: 0
      }
    }
  }
};

//LOAD ALL MODULES

mike.modules.fs = require('fs-extra');
mike.modules.path = require('path');
mike.modules.isImage = require('is-image');
mike.modules.imageSize = require('image-size');
mike.modules.sharp = require('sharp');

mike.modules.pug = {
  pug: require('pug'),
  php: require('pug-php-filter')
};

mike.modules.pug.pug.filters.php = mike.modules.pug.php;

mike.modules.beautify = {
  html: require('js-beautify').html,
  css: require('js-beautify').css
};

mike.modules.imagemin = {
  imagemin: require('imagemin'),
  jpegtran: require('imagemin-jpegtran'),
  pngquant: require('imagemin-pngquant'),
  optipng: require('imagemin-optipng'),
  jpegrecompress: require('imagemin-jpeg-recompress')
};

mike.modules.autoprefixer = require('autoprefixer');
mike.modules.postcss = require('postcss');
mike.modules.sass = require('node-sass');

var M = mike.modules;
if(module)
  module.exports = mike;

//METHODS

  //FILES

    mike.read = function(file, type){
      type = type ? type : 'utf-8';
      return M.fs.readFileSync(file, type);
    };

    mike.write = function(file, content){
      var dir = file.split('/');
      dir.pop();
      mike.mkdir(dir.join('/'));
      M.fs.writeFileSync(file, content);
    }

    mike.copy = function(input, output, obj){
      M.fs.copySync(input, output, obj);
    };

    mike.empty = function(path){
      if(mike.exists(path))
        M.fs.emptyDirSync(path);
    };

    mike.ls = function(path){
      return M.fs.readdirSync(path);
    };

    mike.exists = function(file){
      return M.fs.existsSync(file);
    };

    mike.file = function(file){
      if(!mike.exists(file)) return false;
      return M.fs.statSync(file).isFile();
    };

    mike.dir = function(path){
      if(!mike.exists(path)) return false;
      return M.fs.statSync(path).isDirectory();
    };

    mike.sweep = function(path){
      var files = [path];
      var dirs = [];
      var hasDir = true;

      while(hasDir){
        hasDir = false;
        for(var i in files){
          var file = files[i];
          if(mike.dir(file)){
            hasDir = true;

            dirs.push(
            files.splice(
            files.indexOf(file), 1)[0]);

            mike.ls(file).forEach(
            function(_f){
              files.push(file + "/" + _f);
            });
          }
        }
      }

      return {
        files: files,
        dirs: dirs
      };
    };

    mike.mkdir = function(dir){
      var dirs = dir.split("/"),
          paths = [];



      for(var i = 0; i < dirs.length; i++){
        var path = "";
        for(var j = 0; j <= i; j++)
          if(dirs[j].length)
            path += dirs[j] + "/";
        paths.push(path);
      }

      paths.forEach(function(path){
        if(!mike.exists(path) && path.length)
          M.fs.mkdirSync(path);
      });
    };

    mike.watch = function(path, callback){
      var out = {
        watches: [],
        close: function(){
          this.watches.forEach(function(w){
            w.close();
          });
        }
      };
      mike.sweep(path).files.forEach(function(file){
        out.watches.push(M.fs.watch(file, callback));
      });

      return out;
    };

  //JSON

    mike.json = {};

    mike.json.parse = function(string){
      return JSON.parse(string);
    };

    mike.json.stringify = function(object){
      return JSON.stringify(object, null, 2);
    };

    mike.json.read = function(file){
      return mike.json.parse(mike.read(file));
    };

    mike.json.write = function(file, object){
      mike.write(file, mike.json.stringify(object));
    };

    //SHORTCUTS

      mike.json.p = mike.json.parse;
      mike.json.s = mike.json.stringify;
      mike.json.r = mike.json.read;
      mike.json.w = mike.json.write;

  //CSV

    mike.csv = {};

    mike.csv.parse = function(string, options){
      options = options || {};
      options.separator = options.separator || ",";
      if(options.parseNumber == null) options.parseNumber = true;
      if(options.parseBoolean == null) options.parseBoolean = true;
      var nlreg = new RegExp("(?!\B\"[^\"]*)\n(?![^\"]*\"\B)", "g");
      var cmreg = new RegExp("(?!\B\"[^\"]*)" + options.separator + "(?![^\"]*\"\B)", "g");
      var breaks = string.split(nlreg);
      var output = [], i, j, k;

      var getLineValues = function(line){
        var values = [];
        var commas = line.split(cmreg);
        for(k = 0; k < commas.length; k++){
          var value = commas[k];
          if(value.substr(0, 1) == "\"" && value.substr(-1) == "\"")
            value = value.substr(1, value.length - 2);

          value = value.trim();

          if(!isNaN(value) && value.length && options.parseNumber)
            value = Number(value);
          if(value.toString().toLowerCase() == "true" && options.parseBoolean)
            value = true;
          if(value.toString().toLowerCase() == "false" && options.parseBoolean)
            value = false;

          values.push(value);
        }

        return values;
      };

      if(options.useHeaders)
        var headers = getLineValues(breaks.shift());

      for(i = 0; i < breaks.length; i++){
        var v = getLineValues(breaks[i]);
        if(options.useHeaders){
          var obj = {};
          for(j = 0; j < v.length; j++){
            obj[headers[j]] = v[j];
          }
          output.push(obj);
        } else{
          output.push(v);
        }
      }

      if(options.toJSON){
        if(options.pretty) return JSON.stringify(output, null, 2)
        return JSON.stringify(output);
      }
      return output;
    };

  //BEAUTIFY

    mike.beautify = {};

    mike.beautify.html = function(html){
      return M.beautify.html(
        html, mike.defaults.beautify.html
      );
    };

    mike.beautify.css = function(css){
      return M.beautify.css(
        css, mike.defaults.beautify.css
      );
    };

  //PUG STUFF

    mike.pug = {};

    mike.pug.compile = function(file, options){
      try{
        if(!options)
          options = mike.defaults.pug.options;
        return M.pug.pug.compileFile(file, options);
      } catch(e){
        console.log(e);
      }
    };

    mike.pug.write = function(file, options, path, data){
      var html = mike.pug.compile(file, options)(data);
      if(mike.defaults.beautify.enable)
        html = mike.beautify.html(html);
      mike.write(path, html);
    };

  //SASS

    mike.sass = {};

    mike.sass.render = function(file){
      try{
        return M.sass.renderSync({
          file: file
        }).css.toString('utf-8');
      } catch(e){
        console.log(e);
      }
    };

    mike.sass.write = function(file, path){
      try{
        var css = mike.sass.render(file);
        css = mike.css.autoprefix(css);
        if(mike.defaults.beautify.enable)
          css = mike.beautify.css(css);
        mike.write(path, css);
      } catch(e){
        console.log(e);
      }
    };

    mike.sass.files = function(input, output){
      mike.sweep(input).files.forEach(function(file){
        var pp = M.path.parse(file);
        var rel = file.replace(input, output);

        if([".sass", ".scss"].indexOf(pp.ext) != -1){
          if(pp.name.substr(0, 1) != "_"){
            mike.sass.write(file, output + "/" + pp.name + ".css");
          }
        }
      });
      if(!mike.silent) console.log("Compiled SASS");
    };

    mike.sass.watch = function(input, output){
      mike.watch(input, function(action){
        mike.sass.files(input, output);
      });
    };

  //CSS

    mike.css = {};

    mike.css.autoprefix = function(css){
      return M.postcss([M.autoprefixer({
        browsers: [
          "> 0%",
          "last 10000 versions"
        ]
      })]).process(css).css;
    };

  //IMAGES

    mike.img = {};

    mike.img.is = function(file){
      return M.isImage(file);
    };

    mike.img.size = function(file){
      return M.imageSize(file);
    };

    mike.img.resize = function(file, a, b, c, d){
      var s = M.sharp(file);
      if(typeof c == "string"){
        s.resize(a, b).toFile(c, function(){
          if(d) d(c);
        });
      }
      else{
        s.resize(a).toFile(b, function(){
          if(c) c(b);
        });
      }
    };

    mike.img.compress = function(file, path, callback){
      M.imagemin.imagemin([file], path, {
        use: [
          M.imagemin.jpegtran(),
          M.imagemin.jpegrecompress(),
          M.imagemin.optipng({
            optimizationLevel: 3
          }),
          M.imagemin.pngquant()
        ]
      }).then(function(files){
        if(callback) callback(file, path, files);
      });
    };

    mike.imgs = {};

    mike.imgs.compress = function(input, output, callback){
      mike.sweep(input).files.forEach(function(file){
        if(mike.img.is(file)){
          var rel = file.split('/');
          var filename = rel.pop();
          rel = rel.join('/');
          rel = rel.replace(input, output);

          mike.img.compress(file, rel, function(){
            if(callback) callback(input, output, callback);
          });
        }
      })
    };

    mike.imgs.resize = function(input, output, versions, callback){
      mike.sweep(input).files.forEach(function(file){
        if(mike.img.is(file)){
          versions.forEach(function(v){
            var rel = file.split('/');
            var filename = rel.pop().split(".");
            var ext = filename.pop();
            filename = filename.join(".");
            rel = rel.join('/');
            rel = rel.replace(input, output);

            if(!v.prefix) v.prefix = "";
            if(!v.affix) v.affix = "";

            filename = v.prefix + filename + v.affix;

            mike.mkdir(rel);
            var path = rel + "/" + filename + "." + ext;

            if(v.maxSize != null){
              var size = mike.img.size(file);
              size = Math.min(size.width, size.height, v.maxSize);
              mike.img.resize(
                file, size,
                path, callback);
            } else if(v.size != null){
              var size = v.size
              mike.img.resize(
                file, size,
                path, callback);
            } else{
              mike.img.resize(
                file, v.height, v.width,
                path,
                callback);
            }
          });
        }
      });
    };

    mike.imgs.resizeAndCompress = function(input, output, versions){
      mike.imgs.resize(input, output, versions, function(file){
        if(!mike.silent) console.log("Resized " + file);
        var rel = file.split('/');
        rel.pop();
        mike.img.compress(file, rel, function(input){
          if(!mike.silent) console.log("Compressed " + input)
        });
      });
    }
