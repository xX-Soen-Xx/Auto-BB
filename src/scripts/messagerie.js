const { Kdecole } = require('kdecole-api')
const Store = require('electron-store')
const store = new Store({ encryptionKey: "Clé de chiffrement" })
const remote = require('electron').remote
const ejse = require('electron').remote.require('ejs-electron')

let user = new Kdecole(store.get('token'))

function viewMsg(id) {
    user.getCommunication(id).then((message) => {
        user.setCommunicationLu(id)
        ejse.data('content', message)
        let win = remote.getCurrentWindow();
        win.loadURL(__dirname + '/viewMessage.ejs')
    })
}