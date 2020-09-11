function openPopup(event) {
    console.log(event);
    var tPosX = event.pageX + 10;
    var tPosY = event.pageY + 10;
    var box = $('#userinfopopup');
    var author = event.target.parentElement.dataset.author;
    var comment_fullname = event.target.parentElement.dataset.comment;
    analyzeComments(event,author,comment_fullname);
    box.show();
    box.css({'position': 'absolute', 'top': tPosY, 'left': tPosX});
}

function closePopup(event) {
    var box = $('#userinfopopup');
    box.hide();
}

async function getComments(baseurl,after=0,coms=0) {
    if (!coms) {
        coms = new Array()
    }
    if (after) {
        var url = baseurl + "&after=" + after;
    } else { var url = baseurl; }
    let response = await fetch(url);
    let r_text = await response.text();
    json_text = JSON.parse(r_text);
    for (let comment in json_text['data']['children']) {
        coms.push(json_text['data']['children'][comment]['data']);
    }
    after = json_text['data']['after'];
    if (after) {
        coms = getComments(baseurl,after,coms);
    }
    return coms;
}


async function analyzeComments(event,author,comment_fullname) {
    baseurl = 'https://www.reddit.com/user/'+author+'/comments.json?limit=50';
    prevFive(author,comment_fullname);
    coms = await getComments(baseurl);
    recent_subs = parseSubs(coms.slice(0,50));
    all_subs = parseSubs(coms);
    buildTable(recent_subs,'#recenttable');
    buildTable(all_subs,'#alltable');
}

async function buildTable(subs_list,table) {
    $(table).DataTable( {
        "destroy": true,
        "info": false,
        "searching": false,
        "order": [[ 1, 'dsc' ]],
        "lengthMenu": [ [5, 10, 25, 50, -1], [5, 10, 25, 50, "All"] ],
        data: subs_list,
        columns: [
            { data: 'subreddit' },
            { data: 'count' },
            { data: 'first_com' },
            { data: 'last_com' },
            { data: 'karma' }
        ]
    } );
}

function parseSubs(coms) {
    let sub_dict = new Array();
    for (let com in coms) {
        subreddit = coms[com]['subreddit'];
        if (!sub_dict.hasOwnProperty(subreddit)) {
            sub_dict[subreddit] = new Array();
            sub_dict[subreddit]['timeline'] = [];
            sub_dict[subreddit]['timeline'].push(coms[com]['created_utc']);
            sub_dict[subreddit]['first_com'] = coms[com];
            sub_dict[subreddit]['last_com'] = coms[com];
            sub_dict[subreddit]['count'] = 1;
            sub_dict[subreddit]['score'] = coms[com]['score'];
        }
        else {
            if ( coms[com]['created_utc'] < sub_dict[subreddit]['first_com']['created_utc'] ) {
                sub_dict[subreddit]['first_com'] = coms[com];
            }
            if ( coms[com]['created_utc'] > sub_dict[subreddit]['last_com']['created_utc'] ) {
                sub_dict[subreddit]['last_com'] = coms[com];
            }
            sub_dict[subreddit]['count'] += 1;
            sub_dict[subreddit]['score'] += coms[com]['score'];
            sub_dict[subreddit]['timeline'].push(coms[com]['created_utc']);
        }
    }
    subs_list = new Array();
    for (sub in sub_dict) {
        subs_list.push(new subredditLine(sub,sub_dict[sub]['first_com'],sub_dict[sub]['last_com'],sub_dict[sub]['count'],sub_dict[sub]['score'],sub_dict[sub]['timeline']));
    }
    return subs_list;
}

async function prevFive(author,comment_fullname,coms=0) {
    if (!coms) {
        coms = new Array();
    }
    var limit = 5;
    url = 'https://www.reddit.com/user/'+author+'/comments.json?after='+comment_fullname+'&limit='+limit;
    let response = await fetch(url);
    let r_text = await response.text();
    json_text = await JSON.parse(r_text);
    for (let comment in json_text['data']['children']) {
        coms.push(json_text['data']['children'][comment]['data']);
    }
//    console.log(coms);
    coms_list = new Array();
    for (let com in coms) {
        subreddit = coms[com]['subreddit'];
        time = coms[com]['created_utc'];
        score = coms[com]['score'];
        permalink = coms[com]['permalink'];
        body = coms[com]['body'];
        coms_list.push(new commentLine(subreddit,time,score,body,permalink));
    }
//    console.log(coms_list);
    $('#prev5table').DataTable( {
        "destroy": true,
        "paging": false,
        "info": false,
        "searching": false,
        "order": [[ 1, 'dsc' ]],
        data: coms_list,
        columns: [
            { data: 'subreddit' },
            { data: 'time' },
            { data: 'score' },
            { data: 'permalink' }
        ]
    } );
}

function subredditLine(subreddit,first_com,last_com,count,karma,timeline) {
    this.subreddit = subreddit;
    this._first_com = first_com;
    this._last_com = last_com;
    this.count = count;
    this.karma = karma;
    this._timeline = timeline;

    this.first_com = function () {
        let custom_date;
        let months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
        let newdate = new Date(this._first_com['created_utc']*1000);
        custom_date = months[newdate.getMonth()]
        custom_date += "/" + newdate.getDate();
        return custom_date;
    }

    this.last_com = function () {
        let custom_date;
        let months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
        let newdate = new Date(this._last_com['created_utc']*1000);
        custom_date = months[newdate.getMonth()]
        custom_date += "/" + newdate.getDate();
        return custom_date;
    }
}

function commentLine(subreddit,time,score,body,permalink) {
    this.subreddit = subreddit;
    this._time = time;
    this.score = score;
    this.body = body;
    this._permalink = permalink;

    this.time = function () {
        let custom_date;
        let months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
        let newdate = new Date(this._time*1000);
        custom_date = months[newdate.getMonth()]
        custom_date += "/" + newdate.getDate();
        return custom_date;
    }
    this.permalink = function() {
        hreflink = "<a href='https://www.reddit.com"+this._permalink+"'>Link</a>";
        return hreflink;
    }
}

function openTab(event, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  event.currentTarget.className += " active";
}