## impact-crater.js

```
Please be aware this project is highly experimental and the API will change rapidly.
```

Impact.js meet the world of multiplayer! Take the excellent Impact.js framework and
expand your game to include multiplayer. I have seen many attempts to transform Impact.js into a
multiplayer framework with little success. The main problem being the clients control the game.
Impact-crater is an authoritative server meaning the server makes all the moves and the clients are
merely controllers sending commands to the server. Game development is basically the same, the largest
difference you will notice is the seperation of client and server code, trust me it's still simple and fun.

Check out the following tutorial for a more in-depth look.
[Simple Multiplayer Tutorial](https://github.com/cha55son/impact-crater/wiki/Simple-Multiplayer-Tutorial)

If you have an ImpactJS license be sure to check out the demo at:
[impactjs forum post](http://impactjs.com/forums/private/easy-authoritative-impactjs-server)

## Setup

To get started with impact-crater you need to install the nodejs package.

    yum install nodejs      # CentOS
    apt-get install nodejs  # Debian
    brew install nodejs     # MacOS X

Once you have installed nodejs you need to checkout the code.

###Git installation
```git clone git@github.com:cha55son/impact-crater.git```
Then cd into it, and run:
```npm link```

###NPM Installation
```npm install impact-crater -g```

This will give you a bin called ```impact-crater```. To make a new impact-crater project run the following:
```impact-crater generate [path/to/my-mp-game]```
This will setup the folder structure needed to use impact-crater. You should see the following structure. I will list the important files.

    my-mp-game/
      impact/ --------- You will need to unzip your impact directory here
        lib/
          plugins/
            client.js - Plugin code to bootstrap clients for multiplayer.
            server.js - Plugin code to boostrap the server for multiplayer.
      public/
        index.ejs.example ----- Template file for your game screen.
      server/
        start.js.example ------ The file used to start the server.
        config.js.example ----- Settings for the server.

Next unzip your copy of impact.js over the my-mp-game/impact folder.

Once you do that your file structure should look like the following:

    my-mp-game/
      impact/
        lib/
          game/
            entities/
            levels/
            main.js
            server/ (This is required and your server entities/main.js will go here!)
              entities/
              main.js
          impact/
          plugins/
          weltmeister/
        media/
        tools/yo

Notice the server folder under the game folder. This is required by impact-crater to differientiate between your server and client code. As you develop your games for multiplayer you will have to start thinking of entities from two points of
view, client-side and server-side.

## Config

This part is pretty easy. You simply need to specify a host and port in the config file. Be sure to copy it to `server/config.js`.

    my-mp-game/
      server/
        config.js.example - Copy this file to config.js and set the host, port

## If You've installed Via NPM
Run ```npm link /path/to/impact-crater/``` so it will use the package you checked out instead of pulling one down.

## Starting the server
```impact-crater start [path/to/my-mp-game]```
This will start up your project on a seperate process.

## Docs

###### Client Classes
* [GameClient](https://github.com/cha55son/impact-crater/wiki/GameClient)
* [EntityClient](https://github.com/cha55son/impact-crater/wiki/EntityClient)

###### Server Classes
* [GameServer](https://github.com/cha55son/impact-crater/wiki/GameServer)
* [EntityServer](https://github.com/cha55son/impact-crater/wiki/EntityServer)

## TODO
* Create an actual server script for people who don't want to use the ```impact-server start``` command
* Move configs to env vars and/org command line args
* Modularize the template so we can provide say board game templates, rpg templates, arcade shooter templates, lobby/session play templates
* Provide a better logging interface
* Provide a console mode for server control
* Watch the serverProcess so we can restart it potentially
* Allow for several servers to run at the same time

