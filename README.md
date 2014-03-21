## impact-crater.js

    Please be aware this project is highly experimental and the API will change rapidly.

Impact.js meet the world of multiplayer! Take the excellent Impact.js framework and
expand your game to include multiplayer. I have seen many attempts to transform Impact.js into a
multiplayer framework with little success. The main problem being the clients control the game.
Impact-crater is an authoritative server meaning the server makes all the moves and the clients are
merely controllers sending commands to the server. Game development is basically the same, the largest
difference you will notice is the seperation of client and server code, trust me it's still simple and fun.

## Setup

To get started with impact-crater you need to install the nodejs package.

    yum install nodejs      # CentOS
    apt-get install nodejs  # Debian
    brew install nodejs     # MacOS X

Once you have installed nodejs you need to checkout the code.

### Git installation

    git clone git@github.com:impact-crater/impact-crater-core.git

Then cd into it, and run:

    cd impact-crater-core
    npm link

### Create project

To make a new impact-crater project run the following:

    impact-crater generate path/to/my-mp-game example

This will setup the folder structure needed to use impact-crater. You should see the following structure. I will list the important files.

    my-mp-game/
        ├── impact/
        │   ├── lib/
        │   │   ├── game/
        │   │   ├── plugins/
        │   │   │   ├── client.js - The plugins for network access
        │   │   │   └── server.js
        │   ├── media/
        ├── public/
        │   └── index.ejs --------- HTML file for your game
        ├── server/
        │   ├── config.js --------- Settings for the server

Next unzip your copy of impact.js over the path/to/my-mp-game/impact folder. If the zip file is on your desktop the command will look like this:

    cd path/to/my-mp-game
    unzip ~/Desktop/impact-1.23.zip

*Important*: Unzipping impact.zip will overwrite an important file in the template. We created a side copy at `impact/lib/game/main.js.side`. You just need to copy it into place:

    cp impact/lib/game/main.js.side impact/lib/game/main.js

### Config

This part is pretty easy. You simply need to specify a host and port in the config file.

    vim server/config.js

## Starting the server

    impact-crater start path/to/my-mp-game

    ---- or ----

    cd path/to/my-mp-game
    impact-crater start

By default the port is 3000 so visit the following URL in your browser:

    http://localhost:3000

and you should see a game screen.

## Notes

After installation your file structure should look like the following:

    my-mp-game/
        ├── impact/
        │   ├── lib/
        │   │   ├── game/
        │   │   │   ├── entities/
        │   │   │   ├── levels/
        │   │   │   ├── main.js
        │   │   │   └── server/
        │   │   │       ├── entities/
        │   │   │       └── main.js
        │   │   ├── impact/
        │   │   ├── plugins/
        │   │   └── weltmeister/
        │   ├── media/
        │   ├── tools/

Notice the server folder under the game folder. This is required by impact-crater to differientiate between your server and client code. As you develop your games for multiplayer you will have to start thinking of entities from two points of
view, client-side and server-side.

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
* Test out on heroku, etc.
* Modularize the template so we can provide say board game templates, rpg templates, arcade shooter templates, lobby/session play templates
* Provide a better logging interface
* Provide a console mode for server control
* Watch the serverProcess so we can restart it potentially
* Allow for several servers to run at the same time

