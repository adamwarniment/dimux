// GLOBAL VARIABLES //
WEAPON_IDS = {
    'Auto Rifle': '5',
    'Hand Cannon': '6',
    'Pulse Rifle': '7',
    'Scout Rifle': '8',
    'Fusion Rifle': '9',
    'Sniper Rifle': '10',
    'Shotgun': '11',
    'Machine Gun': '12',
    'Rocket Launcher': '13',
    'Sidearm': '14',
    'Sword': '54',
    'Grenade Launcher': '153950757',
    'Linear Fusion Rifle': '1504945536',
    'Trace Rifle': '2489664120',
    'Bow': '3317538576',
    'Submachine Gun': '3954685534'
}

// wait for .dim-loading to not be present
runAfterLoad();

function runAfterLoad(){
    if(document.querySelector('.store-row.store-header') === null) {
        // wait 2 seconds and try again
        setTimeout((function(){ console.log('running scheduled Check loaded'); runAfterLoad(); }), 2000);
    } else {
        getWeaponUsage()//.then((weaponUsage)=>{ displayWeaponUsageRanks(weaponUsage); });
    }
}

async function getWeaponUsage(){
    chrome.runtime.sendMessage({type: 'getWeaponUsage'}, async (response)=>{
        // store it as a global var
        displayWeaponUsageRanks(response.results);
        return response;
    });
}

function displayWeaponUsageRanks(weaponUsage){
    var allItems = document.querySelectorAll('.item');
    var weapons = [];
    allItems.forEach(item => {
        if(item.closest('.sub-bucket').getAttribute('aria-label').includes('Weapons') == true) {
            // weapon id
            var weaponId = item.title.toLowerCase().replace(/\n/i,'-').replaceAll(' ','-').replaceAll('.','').replaceAll('_','').replaceAll("'",'').replaceAll(',','').replaceAll('(','').replaceAll(')','').replaceAll('ö','o');
            // weapon display ranks
            try{
                displayRanks(item, weaponUsage[weaponId].pveRank, weaponUsage[weaponId].pvpRank);
            } catch(err) {
                console.log(weaponId);
            }
        } 
    })
}


function displayRanks(itemElement, pveRank, pvpRank){
    // https://www.light.gg/Content/Images/pve-icon.png
    // https://www.light.gg/Content/Images/pve-icon.png
    var usageHeader = document.createElement('div');
    usageHeader.style = "height: 14px; background-color: #ddd;";

    var pveSpan = document.createElement('span');
    pveSpan.style = "margin: 1px; color: #041955; font-size: 10px; display: inline-block; *display: inline; align-items: center; font-weight: bold;";
    var pveIcon = document.createElement('img');
    pveIcon.src = chrome.extension.getURL('img/pve.png');
    pveIcon.style = "background-color: #041955; height: 9px";
    pveSpan.innerText = '#' + pveRank;
    pveSpan.prepend(pveIcon);

    var pvpSpan = document.createElement('span');
    pvpSpan.style = "margin: 1px; color: #a31720; font-size: 10px; display: inline-block; *display: inline; align-items: center; font-weight: bold;";
    var pvpIcon = document.createElement('img');
    pvpIcon.src = chrome.extension.getURL('img/pvp.png');
    pvpIcon.style = "background-color: #a31720; height: 9px";
    pvpSpan.innerText = '#' + pvpRank;
    pvpSpan.prepend(pvpIcon);

    usageHeader.appendChild(pveSpan);
    usageHeader.appendChild(pvpSpan);

    itemElement.parentElement.append(usageHeader);
}