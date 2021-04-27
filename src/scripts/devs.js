const { Kdecole } = require('kdecole-api')
const Store = require('electron-store')
const ejse = require('electron').remote.require('ejs-electron')
const store = new Store({ encryptionKey: "Clé de chiffrement" })
const ids = ejse.data('ids')

let user = new Kdecole(store.get('token'))


function fait(index) {
    var box = document.getElementById(index)
    if (box.checked == true) {
        user.setActiviteFinished(ids[index].uidSeance, ids[index].uid, true)
    } else if (box.checked == false) {
        user.setActiviteFinished(ids[index].uidSeance, ids[index].uid, false)
    }
}