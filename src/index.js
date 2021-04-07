const { app, BrowserWindow, Menu, Tray } = require('electron');
const { Kdecole } = require('kdecole-api')
const Store = require('electron-store')
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs')
const { isContext } = require('vm');
const store = new Store({encryptionKey: "KbPeShVkYp3s6v9y$B&E)H@McQfTjWnZ"})

const connect = (user) => {
  if(!user){
    store.delete('token')
    store.delete('cnedId')
    store.delete('cnedP')
    clearTimeout(timer)
  }
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 300,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  });
  mainWindow.resizable = false
  mainWindow.setMenuBarVisibility(false)
  mainWindow.loadFile(path.join(__dirname, '/views/connect.html'));
};

// let json
let user
let timer
let tray = null
let delay = 60000
let actif = false
var ready = false
let account = false

app.on('ready', () => {
  // try {
  //   json = JSON.parse(fs.readFileSync(path.join(__dirname, 'keys.json')));
  // } catch (error) {
  //   console.log(error)
  // }

  if (store.get('token') === undefined || store.get('cnedId') === undefined || store.get('cnedP') === undefined) { //json.token === undefined || json.cnedId === undefined || json.cnedP === undefined
    let newUser = true
    connect(newUser)
  } else {
    if (!ready) {
      ready = true
      user = new Kdecole(store.get('token'))
      createSystemTray();
      autoCheck()
    }
  }

})

app.on('window-all-closed', () => {
  if (!account) process.exit(0)
});

function autoCheck() {
  if (!actif) {
    if (delay == false) { }
    else {
      user.getMessagerieBoiteReception()
        .then(function (info) {
          if (info.communications[0]) {
            let id = info.communications[0].id
            user.getCommunication(id).then((communication) => {
              let content = communication.participations[0].corpsMessage.toLowerCase().toString()
              content = content.replace(/<p>/g, '').replace(/<\/p>/g, '').replace(/<br>/g, '').split('<div class=')[0].split(' ')
              let link = content.filter(content => content.startsWith('https://l')).toString()
              if (link) { goSession(link); actif = true; clearTimeout(timer); user.deleteCommunication(id)}
            })
          }
        })
      timer = setTimeout(() => { autoCheck() }, delay);
    }
  }
}

function manualCheck() {
  if (!actif) {
    user.getMessagerieBoiteReception()
      .then(function (info) {
        if (info.communications[0]) {
          let id = info.communications[0].id
          user.getCommunication(id).then((communication) => {
            let content = communication.participations[0].corpsMessage.toLowerCase().toString()
            content = content.replace(/<p>/g, '').replace(/<\/p>/g, '').replace(/<br>/g, '').split('<div class=')[0].split(' ')
            let link = content.filter(content => content.startsWith('http')).toString()
            if (link) { goSession(link); actif = true; clearTimeout(timer); user.deleteCommunication(id)}
          })
        }
      })
  }
}

function createSystemTray() {
  tray = new Tray(path.join(__dirname, 'trayIcon.png'));
  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'Changer de comptes',
      click: function () {let newUser = false; connect(newUser) }
    },
    { type: 'separator' },
    {
      label: 'Délai de vérification',
      submenu: [
        {
          label: '30 secondes',
          type: 'radio',
          id: '30000',
          click: function (menuItem) { delay = 30000; clearTimeout(timer); autoCheck() }
        },
        {
          label: '1 minute',
          type: 'radio',
          id: '60000',
          checked: true,
          click: function (menuItem) { delay = 60000; clearTimeout(timer); autoCheck() }
        },
        {
          label: '10 minutes',
          type: 'radio',
          id: '600000',
          click: function (menuItem) { delay = 600000; clearTimeout(timer); autoCheck() }
        },
        {
          label: '30 minutes',
          type: 'radio',
          id: '1800000',
          click: function (menuItem) { delay = 1800000; clearTimeout(timer); autoCheck() }
        },
        {
          label: 'Désactivé',
          type: 'radio',
          id: 'd',
          click: function (menuItem) { delay = false }
        }
      ]
    },
    {
      label: 'Vérification manuelle',
      click: function () { manualCheck() }
    },
    { type: 'separator' },
    {
      label: 'Quitter',
      accelerator: 'CmdOrCtrl+Q',
      selector: 'terminate:',
      click: function () { process.exit(0) }
    }
  ]);
  tray.setToolTip('Auto BB');
  tray.setContextMenu(contextMenu);
}

async function goSession(link) {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: false, 
    ignoreDefaultArgs: ['--mute-audio'],
    executablePath: getChromiumExecPath()
  });
  const page = await browser.newPage();
  page.goto(link, {waitUntil: 'domcontentloaded'})
  await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
  await page.type('#username', store.get('cnedId'), { delay: 30 })
  await page.type('#password', store.get('cnedP'), { delay: 30 })
  page.click('#loginbtn')

  browser.on('disconnected', function (){
    actif = false
    autoCheck()
  })
}

function getChromiumExecPath() {
  return puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked');
}