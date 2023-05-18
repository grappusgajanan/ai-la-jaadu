first you need to pase the API key in ./backend/.env file

then you need to forgive me for badly naming folders and code structure

then run these commands one by one

cd ./backend && npm i && cd ..

cd ./lets-try-first-plugin && npm i && cd ..

then in two separate terminals run these commands

terminal 1 :

cd ./backend && npm run dev

terminal 2 :

cd ./lets-try-first-plugin && npm run watch

once this is done

open figma desktop app and open new empty figjam page

right click anywhere in canvas and select
Plugins > Development > Import plugin from manifest

then select ./lets-try-first-plugin/manifest.json

that's it
