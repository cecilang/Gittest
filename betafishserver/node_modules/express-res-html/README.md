# express-res-html
res.html() middlewire

## Get-started

    var app = express()
    app.use(require('express-res-html'))

    app.route('/reshtml').get(function(req, res){

      res.html({
        title: "demo",
        variable: [
          {ENV: 'development'},
          {user: {name: 'Hansel'}}
        ],
        meta: [
          {charset: 'UTF-8'},
          {name: 'viewport', content: 'width=device-width, initial-scale=1, user-scalable=0, user-scalable=no'}
        ],
        css: [
         '/assets/app.css'
        ],
        body: {
         id: 'view-scope'
        }
      })


    })

    // output:

    <!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0, user-scalable=no"><link rel="stylesheet" href="/assets/app.css"/><title>demo</title><script>var ENV="development";var user={"name":"Hansel"};</script></head><body id="view-scope"></body></html>



## Options

### title

### js

### variable

### css

### meta

### body

##### body.id
##### body.class
##### body.childNodes

### lang

### doctype