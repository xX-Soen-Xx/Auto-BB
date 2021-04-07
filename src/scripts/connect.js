const { Kdecole } = require('kdecole-api')
const remote = require('electron').remote
const Store = require('electron-store')
const puppeteer = require('puppeteer');
const fs = require('fs')
const path = require('path')
const mbnV = document.getElementById('mbnv')
const cnedV = document.getElementById('cnedv')
const store = new Store({ encryptionKey: "KbPeShVkYp3s6v9y$B&E)H@McQfTjWnZ" })
let count = 0

// let keys = {
//     token: "tokenhere",
//     cnedId: "ID",
//     cnedP: "Pass"
// }

mbnV.onclick = e => {
    var id = document.getElementById('mbnId').value
    var pass = document.getElementById('mbnP').value
    try {
        console.log('Connexion à mbn...\n')
        api = Kdecole.login(id, pass)
            .then((api) => {
                console.log('Connecté')
                document.getElementById('mbnId').classList.add('is-success')
                document.getElementById('mbnP').classList.add('is-success')
                document.getElementById('mbnId').disabled = true
                document.getElementById('mbnP').disabled = true
                mbnV.classList.add('is-success')
                mbnV.innerHTML = "Connecté"
                count++
                // keys.token = api
                store.set('token', api)
                close()
            })
            .catch(function () { alert('Identifiant ou mot de passe incorrect'); })
    } catch (error) {
        console.log(error)
    }

}

cnedV.onclick = e => {
    document.getElementById('cnedv').disabled = true
    var id = document.getElementById('cnedId').value
    var pass = document.getElementById('cnedP').value
    cnedV.classList.add('is-loading')
    checkCNED(id, pass)
}

async function checkCNED(id, pass) {
    console.log('\n')
    const browser = await puppeteer.launch({ headless: true, executablePath: getChromiumExecPath() });
    const page = await browser.newPage();
    console.log('Ouverture du navigateur...\n')
    await page.goto('https://lycee.cned.fr/login/index.php', { waitUntil: 'domcontentloaded', timeout: 0 });
    console.log('Accès à la page...\n')
    await page.type('#username', id, { delay: 30 })
    console.log('Ecriture de l\'identifiant...\n')
    await page.type('#password', pass, { delay: 30 })
    console.log('Ecriture du mote de passe...\n')
    page.click('#loginbtn')
    console.log('Connexion...\n')
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
    if (await page.title() == "Tableau de bord") {
        console.log('Connecté, fermeture...\n')
        await browser.close()
        document.getElementById('cnedId').classList.add('is-success')
        document.getElementById('cnedP').classList.add('is-success')
        document.getElementById('cnedId').disabled = true
        document.getElementById('cnedP').disabled = true
        cnedV.classList.replace('is-primary', 'is-success')
        cnedV.classList.remove('is-loading')
        cnedV.innerHTML = "Connecté"
        document.getElementById('cnedv').disabled = false
        cnedV.classList.remove('is-loading')
        count++
        // keys.cnedId = id
        // keys.cnedP = pass
        store.set('cnedId', id)
        store.set('cnedP', pass)
        close()
    } else {
        await browser.close()
        document.getElementById('cnedId').value = ""
        document.getElementById('cnedP').value = ""
        cnedV.classList.remove('is-loading')
        cnedV.innerHTML = "Valider"
        console.log('Erreur de connexion \n')
        alert('Nom d\'utilisateur ou mot de passe incorrect')
    }
}

function close() {
    if (count == 2) {
        var BrowserWindow = remote.getCurrentWindow();
        // var buffer = JSON.stringify(keys, null, 2)
        // fs.writeFileSync('../../keys.json', buffer, 'utf8', function (err) { });
        alert('La configuration initiale est maintenant terminée. \n\nL\'application va fermer. \nRelancez la et vous serez prêt')
        BrowserWindow.close()
    }
}

function getChromiumExecPath() {
    return puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked');
}