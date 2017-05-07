# About Me
Hi, I'm a 19-year-old web developer from the Philippines taking Information Technology Entrepreneurship at Ateneo de Manila University.
So, I see you've stumbled upon my node package. *Hmmmm*, I don't really have time to say much right now but I'll try my best to document everything.

##### Want to get in touch with me?
Contact me here: johnmichaeldc@gmail.com. Visit my website too mikedelcastillo.github.io.

# What is this?

This is a package that combines a lot of the packages I use and houses lots of methods that just make life a little easier for me.

Some highlights about this package
- Most functions are executed synchronously.
- Easy use with JSON – reading, writing, parsing & stringifying.
- Easy Pug compiling with PHP filter support.
- SASS rendering along with CSS autoprefixing.
- Easier handling of files and directories.
- CSS and HTML files are beautified by default since Pug and SASS doesn't really do a good job at that.
- Recursively compresses and resizes all images in a directory.


# Use
Run `npm install mike-node` in Terminal or what ever lel and put this in your JavaScript file.
```js   
var mike = require('mike-node');
```
# Methods
Olrayt lets get on with it.

### mike.mkdir(path)
This `mkdir` differs from `fs`'s or `fs-extra`'s as it creates all the directories that lead up to the last directory in the `path` argument. This means passing `"some/body/once"` to the function will create 3 folders that take the structure of the path if those directories dont exist.

### mike.write(file, content)
Self-explanatory; this writes a file with the 2nd argument as its content. This calls the `mkdir` function on the directory leading up to the file's directory to make sure the file gets written. The example below will auto-create the folders if they dont exist and will write the file as well with the right content.
```js
mike.write("some/body/once/told.me", "the world");
```

### mike.read(file)
Self-explanatory.

### mike.ls(path)
Returns an array of all the files and folders in a directory.

### mike.exists(path)
### mike.file(file)
### mike.dir(path)
### mike.copy(input, output, obj)
### mike.empty(path)
### mike.watch(path, callback)
### mike.sweep(path)

### mike.json
### mike.json.parse(string)
### mike.json.stringify(string)
### mike.json.read(file)
### mike.json.write(file, object)

### mike.csv
### mike.csv.parse(string, object)
```js
var array = mike.csv.parse(csv, {
  useHeaders: true,
  toJSON: true,
  pretty: true,
  parseBoolean: true,
  parseNumber: true,
  separator: ","
});
```

### mike.beautify
### mike.beautify.html(html)
### mike.beautify.css(css)

### mike.pug
### mike.pug.compile(file, options)
### mike.pug.write(file, options, path, data)

### mike.css
### mike.css.autoprefix(css)

### mike.sass
### mike.sass.render(file)
### mike.sass.write(file, path)
### mike.sass.files(input, output)
### mike.sass.watch(input, output)

### mike.img
### mike.img.is(file)
### mike.img.size(file)
### mike.img.resize(file, a, b, c, d)
### mike.img.compress(file, path, callback)

### mike.imgs
### mike.imgs.resize(input, output)
### mike.imgs.compress(input, output)
### mike.imgs.resize(input, output, versions, callback)
### mike.imgs.resizeAndCompress(input, output, versions)
```js
{
  prefix: ___,
  affix: ___,
  width: ___,
  height: ___,
  size: ___,
  maxSize: ___
}
```
Example use case
```js
mike.empty("img");

mike.imgs.resizeAndCompress("oimg", "img", [
  {
    affix: "-small",
    maxSize: 200
  },
  {
    affix: "-medium",
    maxSize: 500
  },
  {
    affix: "-large",
    maxSize: 1920
  },
  {
    maxSize: 9999
  }
]);
```
