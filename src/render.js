const btn = document.getElementById('send')
const close = document.getElementById('close')
const mini = document.getElementById('mini')
const remote = require('electron').remote

const kahootspam = require('kahoot-spam')
let api = kahootspam

btn.onclick = e => {
    var id = document.getElementById('roomid').value
    var name = document.getElementById('nom').value
    var qty = document.getElementById('nb').value
    var resp = document.getElementById('val').checked
    var err = false

    if (id === "" || id === undefined) {
        btn.classList.replace('is-info', 'is-danger')
        btn.innerHTML = "Vérifier"
        document.getElementById('roomid').classList.add('is-danger')
        setTimeout(errbk, 1500);
        err = true
    } else { err = false 
    document.getElementById('roomid').classList.remove('is-danger')}
    if (name === "" || name === undefined) {
        btn.classList.replace('is-info', 'is-danger')
        btn.innerHTML = "Vérifier"
        document.getElementById('nom').classList.add('is-danger')
        setTimeout(errbk, 1500);
        err = true
    } else { err = false 
        document.getElementById('nom').classList.remove('is-danger')}
    if (qty === "" || qty === undefined) {
        btn.classList.replace('is-info', 'is-danger')
        btn.innerHTML = "Vérifier"
        document.getElementById('nb').classList.add('is-danger')
        setTimeout(errbk, 1500);
        err = true
    } else { err = false 
        document.getElementById('nb').classList.remove('is-danger')}

    if (!err) {
        btn.classList.replace('is-info', 'is-success')
        btn.classList.add('is-loading')
        document.getElementById('roomid').classList.remove('is-danger')
        document.getElementById('nom').classList.remove('is-danger')
        document.getElementById('nb').classList.remove('is-danger')
        btn.disable = true

        if (resp) {
            api.spamWithAnswers(id, name, qty, true)
        } else {
            api.spam(id, name, qty)
        }

        setTimeout(msg, 3000);
    }
};

function msg() {
    btn.classList.replace('is-success', 'is-info')
    btn.classList.remove('is-loading')
    btn.innerText = 'Spam'
    document.getElementById('nom').value = ''
    document.getElementById('nb').value = ''
    document.getElementById('val').checked = false
}

function errbk() {
    btn.classList.replace('is-danger', 'is-info')
    btn.innerHTML = 'Spam'
}


document.getElementById("mini").addEventListener("click", function (e) {
     var window = remote.getCurrentWindow();
     window.minimize(); 
});



close.onclick = e => {
    var BrowserWindow = remote.getCurrentWindow();
    BrowserWindow.close();
}