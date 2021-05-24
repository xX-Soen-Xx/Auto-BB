const { app, BrowserWindow, Menu, Tray } = require('electron');
const { Kdecole } = require('kdecole-api')
const Store = require('electron-store')
const puppeteer = require('puppeteer');
const ejse = require('ejs-electron')
const path = require('path');
const store = new Store({ encryptionKey: "Clé de chiffrement"})

const connect = (user) => {
  if (!user) {
    store.delete('token')
    store.delete('cnedId')
    store.delete('cnedP')
    store.delete('url')
    store.delete('version')
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
  setupCompleted = true
};

let user
let timer
let tray = null
let delay = 60000
let actif = false
var ready = false
let setupCompleted = false

app.on('ready', () => {
  if (store.get('token') === undefined 
  || store.get('cnedId') === undefined 
  || store.get('cnedP') === undefined
  || store.get('version') === undefined
  || store.get('url') === undefined
  ) {
    let newUser = true
    connect(newUser)
  } else {
    if (!ready) {
      ready = true
      user = new Kdecole(store.get('token'), store.get('version'), 0, store.get('url'))
      createSystemTray();
      autoCheck()
    }
  }

})

app.on('window-all-closed', () => {
  if (store.get('cnedP') === undefined) process.exit(0)
  else if (setupCompleted) process.exit(0)
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
              let content = communication.participations[0].corpsMessage.toString().toLowerCase()
              var index = content.search(/https:\/\/lycee/g)
              var unsureLink = content.substring(index, index + 36)
              var link = ""
              if (unsureLink.search(/</g) == 35) {
                link = unsureLink.substring(35, 1)
              } else link = unsureLink
              if (link.startsWith('h')) { goSession(link); actif = true; clearTimeout(timer); user.deleteCommunication(id) }
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
            let content = communication.participations[0].corpsMessage.toString().toLowerCase()
            var index = content.search(/https:\/\/lycee/g)
            var unsureLink = content.substring(index, index + 36)
            var link = ""
            if (unsureLink.search(/</g) == 35) {
              link = unsureLink.substring(35, 1)
            } else link = unsureLink
            if (link.startsWith('h')) { goSession(link); actif = true; clearTimeout(timer); user.deleteCommunication(id) }
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
      click: function () { let newUser = false; connect(newUser) }
    },
    {
      label: 'Outils',
      submenu: [
        {
          label: 'Voir la messagerie',
          type: 'normal',
          click: function () { messagerie() }
        },
        {
          label: 'Voir les devoirs',
          type: 'normal',
          click: function () { travail() }
        }
      ]
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
  page.goto(link, { waitUntil: 'domcontentloaded' })
  await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
  await page.type('#username', store.get('cnedId'), { delay: 30 })
  await page.type('#password', store.get('cnedP'), { delay: 30 })
  page.click('#loginbtn')

  browser.on('disconnected', function () {
    actif = false
    autoCheck()
  })
}

function getChromiumExecPath() {
  return puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked');
}

async function messagerie() {
  await user.getMessagerieBoiteReception()
    .then(function (info) {
      ejse.data('messages', info)
    })
  let mainWindow = new BrowserWindow({
    width: 1410,
    height: 860,
    frame: true,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  mainWindow.resizable = true
  mainWindow.setMenuBarVisibility(false)
  mainWindow.loadURL('file://' + __dirname + '/views/messagerie.ejs')
}

async function travail() {
  let dev = []
  let ids = []
  let data
  let cycl = 0
  await user.getTravailAFaire().then(function (taf) {
    data = taf
  })


  await data.listeTravaux.forEach(async function (travail, index, array) {
    await user.getContenuActivite(travail.listTravail[0].uidSeance, travail.listTravail[0].uid).then(async function (content) {
      dev.push(content)
      ids.push({
        uid: travail.listTravail[0].uid,
        uidSeance: travail.listTravail[0].uidSeance
      })
    })
    ejse.data('devoirs', dev)
    ejse.data('ids', ids)
    cycl++
    if (cycl === array.length) tafCallback()
  })
}

function tafCallback() {
  let mainWindow = new BrowserWindow({
    width: 1410,
    height: 860,
    frame: true,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  mainWindow.resizable = true
  mainWindow.setMenuBarVisibility(false)
  mainWindow.loadURL('file://' + __dirname + '/views/devs.ejs')
}
