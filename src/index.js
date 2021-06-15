const { app, BrowserWindow, Menu, Tray, Notification } = require('electron');
const { decode } = require('html-entities')
const { Kdecole } = require('kdecole-api')
const Store = require('electron-store')
const puppeteer = require('puppeteer');
const ejse = require('ejs-electron')
const path = require('path');
require('dotenv').config()
const store = new Store({ encryptionKey: process.env.encryptionKey })


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
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    }
  });
  mainWindow.resizable = false
  mainWindow.setMenuBarVisibility(false)
  mainWindow.loadFile(path.join(__dirname, '/views/connect.html'));
  setupCompleted = true
};

let user
let timer
let ignoreIDs = []
let tray = null
let delay = 60000
let actif = false
let autoConnect = true
let setupCompleted = false

app.setAppUserModelId("com.soen.autobb")

app.once('ready', async () => {
  if (store.get('token') === undefined
    || store.get('cnedId') === undefined
    || store.get('cnedP') === undefined
  ) {
    connect(true)
  } else {
    user = new Kdecole(store.get('token'), store.get('version'), 0, store.get('url'))
    try {
      await user.starting()
    } catch (e) {
      connect(false)
      new Notification({ title: 'Erreur lors de la connection', body: 'Merci de vous reconnecter' }).show()
      return
    }
    createSystemTray();
    autoCheck()
  }
})

app.on('window-all-closed', () => {
  if (store.get('cnedP') === undefined) process.exit(0)
  else if (setupCompleted) process.exit(0)
});

function autoCheck() {
  if (actif) return
  if (isNaN(delay)) return
  user.getMessagerieBoiteReception()
    .then(function (info) {
      if (info.communications[0]) {
        let id = info.communications[0].id
        let exp = info.communications[0].expediteurActuel.libelle
        user.getCommunication(id).then((communication) => {
          let content = communication.participations[0].corpsMessage.toString().toLowerCase()
          const index = content.search(store.get('etabType') === 'lycee' ? /https:\/\/lycee/g : /https:\/\/college/g)
          const unsureLink = content.substring(index, index + 36)
          let link
          if (unsureLink.search(/</g) === 35) {
            link = unsureLink.substring(35, 0)
          } else link = unsureLink
          if (link.startsWith('h')) {
            if (autoConnect) {
              goSession(link); actif = true; clearTimeout(timer);
              user.deleteCommunication(id)
            } else {
              if (ignoreIDs.indexOf(id) > -1) return
              let prompt = new Notification({ title: 'Classe en ligne trouvée', body: `De : ${exp} \nCliquer pour se connecter` })
              prompt.show()
              ignoreIDs.push(id)
              prompt.on('click', () => { goSession(link); actif = true; clearTimeout(timer); })
              prompt.on('close', () => { user.deleteCommunication(id) })
            }
          }
          else if (info.communications[0].etatLecure === false) {
            if (ignoreIDs.indexOf(id) > -1) return
            let objet = decode(info.communications[0].objet)
            let nvMessage = new Notification({ title: 'Nouveau message', body: `De : ${exp} \n${objet}` })
            nvMessage.show()
            nvMessage.on('click', (id) => { opnMessage(communication) })
            ignoreIDs.push(id)
          }
        })
      }

    })
  timer = setTimeout(() => { autoCheck() }, delay);
}

