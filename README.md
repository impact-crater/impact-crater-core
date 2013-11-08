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

To get started with impact-crater you need to install the cairo package and nodejs. 

    yum install cairo      # CentOS
    apt-get install cairo  # Debian
    brew install cairo     # MacOS X
    
    yum install nodejs      # CentOS
    apt-get install nodejs  # Debian
    brew install nodejs     # MacOS X
    
Once you have installed cairo and nodejs you need to checkout the code.

    git clone git@github.com:cha55son/impact-crater.git my-mp-game
    
Run `npm install` to install the required node packages. (npm should come with nodejs or as an additional package)

You should see the following structure. I will list the important files.

    my-mp-game/
      index.html ------ Entry point for your game clients
      impact/ --------- You will need to unzip your impact directory here
        lib/
          plugins/
            client.js - Plugin code to bootstrap clients for multiplayer.
            server.js - Plugin code to boostrap the server for multiplayer.
      server/
        index.js ------ The bootstrap file to start impact in node 
        
Be sure you unzip your copy of impact over the my-mp-game/impact directory. If you
can't unzip onto of the impact folder or merge into it, then simply copy the `lib/plugins` folder. 
Delete the impact directory and slide your real `impact` folder into place and paste the `lib/plugins`.
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
        tools/
        
Notice the server folder under the game folder. This is required by impact-crater to
differientiate between your server and client code. 
As you develop your games for multiplayer you will have to start thinking of entities from two points of
view, client-side and server-side.
        
## Config

This part is pretty easy. You simply need to specify a host and port in the following files.

    my-mp-game/
      server/
        config.js.example - Copy this file to config.js and set the port
      index.html ---------- Set the host and port in the head/script section.
      
## Docs

###### Client Classes
* [GameClient](https://github.com/cha55son/impact-crater/wiki/GameClient)
* [EntityClient](https://github.com/cha55son/impact-crater/wiki/EntityClient)

###### Server Classes
* [GameServer](https://github.com/cha55son/impact-crater/wiki/GameServer)
* [EntityServer](https://github.com/cha55son/impact-crater/wiki/EntityServer)


        
