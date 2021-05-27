const { Kdecole } = require('kdecole-api')
const Store = require('electron-store')
const ejse = require('electron').remote.require('ejs-electron')
const store = new Store({ encryptionKey: "Clé de chiffrement" })
const ids = ejse.data('ids')

const user = new Kdecole(store.get('token'), store.get('version'), 0, store.get('url'))


function fait(index) {
    const box = document.getElementById(index)
    if (box.checked) {
        user.setActiviteFinished(ids[index].uidSeance, ids[index].uid, true)
    } else {
        user.setActiviteFinished(ids[index].uidSeance, ids[index].uid, false)
    }
}