function manualCheck() {
  if (actif) return
  user.getMessagerieBoiteReception()
    .then(function (info) {
      if (info.communications[0]) {
        let id = info.communications[0].id
        user.getCommunication(id).then((communication) => {
          let content = communication.participations[0].corpsMessage.toString().toLowerCase()
          const index = content.search(store.get('etabType') === 'lycee' ? /https:\/\/lycee/g : /https:\/\/college/g)
          const unsureLink = content.substring(index, index + 36)
          let exp = info.communications[0].expediteurActuel.libelle
          let link
          if (unsureLink.search(/</g) === 35) {
            link = unsureLink.substring(35, 0)
          } else link = unsureLink
          if (link.startsWith('h')) {
            if (autoConnect) {
              goSession(link); actif = true;
              clearTimeout(timer);
              user.deleteCommunication(id)
            } else {
              if (ignoreIDs.indexOf(id) > -1) return
              let prompt = new Notification({ title: 'Classe en ligne trouvée', body: `De : ${exp} \nCliquer pour se connecter` })
              prompt.show()
              ignoreIDs.push(id)
              prompt.on('click', () => { goSession(link); actif = true; clearTimeout(timer); })
              prompt.on('close', () => { user.deleteCommunication(id) })
            }
          }
          else if (info.communications[0].etatLecure === false) {
            if (ignoreIDs.indexOf(id) > -1) return
            let objet = decode(info.communications[0].objet)
            let nvMessage = new Notification({ title: 'Nouveau message', body: `De : ${exp} \n${objet}` })
            nvMessage.show()
            nvMessage.on('click', (id) => { opnMessage(communication) })
            ignoreIDs.push(id)
          }
        })
      }
    })
}

function createSystemTray() {
  tray = new Tray(path.join(__dirname, 'trayIcon.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Changer de comptes',
      click: function () { connect(false) }
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
          click: () => { delay = 30000; clearTimeout(timer); autoCheck() }
        },
        {
          label: '1 minute',
          type: 'radio',
          id: '60000',
          checked: true,
          click: () => { delay = 60000; clearTimeout(timer); autoCheck() }
        },
        {
          label: '10 minutes',
          type: 'radio',
          id: '600000',
          click: () => { delay = 600000; clearTimeout(timer); autoCheck() }
        },
        {
          label: '30 minutes',
          type: 'radio',
          id: '1800000',
          click: () => { delay = 1800000; clearTimeout(timer); autoCheck() }
        },
        {
          label: 'Désactivé',
          type: 'radio',
          id: 'd',
          click: () => { delay = false }
        }
      ]
    },
    {
      label: 'Vérification manuelle',
      click: () => { manualCheck() }
    },
    {
      label: "Connexion auto",
      type: 'checkbox',
      checked: true,
      click: (item) => { if (item.checked) autoConnect = true; else autoConnect = false }
    },
    { type: 'separator' },
    {
      label: 'Quitter',
      accelerator: 'CmdOrCtrl+Q',
      selector: 'terminate:',
      click: () => { process.exit(0) }
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
  const page = (await browser.pages())[0]
  await page.evaluateOnNewDocument(() => {
    delete navigator.__proto__.webdriver;
  });
  page.goto(link, { waitUntil: 'domcontentloaded' })
  await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
  await page.type('#username', store.get('cnedId'), { delay: 30 })
  await page.type('#password', store.get('cnedP'), { delay: 30 })
  page.keyboard.press('Enter')

  browser.on('disconnected', function () {
    actif = false
    autoCheck()
  })
}

function getChromiumExecPath() {
  return puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked');
}

async function messagerie() {
  let msgs
  await user.getMessagerieBoiteReception()
    .then(function (info) {
      msgs = info
      ejse.data('messages', info)
    })
  if (msgs.communications[0] === undefined) { new Notification({ title: 'Aucun message' }).show(); return }
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
  await mainWindow.loadURL('file://' + __dirname + '/views/messagerie.ejs')
}

async function travail() {
  let dev = []
  let ids = []
  let data
  let cycl = 0
  await user.getTravailAFaire().then(function (taf) {
    data = taf
  })
  if (data.listeTravaux.length === 0) { tafCallback(false); return }
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
    if (cycl === array.length) tafCallback(true)
  })

}

function tafCallback(present) {
  if (present) {
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
  else {
    new Notification({ title: 'Aucun travail à faire' }).show()
  }
}

function opnMessage(content) {
  let ejse = require('ejs-electron')
  ejse.data('content', content)
  ejse.data('retour', false)
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
  mainWindow.loadURL(__dirname + '/views/viewMessage.ejs')
}
