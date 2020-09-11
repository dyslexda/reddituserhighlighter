var activeSR = new Map();

function saveOptions() {
    var activeExt = document.getElementById('activeExt').checked;
    var activeInfo = document.getElementById('activeInfo').checked;
    chrome.storage.sync.set({
        activeExtension: activeExt,
        activeInfobox: activeInfo,
        activeSubs: maptoJSON(activeSR)
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

function maptoJSON(map) {
    json = new Array();
    map.forEach(function (value,key,map) {
        json.push({[key]:value});
    });
    return(JSON.stringify(json));
}

function jsontoMap(json) {
    let map = new Map();
    for (let entry in json) {
        for (let named_entry in json[entry]) {
            let key = named_entry;
            let value = json[entry][named_entry];
            map.set(key,value);
        }
    }
    return(map)
}

function addItem() {
    var reddit = document.getElementById('sub_id').value;
    document.getElementById('sub_id').value = "";
    var timeframe = document.getElementById('sub_timeframe').value;
    document.getElementById('sub_timeframe').value = 0;
    activeSR.set(reddit,timeframe);
    drawSubs(activeSR);
}

function removeSub(event) {
    var elem = $(event.target);
    activeSR.delete(elem.attr("key"));
    drawSubs(activeSR);
}


function drawSubs(activeSR) {
    var stable = $("#subtable tbody");
    stable.empty();
    activeSR.forEach(function (value,key,map) {
        if (key) {
            stable.append("<tr><td>"+key+"</td><td>"+value+"</td><td><button class='remove' key='"+key+"'>Remove</button></td></tr>");
        }
    });
    $(".remove").on("click",removeSub);
}


function restore_options() {
    chrome.storage.sync.get({
        activeExtension: true,
        activeInfobox: false,
        activeSubs: []
    }, function (items) {
        document.getElementById('activeInfo').checked = items.activeInfobox;
        document.getElementById('activeExt').checked = items.activeExtension;
        var activeSR_json = JSON.parse(items.activeSubs);
        if (activeSR_json.length){
            activeSR = jsontoMap(activeSR_json);
            drawSubs(activeSR);
        }
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    saveOptions);
document.getElementById('add').addEventListener('click',
    addItem);