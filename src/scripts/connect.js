const { Kdecole, ApiUrl , ApiVersion} = require('kdecole-api')
const remote = require('electron').remote
const Store = require('electron-store')
const puppeteer = require('puppeteer');
const mbnV = document.getElementById('mbnv')
const cnedV = document.getElementById('cnedv')
const store = new Store({ encryptionKey: "Clé de chiffrement" })
let count = 0

mbnV.onclick = e => {
    var id = document.getElementById('mbnId').value
    var pass = document.getElementById('mbnP').value
    var ent = document.getElementById('mbnUrl').value
    var MBNURL = ApiUrl.PROD_MON_BUREAU_NUMERIQUE
    var MBNVERSION = ApiVersion.PROD_MON_BUREAU_NUMERIQUE
    switch (ent) {
        case 'PROD_MON_BUREAU_NUMERIQUE':
            MBNURL = ApiUrl.PROD_MON_BUREAU_NUMERIQUE
            MBNVERSION = ApiVersion.PROD_MON_BUREAU_NUMERIQUE
            break;
        case 'PROD_MON_ENT_OCCITANIE':
            MBNURL = ApiUrl.PROD_MON_ENT_OCCITANIE
            MBNVERSION = ApiVersion.PROD_MON_ENT_OCCITANIE
            break
        case 'PROD_ARSENE76':
            MBNURL = ApiUrl.PROD_ARSENE76
            MBNVERSION = ApiVersion.PROD_ARSENE76
            break
        case 'PROD_ENT27':
            MBNURL = ApiUrl.PROD_ENT27
            MBNVERSION = ApiVersion.PROD_ENT27
            break
        case 'PROD_ENTCREUSE':
            MBNURL = ApiUrl.PROD_ENTCREUSE
            MBNVERSION = ApiVersion.PROD_ENTCREUSE
            break
        case 'PROD_AUVERGNERHONEALPES':
            MBNURL = ApiUrl.PROD_AUVERGNERHONEALPES
            MBNVERSION = ApiVersion.PROD_AUVERGNERHONEALPES
            break
        case 'PROD_SAVOIRSNUMERIQUES62':
            MBNURL = ApiUrl.PROD_SAVOIRSNUMERIQUES62
            MBNVERSION = ApiVersion.PROD_SAVOIRSNUMERIQUES62
            break
        case 'PROD_AGORA06':
            MBNURL = ApiUrl.PROD_AGORA06
            MBNVERSION = ApiVersion.PROD_AGORA06
            break
        case 'PROD_CYBERCOLLEGES42':
            MBNURL = ApiUrl.PROD_CYBERCOLLEGES42
            MBNVERSION = ApiVersion.PROD_CYBERCOLLEGES42
            break
        case 'PROD_ECOLLEGE_HAUTE_GARONNE':
            MBNURL = ApiUrl.PROD_ECOLLEGE_HAUTE_GARONNE
            MBNVERSION = ApiVersion.PROD_ECOLLEGE_HAUTE_GARONNE
            break
        case 'PROD_MONCOLLEGE_VALDOISE':
            MBNURL = ApiUrl.PROD_MONCOLLEGE_VALDOISE
            MBNVERSION = ApiVersion.PROD_MONCOLLEGE_VALDOISE
            break
        case 'PROD_WEBCOLLEGE_SEINESAINTDENIS':
            MBNURL = ApiUrl.PROD_WEBCOLLEGE_SEINESAINTDENIS
            MBNVERSION = ApiVersion.PROD_WEBCOLLEGE_SEINESAINTDENIS
            break
        case 'PROD_ECLAT_BFC':
            MBNURL = ApiUrl.PROD_ECLAT_BFC
            MBNVERSION = ApiVersion.PROD_ECLAT_BFC
            break
    }
    try {
        console.log('Connexion à mbn...\n')
        api = Kdecole.login(id, pass, MBNVERSION, MBNURL)
            .then((api) => {
                console.log('Connecté')
                document.getElementById('mbnId').classList.add('is-success')
                document.getElementById('mbnP').classList.add('is-success')
                document.getElementById('mbnId').disabled = true
                document.getElementById('mbnP').disabled = true
                document.getElementById('mbnUrl').disabled = true
                mbnV.classList.add('is-success')
                mbnV.innerHTML = "Connecté"
                count++
                store.set('token', api)
                store.set('url', MBNURL)
                store.set('version', MBNVERSION)
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
        alert('La configuration initiale est maintenant terminée. \n\nL\'application va fermer. \nRelancez la et vous serez prêt')
        BrowserWindow.close()
    }
}

function getChromiumExecPath() {
    return puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked');
}
