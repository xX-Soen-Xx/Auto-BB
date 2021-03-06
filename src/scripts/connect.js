const { Kdecole, ApiUrl , ApiVersion} = require('kdecole-api')
const cnedV = document.getElementById('cnedv')
const mbnV = document.getElementById('mbnv')
const remote = require('electron').remote
const Store = require('electron-store')
const puppeteer = require('puppeteer')
require('dotenv').config()
const store = new Store({ encryptionKey: process.env.encryptionKey })

let count = 0

mbnV.onclick = e => {
    const id = document.getElementById('mbnId').value
    const pass = document.getElementById('mbnP').value
    const ent = document.getElementById('mbnUrl').value
    let MBNURL = ApiUrl.PROD_MON_BUREAU_NUMERIQUE
    let MBNVERSION = ApiVersion.PROD_MON_BUREAU_NUMERIQUE
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
        console.log('Connexion ?? mbn...\n')
        Kdecole.login(id, pass, MBNVERSION, MBNURL)
            .then((token) => {
                console.log('Connect??')
                document.getElementById('mbnId').classList.add('is-success')
                document.getElementById('mbnP').classList.add('is-success')
                document.getElementById('mbnId').disabled = true
                document.getElementById('mbnP').disabled = true
                document.getElementById('mbnUrl').disabled = true
                mbnV.classList.add('is-success')
                mbnV.innerHTML = "Connect??"
                count++
                store.set('token', token)
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
    const id = document.getElementById('cnedId').value
    const pass = document.getElementById('cnedP').value
    const etabType = document.getElementById('etabType').value
    cnedV.classList.add('is-loading')
    checkCNED(id, pass, etabType)
}

async function checkCNED(id, pass, etabType) {
    console.log('\n')
    const browser = await puppeteer.launch({ headless: true, executablePath: getChromiumExecPath() });
    const page = await browser.newPage();
    console.log('Ouverture du navigateur...\n')
    if(etabType === 'lycee'){
        await page.goto('https://lycee.cned.fr/login/index.php', { waitUntil: 'domcontentloaded', timeout: 0 })
    } else {
        await page.goto('https://college.cned.fr/login/index.php', { waitUntil: 'domcontentloaded', timeout: 0 })
    }
    console.log('Acc??s ?? la page...\n')
    await page.type('#username', id, { delay: 30 })
    console.log('Ecriture de l\'identifiant...\n')
    await page.type('#password', pass, { delay: 30 })
    console.log('Ecriture du mote de passe...\n')
    page.click('#loginbtn')
    console.log('Connexion...\n')
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
    if (await page.title() === "Tableau de bord") {
        console.log('Connect??, fermeture...\n')
        await browser.close()
        document.getElementById('cnedId').classList.add('is-success')
        document.getElementById('cnedP').classList.add('is-success')
        document.getElementById('cnedId').disabled = true
        document.getElementById('cnedP').disabled = true
        cnedV.classList.replace('is-primary', 'is-success')
        cnedV.classList.remove('is-loading')
        cnedV.innerHTML = "Connect??"
        document.getElementById('cnedv').disabled = false
        cnedV.classList.remove('is-loading')
        count++
        store.set('cnedId', id)
        store.set('cnedP', pass)
        store.set('etabType', etabType)
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
    if (count === 2) {
        const BrowserWindow = remote.getCurrentWindow();
        alert('La configuration initiale est maintenant termin??e. \n\nL\'application va fermer. \nRelancez la et vous serez pr??t')
        BrowserWindow.close()
    }
}

function getChromiumExecPath() {
    return puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked');
}
