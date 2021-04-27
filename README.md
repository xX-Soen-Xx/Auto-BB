# Auto-BB
Application premettant de se connecter automatiquement aux classes en ligne via lycee.cned.fr

# Télécharger/Editer le code source : 
En assumant que **[NodeJS](https://nodejs.org/en/)** est installé,
Télécharger le repo avec le bouton "**Code**" en haut à droite puis "**Download ZIP**"

Extraire le zip (sur le bureau pour l'exemple suivant)
Ouvrir Windows **PowerShell** :
> cd C:\Users\\$env:UserName\Desktop\Auto-BB-main
>
> npm install

Puis ouvrir le dossier dans votre IDE (exemple pour VSCode)

> code ./

## Commandes utiles 
Lancer sans compiler
>npm run start

Compiler l'application (le .exe sera dans .\dist\Auto BB x.x.x.exe)
>npm run dist
>

## Modules npm utilisés
 - [electron](https://www.npmjs.com/package/electron)
 - [ejs-electron](https://www.npmjs.com/package/ejs-electron)
 - [electorn-store](https://www.npmjs.com/package/electron-store)
 - [electron-builder](https://www.npmjs.com/package/electron-builder)
 - [kdecole-api](https://www.npmjs.com/package/kdecole-api)
 - [puppeteer](https://www.npmjs.com/package/puppeteer)
