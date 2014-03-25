Path  = require 'path'
Fs    = require 'fs'
Dir   = require 'node-dir'
Exec  = require 'exec-sync'

templatePath = Fs.realpathSync __dirname + '/../templates'

class Generator
  constructor: (opts) ->
    @path = opts.path
    @type = opts.type
    @development = opts.development
    @templatePath = "#{templatePath}/#{@type}"

  mkdir: (path) ->
    Fs.mkdirSync(path, 0o0755) unless Fs.existsSync path

  copy: (from, to) ->
    fromData = Fs.readFileSync from
    Fs.writeFileSync to, fromData

  link: (from, to) ->
      Fs.symlinkSync from, to unless Fs.existsSync to

  run: ->
    console.log "    [INFO] Creating an impact-crater project in '#{@path}'"
    # Create the project directory
    @mkdir @path
    # Scan all the files/dirs in the template directory and copy to @path.
    Dir.paths @templatePath, (err, paths) =>
        if err 
            console.log err
            console.log "    [ERROR] Template: '#{@type}' not found. Exiting."
            return false
        # Create directories
        for dirPath in paths.dirs
            newPath = dirPath.replace(@templatePath, @path)
            @mkdir newPath
        # Copy files
        for filePath in paths.files
            newPath = filePath.replace(@templatePath, @path)
            @link filePath, newPath if @development
            @copy filePath, newPath unless @development
        # Handle executable files
        Fs.chmodSync "#{@path}/bin/server", 0o0755
        try
            console.log "    [INFO] Installing node modules..."
            Exec "cd #{@path} && npm install"
        console.log "    [SUCCESS] Finished creating project in '#{@path}'."

module.exports = Generator
