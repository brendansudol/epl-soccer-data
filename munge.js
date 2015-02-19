var fs = require('fs'),
    webPage = require('webpage'),
    season, input_file, output_file;


parse_seasons(2002, 2014);
phantom.exit();


function parse_seasons(start_year, end_year) {
    // output columns to a file
    var columns = ["season", "date", "home_team", "home_score", "home_scorers",
                   "away_team", "away_score", "away_scorers", "venue"];
    fs.write("data-out/columns.tsv", columns.join("|"), "w");

    // loop through & parse seasons
    for (var year = start_year; year <= end_year; year++) {
        season = (year - 1) + '-' + year;
        input_file = 'data-in/ukprem' + year + '-db.js';
        output_file = 'data-out/' + year + '.tsv';

        // get data vars from input js file
        var page = webPage.create();
        page.injectJs(input_file);

        var keys = ["f1", "f2", "f3", "f4", "f5", "f6", "f7",
            "f8", "f9", "f10", "f11", "f12", "f13", "f14",
            "f15", "f16", "f17", "f18", "f19", "f20", "f21",
            "n_t", "t_p", "t_l", "t_h", "t_ph", "t_s", "t_a",
            "t_e", "n_r", "n_v", "n_p", "t_f", "s_n", "s_v"
        ];

        for (var i = 0; i < keys.length; i++) {
            window[keys[i]] = page.evaluate(function(k) {
                return window[k];
            }, keys[i]);
        }

        // parse & output cleaned games during season
        console.log("parsing " + season + " season...");
        parse_games();
    }
}


function parse_games() {
    fs.write(output_file, "", "w");

    for (var i = f2.length - 1; i > 0; i--) {
        if (f14[i] == 1) {
            var entry = game_details(i);
                entry_str = season + "|" + entry.join("|") + "\n";

            fs.write(output_file, entry_str, "a");
        }    
    }
}


function game_details(num) {
    var day = f1[num].toISOString().slice(0,10),
        home_team = n_t[f2[num]],
        home_score = f4[num],
        home_scorers = scorers(num, 0),
        away_team = n_t[f3[num]],
        away_score = f5[num],
        away_scorers = scorers(num, 1),
        venue = n_v[f12[num]];

    var entry = [day, home_team, home_score, home_scorers,
                 away_team, away_score, away_scorers, venue];

    return entry;
}


function scorers(num, away) {
    var i, j, sname, stime, stype, ret = "";

    if (away === 0) {
        sname = f6[num]; stime = f8[num]; stype = f10[num];
    } else {
        sname = f7[num]; stime = f9[num]; stype = f11[num];
    }

    for (i = 1; i < sname.length; i++) {
        if (ret !== "") ret = ret + ";";
        ret = ret + n_p[sname[i]] + "-" + stime[i] + "-" + score_type(stype[i]);
    }

    return ret;
}


function score_type(s) {
    if (s == 0) return "g";
    if (s == 1) return "pen";
    if (s == 2) return "og";
    if (s == 5) return "try";
    if (s == 6) return "conv";
    if (s == 7) return "drop_goal";
    if (s == 8) return "pen";
    if (s == 9) return "goal";
    if (s == 10) return "point";
}
