const { Kdecole } = require('kdecole-api')
const Store = require('electron-store')
const remote = require('electron').remote
const store = new Store({ encryptionKey: "Clé de chiffrement" })
var win = remote.getCurrentWindow()

let user = new Kdecole(store.get('token'))

var repModal = document.getElementById("repModal");
var repBtn = document.getElementById("repB");
var delModal = document.getElementById('delModal');
var delBtn = document.getElementById('del')
var span = document.getElementsByClassName("close")[0];
var spanD = document.getElementsByClassName("close")[1];
var bodyC = document.getElementById('reponse')
var i = document.getElementsByName('send')
var sendV = i[0]

sendV.disabled = true
repBtn.onclick = function () {
    repModal.style.display = "block";
}

span.onclick = function () {
    repModal.style.display = "none";
}
window.onclick = function (event) {
    if (event.target == repModal) {
        repModal.style.display = "none";
    }
}
delBtn.onclick = function () {
    delModal.style.display = "block";
}

spanD.onclick = function () {
    delModal.style.display = "none";
}
window.onclick = function (event) {
    if (event.target == delModal) {
        delModal.style.display = "none";
    }
}

bodyC.addEventListener('change', updateValue)
function updateValue() {
    if (bodyC.value === undefined || bodyC.value == ' ' || bodyC.value == '') { sendV.disabled = true; bodyC.classList.add('is-danger') }
    else { sendV.disabled = false; bodyC.classList.remove('is-danger') }
}

async function send(id) {
    bodyC.disabled = true
    sendV.disabled = true
    sendV.innerHTML = ''
    sendV.classList.add('is-loading')
    await user.sendMessage(id, bodyC.value).then(() => {
        sendV.classList.remove('is-loading')
        sendV.classList.replace('is-info', 'is-success')
        sendV.innerHTML = 'Message envoyé'
        setTimeout(function () { win.close() }, 1000)
    }).catch(function(err){
        sendV.classList.remove('is-loading')
        sendV.classList.replace('is-info', 'is-danger')
        sendV.innerHTML = 'Erreur'
        alert(err)
    })
}

function del(id){
    var yesbtn = document.getElementsByClassName('yesBtn')[0]
    yesbtn.classList.add('is-loading')
    yesbtn.innerHTML = ''
    yesbtn.disabled = true
    document.getElementById('cancel').style.display = "none"
    user.deleteCommunication(id).then(()=>{
        yesbtn.classList.remove('is-loading')
        yesbtn.classList.replace('is-danger', 'is-success')
        yesbtn.innerHTML = 'Conversation supprimée'
        setTimeout(function(){win.close()}, 1000)
    })
}