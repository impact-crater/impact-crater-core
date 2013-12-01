Fs    = require 'fs'
Path  = require 'path'
Log   = require 'log'

class Generator
  constructor: (path, opts) ->
    @path = path
    @templateDir = "#{__dirname}/../templates"
    @logger = new Log(opts.logging)

  # Make a directory
  mkdir: (path) ->
    Fs.exists path, (exists)->
      unless exists
        Fs.mkdirSync path, 0o0755

  # Copy a file
  copy: (from, to, callback) ->
    Fs.readFile from, "utf8", (err,data) =>
      @logger.info "Copying #{Path.basename(Path.resolve(from))} to #{to}"
      Fs.writeFileSync to, data, "utf8"

      callback(err, to) if callback?

  # Rename a file
  rename: (from, to, callback) ->
    Fs.rename from, to, (err, data) =>
      @logger.info "Renaming #{Path.basename(Path.resolve(from))} to #{to}"

      callback(err, to) if callback?

  run: ->
    @logger.info "Creating an impact-crater project folder in #{@path}"

    # Setup our new project directory
    @mkdir(@path)

    # TODO Make this more package oriented so we can have different game templates
    #
    # Setup/Copy over impact plugins
    @mkdir("#{@path}/impact")
    @mkdir("#{@path}/impact/lib")
    @mkdir("#{@path}/impact/lib/plugins")
    @mkdir("#{@path}/impact/lib/game")
    @mkdir("#{@path}/impact/lib/game/entities")
    @mkdir("#{@path}/impact/lib/game/server")
    @mkdir("#{@path}/impact/lib/game/server/entities/")

    plugins = [
      'client.js'
      'server.js'
    ]
    for file in plugins
      @copy "#{@templateDir}/basic/impact/lib/plugins/#{file}", "#{@path}/impact/lib/plugins/#{file}"

    # Setup/Copy over public files
    @mkdir("#{@path}/public")
    @copy "#{@templateDir}/basic/public/index.ejs", "#{@path}/public/index.ejs"

    # Setup/Copy over server files
    @mkdir("#{@path}/server")
    serverFiles = [
      'config.js'
      'impact-crater.js'
      'latency.js'
      'start.js'
    ]
    for file in serverFiles
      @copy "#{@templateDir}/basic/server/#{file}", "#{@path}/server/#{file}"

    generalFiles = [
      'gitignore'
      'package.json'
      'Procfile'
    ]
    for file in generalFiles
      @copy "#{@templateDir}/basic/#{file}", "#{@path}/#{file}", (err, to)=>
        @rename "#{@path}/gitignore", "#{@path}/.gitignore" if to is "#{@path}/gitignore"

module.exports = Generator
