const { Kdecole } = require('kdecole-api')
const Store = require('electron-store')
const store = new Store({ encryptionKey: "Clé de chiffrement" })
const remote = require('electron').remote
const ejse = require('electron').remote.require('ejs-electron')

const user = new Kdecole(store.get('token'), store.get('version'), 0, store.get('url'))

function viewMsg(id) {
    user.getCommunication(id).then((message) => {
        user.setCommunicationLu(id)
        ejse.data('content', message)
        ejse.data('retour', true)
        let win = remote.getCurrentWindow();
        win.loadURL(__dirname + '/viewMessage.ejs')
    })
}
