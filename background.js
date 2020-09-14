// MESSAGE HANDLERS //
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.type == 'getWeaponUsage'){
        //getWeaponUsage(request.weaponType).then( (results)=>{ sendResponse({results: results}); } );
        getAllWeaponUsage().then( (results)=>{ sendResponse({results: results}); } );
        return true; // keep connectiom open for async repionse
    }
})


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

// FUNCTIONS //
async function getWeaponUsage(weaponType){
    var weaponQuery = '&types=' + WEAPON_IDS[weaponType];
    var jsonPve, jsonPvp, usage=[], results;
    return $.when(
        $.getJSON('https://api.tracker.gg/api/v1/destiny-2/db/items/insights?sort=usage&modes=7' + weaponQuery,(json)=>{
            jsonPve = json;
        }),
        $.getJSON('https://api.tracker.gg/api/v1/destiny-2/db/items/insights?sort=usage&modes=69' + weaponQuery,(json)=>{
            jsonPvp = json;
        }),
    ).then(()=>{
        // convert jsons to objs
        var e = 1;
        var p = 1;
        var usage = {};
        jsonPve.data.forEach(weapon => {
            var weaponId = weapon.slug + "-" + weapon.itemType.name.toLowerCase().replaceAll(' ', '-');
            usage[weaponId] = {name: weapon.name, pveRank: e, pvpRank: null}; // create the object
            e++;
        });
        jsonPvp.data.forEach(weapon => {
            var weaponId = weapon.slug + "-" + weapon.itemType.name.toLowerCase().replaceAll(' ', '-');;
            usage[weaponId].pvpRank = p; // add the pvp rank
            p++;
        });
       console.log(usage);
       return usage;
    });
}

async function getAllWeaponUsage(){
    // prep all promise tasks
    var promises = [], pve=[], pvp=[];
    Object.keys(WEAPON_IDS).forEach(weaponType => {
        var weaponQuery = '&types=' + WEAPON_IDS[weaponType];
        promises.push($.getJSON('https://api.tracker.gg/api/v1/destiny-2/db/items/insights?sort=usage&modes=7' + weaponQuery, (json)=>{var e=1; json.data.forEach(weapon =>{ weapon.usageRank = e; e++; }); pve = pve.concat(json.data); } ));
        promises.push($.getJSON('https://api.tracker.gg/api/v1/destiny-2/db/items/insights?sort=usage&modes=69' + weaponQuery, (json)=>{var p=1; json.data.forEach(weapon =>{ weapon.usageRank = p; p++; }); pvp = pvp.concat(json.data); } ))
    })
    // combine all
    return $.when.apply($, promises).then(() => {
        // convert jsons to objs
        var usage = {};
        pve.forEach(weapon => {
            var weaponId = weapon.slug + "-" + weapon.itemType.name.toLowerCase().replaceAll(' ', '-');
            usage[weaponId] = {name: weapon.name, pveRank: weapon.usageRank, pvpRank: null}; // create the object
        });
        pve.forEach(weapon => {
            var weaponId = weapon.slug + "-" + weapon.itemType.name.toLowerCase().replaceAll(' ', '-');;
            usage[weaponId].pvpRank = weapon.usageRank; // add the pvp rank
        });
        console.log(usage);
        return usage;
    });
}