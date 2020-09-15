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
    var promises=[], pve=[], pvp=[], globalPve=[], globalPvp=[];
    Object.keys(WEAPON_IDS).forEach(weaponType => {
        var weaponQuery = '&types=' + WEAPON_IDS[weaponType];
        promises.push($.getJSON('https://api.tracker.gg/api/v1/destiny-2/db/items/insights?sort=usage&modes=7' + weaponQuery, (json)=>{ var e=1; json.data.forEach(weapon =>{ weapon.usageRank = e; e++; }); pve = pve.concat(json.data); } ));
        promises.push($.getJSON('https://api.tracker.gg/api/v1/destiny-2/db/items/insights?sort=usage&modes=69' + weaponQuery, (json)=>{ var p=1; json.data.forEach(weapon =>{ weapon.usageRank = p; p++; }); pvp = pvp.concat(json.data); } ));
        promises.push($.getJSON('https://api.tracker.gg/api/v1/destiny-2/db/items/insights?sort=usage&modes=7', (json)=>{ globalPve = globalPve.concat(json.data); } ));
        promises.push($.getJSON('https://api.tracker.gg/api/v1/destiny-2/db/items/insights?sort=usage&modes=69', (json)=>{ globalPvp = globalPvp.concat(json.data); } ));
    })
    // combine all
    return $.when.apply($, promises).then(() => {
        // remove all duplicates
        pve = pve.filter((v,i,a)=>a.findIndex(t=>(t.name === v.name))===i)
        pvp = pvp.filter((v,i,a)=>a.findIndex(t=>(t.name === v.name))===i)

        // convert jsons to objs
        var usage = {};
        pve.forEach(weapon => {
            var weaponId = weapon.slug + "-" + weapon.itemType.name.toLowerCase().replaceAll(' ', '-');
            usage[weaponId] = {name: weapon.name, id: weaponId, pveRank: weapon.usageRank, pvpRank: null, globalRank: null}; // create the object
        });
        pvp.forEach(weapon => {
            var weaponId = weapon.slug + "-" + weapon.itemType.name.toLowerCase().replaceAll(' ', '-');;
            usage[weaponId].pvpRank = weapon.usageRank; // add the pvp rank
        });
        // calc the global kill count from both pve and pvp
        var globalUsage = {};
        var totalPve = 0, totalPvp = 0;
        globalPve.forEach(weapon => {
            try{
                var weaponId = weapon.slug + "-" + weapon.itemType.name.toLowerCase().replaceAll(' ', '-');
                globalUsage[weaponId] = {name: weapon.name, id: weaponId, pveKills: weapon.total.kills, pvpKills: null}
                totalPve = totalPve + weapon.total.kills;
            } catch(err) {}
        })
        globalPvp.forEach(weapon => {
            try{
                var weaponId = weapon.slug + "-" + weapon.itemType.name.toLowerCase().replaceAll(' ', '-');
                globalUsage[weaponId].pvpKills = weapon.total.kills;
                totalPvp = totalPvp + weapon.total.kills;
            } catch(err) {}
        })
        console.log(globalUsage);
        // loop all the weapons in usage and calc the combined global usage rank
        var pvpAdjFactor = totalPve/totalPvp;
        var globalRankArr = [];
        Object.keys(globalUsage).forEach(weaponId => {
            var weapon = globalUsage[weaponId];
            var totalKills = weapon.pvpKills !== null ? weapon.pveKills + weapon.pvpKills*pvpAdjFactor : weapon.pveKills * 2;
            globalRankArr.push({id: weapon.id, kills: totalKills})
        })
        // sort them by largest to smallest
        globalRankArr.sort((a,b) => (a.kills < b.kills) ? 1 : -1)
        // take the array position as global rank
        var r = 1;
        globalRankArr.forEach(weapon => {
            usage[weapon.id].globalRank = r;
            r++;
        })

        console.log(usage);
        console.log(globalRankArr);
        return usage;
    });
}