
var popup_icon = chrome.runtime.getURL('static/info-popup-24.png');
var s = document.createElement('script');
s.src = chrome.runtime.getURL('src/script.js');
(document.head||document.documentElement).appendChild(s);
var dt = document.createElement('script');
dt.src = chrome.runtime.getURL('lib/jquery.dataTables.min.js');
(document.head||document.documentElement).appendChild(dt);
var r = document.createElement('div');
document.body.appendChild(r);
r.id = 'userinfopopup';
r.classList.add('popup');
var split = window.location.pathname.split("/");

$(document).ready(function () {
    var box = $('#userinfopopup');
    box.load(chrome.runtime.getURL('static/tabs.html'));
    console.log("Loaded");
    restoreOptions();
})

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

function restoreOptions() {
    chrome.storage.sync.get({
        activeExtension: true,
        activeInfobox: false,
        activeSubs: []},
        function (items) {
            var options = [];
            options.activeExt = items.activeExtension;
            options.activeInfo = items.activeInfobox;
            var activeSubs_json = JSON.parse(items.activeSubs);
            if (activeSubs_json.length) {
                options.activeSubs = jsontoMap(activeSubs_json);
            } else {
                options.activeSubs = new Map();
            }
            triggerSearch(options);
        }
    );
}

function triggerSearch(options) {
    if (options.activeExt === true && split.length > 3 && split[3] == 'comments' && (options.activeSubs.has(split[2]) || options.activeInfo)) {
        $('div.entry a.author').not("[blacklist-check-completed*=true]").each(function (index) {
            var elem = $(this);
            var comment_fullname = elem.parent().parent().parent()[0].dataset.fullname;
            var author = elem.attr('href').split("/")[4];
            elem.parent().append("<span class='userinfo' data-comment="+comment_fullname+" data-author="+author+" onclick='openPopup(event);'><img src="+popup_icon+"></span>")
            elem.attr("blacklist-check-completed", true);
            if (options.activeSubs.has(split[2])) {
                var baseurl = $(this).attr('href') + "/comments.json?limit=50";
                coms = getComments(baseurl);
                returned = coms.then(fullComments.bind(null,options))
                returned.then(function(data) { return drawBorder(elem,data);});
            }
        })
    }
}

async function getComments(baseurl,after=0,coms=0) {
    if (!coms) {
        coms = new Array()
    }
    if (after) {
        var url = baseurl + "&after=" + after;
    } else { var url = baseurl; }
    await $.getJSON(url, function (data) {
        for (var comment in data['data']['children']) {
            coms.push(data['data']['children'][comment]['data'])
        }
        after = data['data']['after']
    })
    if (after) {
        coms = getComments(baseurl,after,coms)
    }
    return coms
}

async function fullComments(options,coms) {
    var recent = true;
    var oldest = 9999999999999999
    var current_time = Number(Date.now().toString().slice(0,10)); //convert to seconds instead of milliseconds
    var cutoff_time = current_time - (60*60*24*options.activeSubs.get(split[2]));
    for (comment in coms) {
        if (split[2] === coms[comment]['subreddit']) {
            created = coms[comment]['created_utc'];
            if (created < oldest) {
                oldest = created;
            }
            if (created < cutoff_time) {
                recent = false;
            }
        }
    }
    return {recent,oldest}
}

function drawBorder(elem,returned) {
    if (returned.recent) {
        elem.addClass("user-anchor-blacklisted");
        elem.parent().parent().addClass("user-div-blacklisted");
    }
}