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
        console.log(response.results);
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
                displayRanks(item, weaponUsage[weaponId].pveRank, weaponUsage[weaponId].pvpRank, weaponUsage[weaponId].globalRank);
            } catch(err) {
                console.log(err);
            }
        } 
    })
}


function displayRanks(itemElement, pveRank, pvpRank, globalRank){
    // https://www.light.gg/Content/Images/pve-icon.png
    // https://www.light.gg/Content/Images/pve-icon.png
    var usageHeader = document.createElement('div');
    usageHeader.style = "height: 16px; background-color: #ddd;";

    var pveDot = document.createElement('div');
    pveDot.style = 'height: 14px; width: 14px; background-color: #041955; border-radius: 25%; display: inline-block; text-align: center; margin: 1px; transform: translateY(-25%); font-size: 9px;';
    pveDot.innerText = pveRank;
    usageHeader.appendChild(pveDot);

    var pvpDot = document.createElement('div');
    pvpDot.style = 'height: 14px; width: 14px; background-color: #a31720; border-radius: 25%; display: inline-block; text-align: center; margin: 1px; transform: translateY(-25%); font-size: 9px;';
    pvpDot.innerText = pvpRank;
    usageHeader.appendChild(pvpDot);

    if(globalRank <= 25 && globalRank !== null) {
        var glbDot = document.createElement('div');
        glbDot.style = 'height: 14px; width: 14px; background-color: #df8020; border-radius: 25%; display: inline-block; text-align: center; margin: 1px; transform: translateY(-25%); font-size: 9px;';
        glbDot.innerText = globalRank;
        usageHeader.appendChild(glbDot);
    }

    itemElement.parentElement.append(usageHeader);
}