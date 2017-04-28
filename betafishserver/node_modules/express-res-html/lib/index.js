/**
 * Create by Hansel on 2015-7-15
 * @api wrap response
 */

var defaultSettings = {
  lang: null,
  title: null,
  doctype: 'html5',
  variable: [],
  meta: [],
  css: [],
  js: [],
  body: {}
};


module.exports = function(req, res, next) {

  res.html = function(options) {

    var settings = extend(defaultSettings, options)

    var headFragment = headClose(meta(), css(), title(), variable(), js())
    var bodyFragment = bodyClose()
    var htmlFragment = htmlClose(headFragment, bodyFragment)

    this.set("Content-Type", "text/html")
    this.end(doctype() + htmlFragment)


    function doctype() {
      return '<!doctype html>'
    }

    function htmlClose() {
      var args = Array.prototype.slice.call(arguments);
      var fragment = '<html'
      if (settings.lang) {
        fragment += ' lang="'+settings.lang+'"'
      }

      fragment += '>'
      fragment += args.join('')
      fragment += '</html>'

      return fragment
    }

    function headClose() {
      var fragment = '<head>'
      var args = Array.prototype.slice.call(arguments);
      fragment += args.join('')
      fragment += '</head>'
      return fragment
    }

    function bodyClose() {
      var fragment = '<body'

      if (settings.body.id) {
        fragment += ' id="'+ settings.body.id + '"'
      }


      if (settings.body.class) {
        var _len = settings.body.class.length
        if (_len) {
          fragment += ' class="'

          for (var i=0;i<_len;i++) {
            fragment += settings.body.class[i] + ' '
          }

          fragment = fragment.substr(0, fragment.length-1)
        }
        fragment += '"'
      }

      fragment += '>'

      if (settings.body.childNodes) {
        fragment += settings.body.childNodes
      }

      fragment += '</body>'

      return fragment

    }


    function meta(){
      var fragment = ''
      var _len = settings.meta.length

      if (_len) {

        for(var i=0;i<_len;i++) {

          fragment += '<meta'
          var metaItem = settings.meta[i]
          if (metaItem.charset) {
            fragment += ' charset="' + metaItem.charset+'"'
          } else if (metaItem['http-equiv']) {
            fragment += ' http-equiv="' + metaItem['http-equiv']+'"'
          } else {
            if (metaItem.name) {
              fragment += ' name="' + metaItem.name +'"'
            }
            if (metaItem.content) {
              fragment += ' content="' + metaItem.content +'"'
            }
          }

          fragment += '>'

        }

      }

      return fragment

    }


    function title(){
      var fragment = '<title>'

      if (settings.title) {
        fragment += settings.title
      }

      fragment += '</title>'

      return fragment
    }

    function css() {

      var fragment = ''
      var _len = settings.css.length

      if (_len){

        for (var i=0;i<_len;i++) {
          fragment +=  '<link rel="stylesheet" href="'+settings.css[i]+'"/>'
        }
      }

      return fragment

    }

    function variable(){
      var fragment = ''
      var _len = settings.variable.length
      if (_len) {
        fragment = '<script>'

        for (var i=0;i<_len;i++) {

          map(settings.variable[i], function(val, key){

            fragment += 'var ' + key + '='
            if (typeof val != 'object') {
              fragment += '"' + val + '"'
            } else {
              fragment += JSON.stringify(val)
            }
            fragment += ';'

          })

        }

        fragment += '</script>'
      }

      return fragment
    }


    function js() {

      var fragment = ''
      var _len = settings.js.length

      if (_len) {

        for (var i=0;i<_len; i++) {
          fragment += '<script src="'+settings.js[i]+'"></script>'
        }

      }

      return fragment

    }

  }

  next()

}



/**
 * Extend multi objects.
 * @returns {object}
 */
function extend() {
  var result = {};
  var objs = Array.prototype.slice.call(arguments,0);
  objs.forEach(function(props, index){
    for(var prop in props) {
      if(props.hasOwnProperty(prop)) {
        result[prop] = props[prop]
      }
    }
  });
  return result;
}

/**
 * map
 * @param obj
 * @param callback
 * @returns {{}}
 */
function map(obj, callback) {
  var result = {};
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof callback === 'function') {
        result[key] = callback.call(obj, obj[key], key, obj);
      }
    }
  }
  return result;
}