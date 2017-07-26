/*
*
* mads - version 2.00.01
* Copyright (c) 2015, Ninjoe
* Dual licensed under the MIT or GPL Version 2 licenses.
* https://en.wikipedia.org/wiki/MIT_License
* https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
*
*/
var mads = function (options) {

    var _this = this;

    this.render = options.render;

    /* Body Tag */
    this.bodyTag = document.getElementsByTagName('body')[0];

    /* Head Tag */
    this.headTag = document.getElementsByTagName('head')[0];

    /* json */
    if (typeof json == 'undefined' && typeof rma != 'undefined') {
        this.json = rma.customize.json;
    } else if (typeof json != 'undefined') {
        this.json = json;
    } else {
        this.json = '';
    }

    /* fet */
    if (typeof fet == 'undefined' && typeof rma != 'undefined') {
        this.fet = typeof rma.fet == 'string' ? [rma.fet] : rma.fet;
    } else if (typeof fet != 'undefined') {
        this.fet = fet;
    } else {
        this.fet = [];
    }

    this.fetTracked = false;

    /* load json for assets */
    this.loadJs(this.json, function () {
        _this.data = json_data;

        _this.render.render();
    }); 

    this.custTracker = ["https://www.cdn.serving1.net/a/analytic.htm?uid=0&isNew=true&referredUrl=&rmaId=2&domainId=0&pageLoadId=0&userId=3728&pubUserId=0&campaignId=32525275c35cbaf3c1236d6854a5d517&browser=&os=&domain=&callback=trackSuccess&callback=trackSuccess&type={{rmatype}}&tt={{rmatt}}&value={{rmavalue}}"];

    /* CT */
    if (typeof ct == 'undefined' && typeof rma != 'undefined') {
        this.ct = rma.ct;
    } else if (typeof ct != 'undefined') {
        this.ct = ct;
    } else {
        this.ct = [];
    }

    /* CTE */
    if (typeof cte == 'undefined' && typeof rma != 'undefined') {
        this.cte = rma.cte;
    } else if (typeof cte != 'undefined') {
        this.cte = cte;
    } else {
        this.cte = [];
    }
    
    /* tags */
    if (typeof tags == 'undefined' && typeof tags != 'undefined') {
        this.tags = this.tagsProcess(rma.tags);
    } else if (typeof tags != 'undefined') {
        this.tags = this.tagsProcess(tags);
    } else {
        this.tags = '';
    }

    /* Unique ID on each initialise */
    this.id = this.uniqId();

    /* Tracked tracker */
    this.tracked = [];
    /* each engagement type should be track for only once and also the first tracker only */
    this.trackedEngagementType = [];
    /* trackers which should not have engagement type */
    this.engagementTypeExlude = [];
    /* first engagement */
    this.firstEngagementTracked = false;

    /* RMA Widget - Content Area */
    this.contentTag = document.getElementById('rma-widget');

    /* URL Path */
    this.path = typeof rma != 'undefined' ? rma.customize.src : '';

    /* Solve {2} issues */
    for (var i = 0; i < this.custTracker.length; i++) {
        if (this.custTracker[i].indexOf('{2}') != -1) {
            this.custTracker[i] = this.custTracker[i].replace('{2}', '{{type}}');
        }
    }
};

/* Generate unique ID */
mads.prototype.uniqId = function () {

    return new Date().getTime();
}

mads.prototype.tagsProcess = function (tags) {
    
    var tagsStr = '';
    
    for(var obj in tags){
        if(tags.hasOwnProperty(obj)){
            tagsStr+= '&'+obj + '=' + tags[obj];
        }
    }     
    
    return tagsStr;
}

/* Link Opner */
mads.prototype.linkOpener = function (url) {

    if(typeof url != "undefined" && url !=""){

        if(typeof this.ct != 'undefined' && this.ct != '') {
            url = this.ct + encodeURIComponent(url);
        }

        if (typeof mraid !== 'undefined') {
            mraid.open(url);
        }else{
            window.open(url);
        }

        if(typeof this.cte != 'undefined' && this.cte != '') {
            this.imageTracker(this.cte);
        }
    }
}

/* tracker */
mads.prototype.tracker = function (tt, type, name, value) {

    /*
    * name is used to make sure that particular tracker is tracked for only once
    * there might have the same type in different location, so it will need the name to differentiate them
    */
    name = name || type;

    if ( tt == 'E' && !this.fetTracked ) {
        for ( var i = 0; i < this.fet.length; i++ ) {
            var t = document.createElement('img');
            t.src = this.fet[i];

            t.style.display = 'none';
            this.bodyTag.appendChild(t);
        }
        this.fetTracked = true;
    }

    if ( typeof this.custTracker != 'undefined' && this.custTracker != '' && this.tracked.indexOf(name) == -1 ) {
        for (var i = 0; i < this.custTracker.length; i++) {
            var img = document.createElement('img');

            if (typeof value == 'undefined') {
                value = '';
            }

            /* Insert Macro */
            var src = this.custTracker[i].replace('{{rmatype}}', type);
            src = src.replace('{{rmavalue}}', value);

            /* Insert TT's macro */
            if (this.trackedEngagementType.indexOf(tt) != '-1' || this.engagementTypeExlude.indexOf(tt) != '-1') {
                src = src.replace('tt={{rmatt}}', '');
            } else {
                src = src.replace('{{rmatt}}', tt);
                this.trackedEngagementType.push(tt);
            }

            /* Append ty for first tracker only */
            if (!this.firstEngagementTracked && tt == 'E') {
                src = src + '&ty=E';
                this.firstEngagementTracked = true;
            }

            /* */
            img.src = src + this.tags + '&' + this.id;

            img.style.display = 'none';
            this.bodyTag.appendChild(img);

            this.tracked.push(name);
        }
    }
};

mads.prototype.imageTracker = function (url) {
    for ( var i = 0; i < url.length; i++ ) {
        var t = document.createElement('img');
        t.src = url[i];

        t.style.display = 'none';
        this.bodyTag.appendChild(t);
    }
}

/* Load JS File */
mads.prototype.loadJs = function (js, callback) {
    var script = document.createElement('script');
    script.src = js;

    if (typeof callback != 'undefined') {
        script.onload = callback;
    }

    this.headTag.appendChild(script);
}

/* Load CSS File */
mads.prototype.loadCss = function (href) {
    var link = document.createElement('link');
    link.href = href;
    link.setAttribute('type', 'text/css');
    link.setAttribute('rel', 'stylesheet');

    this.headTag.appendChild(link);
}

/*
*
* Unit Testing for mads
*
*/
var game = function () {
    var self = this;
    /* pass in object for render callback */
    this.app = new mads({
        'render' : this
    });

    self.app.loadCss( self.app.path + 'css/style.css');
    self.app.loadJs( self.app.path + 'sample.json', function() {
        self.render();
    });
    
}

/* 
* render function 
* - render has to be done in render function 
* - render will be called once json data loaded
*/
game.prototype.render = function () { 
    
    console.log(this.app.data);
    var self = this;
    this.app.contentTag.innerHTML = 
        '<div class="container">' +
            '<div id="progress">' +
                '<p>LOADING</p>' +
                '<p id="percent">0%</p>' +
                '<div id="bar"></div>' +
            '</div>' +
            '<canvas id="canvas" width="320" height="480"></canvas>' +
            '<div id="endgame">' + 
            '</div>' + 
        '</div>';
 
    self.app.loadJs('https://code.createjs.com/createjs-2015.11.26.min.js', function () {
        self.init();
    });

}

game.prototype.init = function() {
    var self = this;

    //data
    self.buildPos = [
        {
            x: json_data.buildPos01_x,
            y: json_data.buildPos01_y,
            occupied: false,
            type: [],
            textX: json_data.buildPos01_textX,
            textY: json_data.buildPos01_textY,
            textArrow: json_data.buildPos01_textArrow
        },{
            x: json_data.buildPos02_x,
            y: json_data.buildPos02_y,
            occupied: false,
            type: [],
            textX: json_data.buildPos02_textX,
            textY: json_data.buildPos02_textY,
            textArrow: json_data.buildPos02_textArrow
        },
    ]
    self.building = [];
    self.timer = {
        display: new createjs.Text("", json_data.timer_font, json_data.timer_color),
        x: json_data.timer_x,
        y: json_data.timer_y,
        sec: json_data.timer_sec,
        loop: 0
    };
    self.started = false;
    self.storelink = "https://itunes.apple.com/us/app/zgirls-girls-vs-zombie-battle-game/id1174204073?mt=8";
    self.messages = [];
    self.trainer = [];
    self.troops = [];
    self.troopsNo = 0;
    self.zombies = [];
    self.zombieNo = 0;
    self.spawnTime = Math.floor((Math.random() * (json_data.spawnTime_max - json_data.spawnTime_min + 1)) + json_data.spawnTime_min);
    self.gateHealth = json_data.gate_Health;
    

   //Preload files
    var manifest = [
        {
            src: json_data.startBtn,
            id: "start"
        },{
            src: json_data.tutorial,
            id: "tutorial"
        },{
            src: json_data.background,
            id: "bg",
        },{
            src: json_data.building01,
            id: "building01"
        },{
            src: json_data.building02,
            id: "building02"
        },{
            src: json_data.army01,
            id: "army01"
        },{
            src: json_data.army02,
            id: "army02"
        },{
            src: json_data.zombie01,
            id: "zombie01"
        },{
            src: json_data.zombie02,
            id: "zombie02"
        }

    ];
    var manifest2 = [
        {
            src: json_data.win,
            id: "win"
        },{
            src: json_data.lose,
            id: "lose"
        },{
            src: json_data.replay,
            id: "replay"
        }
    ];

     //setup for ios/android
    /*var iDevices = ["iphone", "ipod", "ipad"];
    var ios = false;
    for ( var i in iDevices ) {
        if ( navigator.userAgent.toLowerCase().indexOf(iDevices[i]) > -1 ) {
            ios = true;
        }
    }*/
    //if ( ios == true ) {
        self.storelink = "https://itunes.apple.com/us/app/zgirls-girls-vs-zombie-battle-game/id1174204073?mt=8";
        manifest.push({
            src: json_data.appStore,
            id: "store"
        });
   /* }
    else {
        self.storelink = "https://play.google.com/store/apps/details?id=com.xingjoys.zgirls.gp&hl=en";
        manifest.push({
            src: json_data.googlePlay,
            id: "store"
        });
    }*/

    var preload = new createjs.LoadQueue(false);
    preload.on("fileload", handleFileLoad);
    preload.on("complete", loadComplete);
    preload.on("progress", handleProgress);
    preload.loadManifest(manifest);

    function handleFileLoad(event) {
        if ( event.item.id == "tutorial" ) {
            self.tutor = new createjs.Bitmap(event.result);
        }
        if ( event.item.id == "bg" ) {
            self.bg = new createjs.Bitmap(event.result);
        }
        if ( event.item.id == "start" ) {
            self.startBtn = new createjs.Bitmap(event.result);
        }

        for ( var b = 0; b < 2; b++ ) {
            var variableName = "building0" + (b + 1).toString();
            if ( event.item.id == variableName) {
                var homeX = variableName + "_homeX";
                var homeY = variableName + "_homeY";
                var textX = variableName + "_textX";
                var textY = variableName + "_textY";
                var textArrow = variableName + "_textArrow";
                self.building[b] = new createjs.Bitmap(event.result);
                self.building[b].homeX = json_data[homeX];
                self.building[b].homeY = json_data[homeY];
                self.building[b].built = false;
                self.building[b].training = false;
                self.building[b].width = event.result.width;
                self.building[b].height = event.result.height;
                self.building[b].no = b;
                self.building[b].textX = json_data[textX];
                self.building[b].textY = json_data[textY];
                for ( var bp in self.buildPos) {
                    self.buildPos[bp].type[b] = new createjs.Bitmap(event.result);
                }
            }
        }

        if ( event.item.id == "store" ) {
            self.storeBtn = new createjs.Bitmap(event.result);
            self.storeBtn2 = new createjs.Bitmap(event.result);
        }

        if (event.item.id == "army01") {
            self.army01Sprite = new createjs.SpriteSheet({
                images: [event.item.src],
                frames: {width: 72, height: 65},
                animations: { 
                    walk: {
                        frames: [19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
                        next: "walk",
                        speed: 0.6
                    },
                    idle: {
                        frames: [20, 21, 22, 21],
                        next: "idle",
                        speed: 0.1
                    },
                    ready: [23, 35, "attack", 1],
                    attack: [36, 53, "attack", 1]
                }
            });
        }

        if (event.item.id == "army02") {
            self.army02Sprite = new createjs.SpriteSheet({
                images: [event.item.src],
                frames: {width: 72, height: 65},
                animations: { 
                    walk: {
                        frames: [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
                        next: "walk",
                        speed: 0.5
                    },
                    idle: {
                        frames: [17, 19, 18, 19],
                        next: "idle",
                        speed: 0.1
                    },
                    ready:[20, 38, "attack", 0.9],
                    attack:[39, 44, "attack2", 0.5],
                    attack2:[45, 69, "attack", 1.2]
                }
                
            });
        }

        if (event.item.id == "zombie02") {
            self.zombie02Sprite = new createjs.SpriteSheet({
                images: [event.item.src],
                frames: {width: 72, height: 65},
                animations: { 
                    spawn: [0, 19, "walk", 0.4],
                    walk:{
                        frames: [35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23],
                        next: "walk",
                        speed: 0.8
                    },
                    die: {
                        frames: [14, 13, 12, 11, 10, 9, 8, 7, 7, 7, 7, 7],
                        next: false,
                        speed: 0.3
                    }
                }
            });
        }

        if (event.item.id == "zombie01") {
            self.zombie01Sprite = new createjs.SpriteSheet({
                images: [event.item.src],
                frames: {width: 100, height: 82},
                animations: { 
                    die: {
                        frames: [25, 24, 23, 22, 20, 19, 17, 16, 14, 12, 10, 8, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0],
                        next: false,
                        speed: 0.3
                    },
                    spawn: [0, 30, "walk", 0.4],
                    walk: {
                        frames: [60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50, 49, 48, 47, 46, 45, 44, 43, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31],
                        next: "walk",
                        speed: 1
                    },
                }
            });
        }

        if ( event.item.id == "lose" ) {
            self.lose = new createjs.Bitmap(event.result);
        }

        if ( event.item.id == "win" ) {
            self.win = new createjs.Bitmap(event.result);
        }

        if ( event.item.id == "replay" ) {
            self.replayBtn = new createjs.Bitmap(event.result);
        }
    }

    function handleProgress(event) {
        var progress = Math.round(event.loaded * 100);
        document.getElementById("percent").innerHTML = progress.toString() + '%';
        document.getElementById("bar").style.width = (progress / 100 * 300).toString() + 'px';
        if ( progress == 100 ) {
            var o = 1.0;
            var s = setInterval( function(){
                var p = document.getElementById("progress");
                p.style.opacity = o.toString();
                if ( o <= 0 ) {
                    clearInterval(s);
                    p.style.display = 'none';
                }
                o -= 0.02;
            }, 20);
        }
    }
    
    function loadComplete(event) {
        console.log('preloaded');
        self.setupCanvas();
        var preload2 = new createjs.LoadQueue(false);
        preload2.loadManifest(manifest2);
        preload2.on("fileload", handleFileLoad);
        preload2.on("complete", loadComplete2);
    }

    function loadComplete2(event) {
        //End Screen ;
        self.endScreen = new createjs.Container();
        self.endScreen.addChild(self.lose);
        self.endScreen.addChild(self.win);
        self.endScreen.addChild(self.replayBtn);
        self.endScreen.addChild(self.storeBtn2);
        self.replayBtn.x = json_data.replayBtn_x;
        self.replayBtn.y = json_data.replayBtn_y;
        self.storeBtn2.x = json_data.storeBtn2_x;
        self.storeBtn2.y = json_data.storeBtn2_y;
        self.endScreen.visible = false;
        self.stage.addChild(self.endScreen);
        self.replayBtn.on("click", self.restart);
        self.storeBtn2.on("click", function(evt) {
            self.app.linkOpener(self.storelink);
            self.app.tracker('CTR', 'store');
            console.log('store');  
        });
    }
     
}
        


game.prototype.setupCanvas = function() {
    var self = this;
    console.log('setup');
    self.stage = new createjs.Stage("canvas");

    //Start Screen
    self.startScreen = new createjs.Container();
    self.startScreen.addChild(self.tutor);
    self.startBtn.x = json_data.startBtn_x;
    self.startBtn.y = json_data.startBtn_y;
    self.startBtn.scaleX = json_data.startBtn_scale;
    self.startBtn.scaleY = json_data.startBtn_scale;
    self.startScreen.addChild(self.startBtn);
    createjs.Touch.enable(self.stage);

    //Game World
    self.world = new createjs.Container();
    self.world.addChild(self.bg);
    self.world.addChild(self.timer.text);

    //buildings
    for (var bp in self.buildPos ) {
        for ( var t in self.buildPos[bp].type ) {
            self.buildPos[bp].type[t].x = self.buildPos[bp].x;
            self.buildPos[bp].type[t].y = self.buildPos[bp].y;
            self.buildPos[bp].type[t].alpha = 0.5;
            self.buildPos[bp].type[t].visible = false;
            self.world.addChild(self.buildPos[bp].type[t]);
        }
    }

    for ( var b in self.building ) {
        self.building[b].scaleX = json_data.buildingScale_home;
        self.building[b].scaleY = json_data.buildingScale_home;
        self.building[b].x = self.building[b].homeX;
        self.building[b].y = self.building[b].homeY;
        self.building[b].on("mousedown", function(evt) {
            if ( evt.target.built == false ) {
                for (var bp in self.buildPos ) {
                    if ( self.buildPos[bp].occupied == false ) {
                        self.buildPos[bp].type[evt.target.no].alpha = 0.5;
                        self.buildPos[bp].type[evt.target.no].visible = true;
                    }
                }  
            }
        });
        self.building[b].on("pressmove", function(evt) {
            if ( evt.target.built == false ) {
                evt.target.x = evt.stageX - evt.target.width/4;
                evt.target.y = evt.stageY - evt.target.height/4;
                for (var bp in self.buildPos ) {
                    var pt = self.buildPos[bp].type[evt.target.no].globalToLocal(self.stage.mouseX, self.stage.mouseY);
                    if (self.stage.mouseInBounds && self.buildPos[bp].type[evt.target.no].hitTest(pt.x, pt.y)) { 
                        self.buildPos[bp].type[evt.target.no].alpha = 1.0;
                    }
                    else {
                        self.buildPos[bp].type[evt.target.no].alpha = 0.5;
                    }
                }
            }
        });
        self.building[b].on("pressup", function(evt) {
            for (var bp in self.buildPos ) {
                var pt = self.buildPos[bp].type[evt.target.no].globalToLocal(self.stage.mouseX, self.stage.mouseY);
                if (self.stage.mouseInBounds && self.buildPos[bp].type[evt.target.no].hitTest(pt.x, pt.y)) {
                    if ( evt.target.built == false ) {
                        self.app.tracker('E', 'build');
                        console.log('build');    
                        evt.target.scaleX = json_data.buildingScale_built;
                        evt.target.scaleY = json_data.buildingScale_built;
                        evt.target.x = self.buildPos[bp].x;
                        evt.target.y = self.buildPos[bp].y;
                        evt.target.built = true;
                        evt.target.builtPos = bp;
                        self.buildPos[bp].occupied = true;
                        self.messages.push(new self.message(self.buildPos[bp].textX, self.buildPos[bp].textY, self.buildPos[bp].textArrow, json_data.buildArmy_Text, json_data.buildArmy_color, json_data.buildArmy_background_color));
                    }
                }
                self.buildPos[bp].type[evt.target.no].visible = false;
            }
            
            if ( evt.target.built == false ) {
                evt.target.x = evt.target.homeX;
                evt.target.y = evt.target.homeY;
            }
        });
        self.building[b].on("click", function(evt) {
            if ( evt.target.built == true ) {
                if (evt.target.training == false ) {
                    evt.target.training = true;
                    self.app.tracker('E', 'train');
                    console.log('train');  
                    self.trainer.push(new self.trainTroop(evt.target.no, evt.target.builtPos));
                }
            }
        });
        self.world.addChild(self.building[b]);
    }
    
    //Timer
    self.timer.display.text = self.secTomin(self.timer.sec);
    self.timer.display.x = self.timer.x;
    self.timer.display.y = self.timer.y;
    self.world.addChild(self.timer.display);

    //App Store
    self.storeBtn.x = json_data.storeBtn_x;
    self.storeBtn.y = json_data.storeBtn_y;
    self.storeBtn.scaleX = json_data.storeBtn_scale;
    self.storeBtn.scaleY = json_data.storeBtn_scale;
    self.world.addChild(self.storeBtn);
    self.storeBtn.on("click", function(evt) {
        self.app.linkOpener(self.storelink);
        self.app.tracker('CTR', 'store');
        console.log('store');
    });

    //Arrange Container
    self.stage.addChild(self.world);
    self.stage.addChild(self.startScreen);

    //Start Game
    self.startBtn.on("click", function(evt) {
        self.app.tracker('E', 'gamestart');
        console.log('start');  
        self.startScreen.visible = false;
        createjs.Ticker.framerate = 30;
        self.ticker = new createjs.Ticker.addEventListener("tick", self.handleTick);
        self.started = true;
    });
    self.stage.update();
}

game.prototype.secTomin = function(val) { //compile mm:ss format from total seconds
    var s = val % 60;
    var m = Math.floor(val / 60);
    var v = [m.toString(),s.toString()];
    for (var i in v) {
        if ( v[i].length < 2 ) {
            v[i] = '0' + v[i];
        }
    }
    return v.join(":");
}

game.prototype.message = function(x, y, direction, text, color, bg_color) {
    var self = gameData;
    this.text = new createjs.Text(text, json_data.buildArmy_font, color);
    this.text.x = x;
    this.text.y = y;
    this.shape = new createjs.Shape();
    this.shape.graphics.f(bg_color).rr(x - 5, y - 2.5, this.text.getMeasuredWidth() + 10, this.text.getMeasuredHeight() + 10, 4);
    var arrowCord = {
        left: {
            x: x - 5,
            y: y + this.text.getMeasuredHeight() / 1.5,
            angle: 180
        },
        top: {
            x: x + this.text.getMeasuredWidth() / 2,
            y: y - 2.5,
            angle: -90
        }
    };
    this.arrow = new createjs.Shape();
    this.arrow.graphics.f(bg_color).drawPolyStar(arrowCord[direction].x, arrowCord[direction].y, 10, 3, 0, arrowCord[direction].angle);
    this.duration = createjs.Ticker.framerate * json_data.message_duration;
    self.world.addChild(this.arrow);
    self.world.addChild(this.shape);
    self.world.addChild(this.text);
}

game.prototype.trainTroop = function(type, builtPos) {
    var self = gameData;
    var variableName = "troop0" + (type + 1).toString();
    this.duration = json_data[variableName + "_trainDuration"] * createjs.Ticker.framerate;
    this.type = type;
    this.completion = 0;
    this.barLength = 0;
    this.barX = self.buildPos[builtPos].x + 131;
    this.barY = self.buildPos[builtPos].y + 43;
    this.frame = new createjs.Shape();
    this.frame.graphics.s("#878788").lf(["#DFDFDF", "#F9F9F9", "#F9F9F9", "#E3E3E3"], [0.0, 0.4, 0.8, 1.0], self.buildPos[builtPos].x + 75, self.buildPos[builtPos].y - 2, self.buildPos[builtPos].x + 75, self.buildPos[builtPos].y + 58).rr(self.buildPos[builtPos].x + 75, self.buildPos[builtPos].y - 2, 60, 60, 4);
    self.world.addChild(this.frame);
    this.icon = new createjs.Sprite(self["army0" + (type + 1).toString() + "Sprite"]);
    this.icon.gotoAndStop("idle");
    this.icon.x = self.buildPos[builtPos].x + 105 - json_data[variableName + "_offsetX"];
    this.icon.y = self.buildPos[builtPos].y + 54 - json_data[variableName + "_offsetY"];
    self.world.addChild(this.icon);
    this.barWrapper = new createjs.Shape();
    this.barWrapper.graphics.setStrokeStyle(2).s(json_data.buildArmy_background_color).f("white").rr(self.buildPos[builtPos].x + 130, self.buildPos[builtPos].y + 42, 70, 10, 5);
    self.world.addChild(this.barWrapper);
    this.bar = new createjs.Shape();
    this.bar.graphics.s(json_data.buildArmy_background_color).f(json_data.buildArmy_background_color).r(this.barX, this.barY, this.barLength, 8);
    self.world.addChild(this.bar);
}

game.prototype.troop = function( x, y, type, no ) {
    var self = gameData;
    var ini = this;
    this.no = no;
    this.unit = self.world.addChild(new createjs.Sprite(self["army0" + (type + 1).toString() + "Sprite"]));
    this.unit.type = type;
    this.unit.offsetX = json_data["troop0" + (type + 1).toString() + "_offsetX"];
    this.unit.offsetY = json_data["troop0" + (type + 1).toString() + "_offsetY"];
    this.unit.x = x - this.unit.offsetX;
    this.unit.y = y - this.unit.offsetY;
    this.unit.realX = x;
    this.unit.realY = y;
    this.unit.health = json_data["troop0" + (type + 1).toString() + "_health"];
    this.unit.damage = json_data["troop0" + (type + 1).toString() + "_damage"];
    this.unit.target = -1;
    this.unit.action = "idle";
    this.unit.gotoAndPlay("idle");
    this.unit.on("animationend", function(evt){
        if ( self.started == true ) {
            if ( evt.name == "ready" ) {
                ini.unit.action = "attack";
                ini.unit.gotoAndPlay("attack");
            }

            if ( evt.name.indexOf("attack") > -1 ) {
                self.zombies[ini.unit.target].unit.health -= ini.unit.damage;
               /// console.log( self.zombies[ini.unit.target].unit.health );
            }
        }
    });
    this.unit.findTarget = function() {
        var dumDist = 10000;
        var n = -1;
        for ( var z in self.zombies) {
            if ( self.zombies[z].unit.type == ini.unit.type && self.zombies[z].unit.health > 0 ) {
                var dist = Math.sqrt((self.zombies[z].unit.realY - ini.unit.realY) * (self.zombies[z].unit.realY - ini.unit.realY) + (self.zombies[z].unit.realX - ini.unit.realX) * (self.zombies[z].unit.realX - ini.unit.realX));
                if ( dist < dumDist ) {
                    dumDist = dist;
                    n = z;
                }
            }
        }
        return n;
    }
    this.update = function() {
        var troop = this.unit;
        var attackX;
        var distX;
        var distY;
        troop.x = troop.realX - troop.offsetX;
        troop.y = troop.realY - troop.offsetY;

        if ( troop.health > 0 ) {
            if ( troop.target == -1 ) { // No Target
                troop.target = troop.findTarget();
                if ( troop.target == -1 ) { //No zombies on the map
                    if ( troop.action != "idle" ) {
                        troop.action = "idle";
                        troop.gotoAndPlay("idle");
                    }
                }
            }
            else { //Found Target
                if ( self.zombies[troop.target].unit.health > 0 ) { //target is not dying
                    if ( self.zombies[troop.target].unit.realX > troop.realX ) {
                        troop.regX = 0;
                        troop.scaleX = 1;
                        attackX = self.zombies[troop.target].unit.realX - 10;
                    }
                    else{
                        troop.regX = ini.unit.offsetX * 2;
                        troop.scaleX = -1;
                        attackX = self.zombies[troop.target].unit.realX + 10;
                    }

                    distX = Math.abs(attackX - troop.realX);
                    distY = Math.abs(self.zombies[troop.target].unit.realY - troop.realY);
                    if ( distX < 15 && distY < 5) {
                        if ( troop.action != "attack" && troop.action != "ready") {
                            self.world.setChildIndex( troop, self.world.getNumChildren()-1);
                            troop.action = "ready";
                            troop.gotoAndPlay("ready");
                        }
                    }
                    else {
                        troop.angle = Math.atan2((self.zombies[troop.target].unit.realY - troop.realY), (attackX - troop.realX)) + Math.PI / 2;
                        if ( troop.action != "walk" ) {
                            troop.action = "walk";
                            troop.gotoAndPlay("walk");
                        }

                        if ( distX >= 15 ) {
                             troop.realX += json_data.troop_moveSpeed * Math.cos(troop.angle - Math.PI / 2); 
                        }

                        if ( distY  > 5 ) {
                            troop.realY += json_data.troop_moveSpeed * Math.sin(troop.angle - Math.PI / 2);
                        }
                    }
                }
                else {
                    troop.target = troop.findTarget();
                }
            }
        }
        else {
            if ( troop.action != "die" ) {
                troop.action = "die";
                troop.gotoAndStop("idle");
                createjs.Tween.get(troop).to({alpha: 0, visible: false}, 1000).call(function() {
                    self.world.removeChild(troop);
                    /*for ( var t in self.troops ) {
                        if ( self.troops[t].no == ini.no ) {
                            self.troops.splice(t, 1);
                        }
                    }*/
                });
            }
        }
    }
}

game.prototype.zombie = function( x, y, type, no ) {
    var self = gameData;
    var ini = this;
    this.no = no;
    this.unit = self.world.addChild(new createjs.Sprite(self["zombie0" + (type + 1).toString() + "Sprite"]));
    this.unit.type = type;
    this.unit.offsetX = json_data["zombie0" + (type + 1).toString() + "_offsetX"];
    this.unit.offsetY = json_data["zombie0" + (type + 1).toString() + "_offsetY"];
    this.unit.x = x - this.unit.offsetX;
    this.unit.y = y - this.unit.offsetY;
    this.unit.realX = x;
    this.unit.realY = y;
    this.unit.gotoAndPlay("spawn"); 
    this.unit.action = "spawn";
    this.unit.target = -1;
    this.unit.health = json_data["zombie0" + (type + 1).toString() + "_health"];
    this.unit.damage = json_data["zombie0" + (type + 1).toString() + "_damage"];
    this.unit.regX = ini.unit.offsetX * 2;
    this.unit.scaleX = -1;
    this.unit.on("animationend", function(evt){
        if ( self.started == true ) {
            if (evt.name == "spawn") {
                ini.unit.action = "walk";
            }
            if (evt.name == "die") {
                self.world.removeChild(ini.unit);
                /*for (var z in self.zombies ) {
                    if ( ini.no == self.zombies[z].no ) {
                        self.zombies.splice(z, 1);
                    }
                }*/
            }
            if (evt.name == "walk") {
                if ( ini.unit.action == "attack gate" ) {
                    self.gateHealth -= ini.unit.damage;
                    if (self.gateHealth <= 0) {
                        self.gameOver("lose");
                    }
                }
                if ( ini.unit.action == "attack troop" ) {
                    self.troops[ini.unit.target].unit.health -= ini.unit.damage;
                }
            }
        }
    });
    this.unit.findTarget = function() {
        var dumDist = 10000;
        var n = -1;
        for ( var t in self.troops) {
            if ( self.troops[t].unit.type == ini.unit.type && self.troops[t].unit.health > 0 ) {
                var dist = Math.sqrt((self.troops[t].unit.realY - ini.unit.realY) * (self.troops[t].unit.realY - ini.unit.realY) + (self.troops[t].unit.realX - ini.unit.realX) * (self.troops[t].unit.realX - ini.unit.realX));
                if ( dist < dumDist ) {
                    dumDist = dist;
                    n = t;
                }
            }
        }
        return n;
    }
    this.update = function() {
        var zombie = this.unit;
        var distX;
        var distY;
        var attackX;
        zombie.x = zombie.realX - zombie.offsetX;
        zombie.y = zombie.realY - zombie.offsetY;
        if ( zombie.health > 0 ) {
            if ( zombie.action != "spawn" ) {
                if ( zombie.target == -1 ) { // No Target
                    zombie.target = zombie.findTarget();
                    if ( zombie.target == -1 ) { //No troops on the map
                        zombie.regX = ini.unit.offsetX * 2;
                        zombie.scaleX = -1;
                        if ( zombie.realY > json_data.entryPoint_y ) { //Not reached entry point yet
                            zombie.angle = Math.atan2((json_data.entryPoint_y - zombie.realY), (json_data.entryPoint_x - zombie.realX)) + Math.PI / 2;
                        }
                        else{ //Reached entry point, move to gate
                            zombie.angle = Math.atan2((json_data.gate_Y - zombie.realY), (json_data.gate_X - zombie.realX)) + Math.PI / 2;
                        }

                        if ( zombie.realX <= json_data.gate_X  && zombie.realY <= json_data.gate_Y ) { //Reached the gate
                            if ( zombie.action != "attack gate" ) {
                                zombie.action = "attack gate";
                            }
                        }
                        else{
                            if ( zombie.action != "walk" ) {
                                zombie.action = "walk";
                                zombie.gotoAndPlay("walk");

                            }
                            zombie.realX += json_data.zombie_moveSpeed * Math.cos(zombie.angle - Math.PI / 2); 
                            zombie.realY += json_data.zombie_moveSpeed * Math.sin(zombie.angle - Math.PI / 2);
                        }
                    }
                }
                else { //Found Target
                    if ( self.troops[zombie.target].unit.health > 0 ) { //target is not dying
                        if ( self.troops[zombie.target].unit.realX > zombie.realX ) {
                            zombie.regX = 0;
                            zombie.scaleX = 1;
                            attackX = self.troops[zombie.target].unit.realX - 10;
                        }
                        else{
                            zombie.regX = ini.unit.offsetX * 2;
                            zombie.scaleX = -1;
                            attackX = self.troops[zombie.target].unit.realX + 10;
                        }

                        distX = Math.abs(attackX - zombie.realX);
                        distY = Math.abs(self.troops[zombie.target].unit.realY - zombie.realY);
                        if ( distX < 15 && distY < 5) {
                            if ( zombie.action != "attack troop" ) {
                                zombie.action = "attack troop";
                            }
                        }
                        else {
                            zombie.angle = Math.atan2((self.troops[zombie.target].unit.realY - zombie.realY), (attackX - zombie.realX)) + Math.PI / 2;
                            if ( zombie.action != "walk" ) {
                                zombie.action = "walk";
                                zombie.gotoAndPlay("walk");
                            }

                            if ( distX >= 15 ) {
                                zombie.realX += json_data.zombie_moveSpeed * Math.cos(zombie.angle - Math.PI / 2);  
                            }

                            if ( distY  > 5 ) {
                                zombie.realY += json_data.zombie_moveSpeed * Math.sin(zombie.angle - Math.PI / 2);
                            }
                        }
                    }
                    else {
                        zombie.target = zombie.findTarget();
                    }
                }
            }
        }
        else {
            if ( zombie.action != "die" ) {
                zombie.action = "die";
                zombie.gotoAndPlay("die");
            }
        }
    }
    console.log(this);
}

game.prototype.handleTick = function() {
    var self = gameData;
    if ( self.started == true ) {

        //timer
        self.timer.loop++;
        if ( self.timer.loop >= createjs.Ticker.framerate) {
            self.timer.sec--;
            self.timer.display.text = self.secTomin(self.timer.sec);
            self.timer.loop = 0;
            self.spawnTime--;
            if ( self.timer.sec <= 0 ) {
                self.gameOver("win");
            }
        }

        //spawn zombie
       if (self.spawnTime <=0 ) {
            self.spawnTime = Math.floor((Math.random() * (json_data.spawnTime_max - json_data.spawnTime_min + 1)) + json_data.spawnTime_min);
            var spawnNo = Math.floor(Math.random() * 2) + 1;
            var spawnPoint = Math.floor(Math.random() * 2) + 1;
            //var spawnNo = 1;
            self.zombies.push(new self.zombie(json_data["spawnPoint" + spawnPoint + "_x"], json_data["spawnPoint" + spawnPoint + "_y"], spawnNo - 1, self.zombieNo));
            self.zombieNo++;
        }
        
        //messages
        for ( var m in self.messages ) {
            self.messages[m].duration--;
            if ( self.messages[m].duration <=0 ) {
                self.world.removeChild(self.messages[m].text);
                self.world.removeChild(self.messages[m].shape);
                self.world.removeChild(self.messages[m].arrow);
                self.messages.splice(m, 1);
            }
        }

        //trainer
        for ( var t in self.trainer ) {
            if ( self.trainer[t].completion >= self.trainer[t].duration ) {
                self.troops.push( new self.troop(json_data.entryPoint_x, json_data.entryPoint_y, self.trainer[t].type, self.troopsNo));
                self.troopsNo++;
                self.world.removeChild(self.trainer[t].frame);
                self.world.removeChild(self.trainer[t].barWrapper);
                self.world.removeChild(self.trainer[t].bar);
                self.world.removeChild(self.trainer[t].icon);
                self.building[self.trainer[t].type].training = false;
                self.trainer.splice(t, 1);
            }
            else{
                self.trainer[t].completion++;
                self.trainer[t].barLength = self.trainer[t].completion / self.trainer[t].duration * 68;
                self.trainer[t].bar.graphics.clear().s(json_data.buildArmy_background_color).f(json_data.buildArmy_background_color).r(self.trainer[t].barX, self.trainer[t].barY, self.trainer[t].barLength, 8);
                self.world.addChild(self.trainer[t].bar);
            }
        }

        //zombies
        for ( var z in self.zombies ) {
            self.zombies[z].update();
        }

        for ( var t in self.troops ) {
            self.troops[t].update();
        }
    }
    self.stage.update();
}

game.prototype.gameOver = function(result) {
    var self = this;
    self.app.tracker('E', 'gameover');
    console.log('over');  
    self.started = false;
    setTimeout(function() {
        createjs.Tween.get(self.world).to({alpha: 0, visible: false}, 2000).call(showEndscreen);
        function showEndscreen(){
            self.endScreen.visible = true;
            self.endScreen.alpha = 0;
            self.replayBtn.alpha = 0;
            self.storeBtn2.alpha = 0;
            createjs.Tween.get(self.endScreen).to({alpha: 1}, 1000).call(function() {
                createjs.Tween.get(self.replayBtn).to({alpha: 1}, 1000);
                createjs.Tween.get(self.storeBtn2).to({alpha: 1}, 1000);
            });
            
            if ( result == "lose" ) {
                self.win.visible = false;
                self.lose.visible = true;
            }
            else{
                self.win.visible = true;
                self.lose.visible = false;
            }
        }
    }, 1000);

}

game.prototype.restart = function() {
    var self = gameData;
    self.app.tracker('E', 'replay');
    console.log('replay');  
    for ( var z in self.zombies ) {
        self.world.removeChild(self.zombies[z].unit);
    }
    self.zombies = [];
    self.zombieNo = 0;

    for ( var t in self.troops ) {
        self.world.removeChild(self.troops[t].unit);
    }
    self.troops = [];
    self.troopsNo = 0;

    for ( var m in self.messages ) {
        self.world.removeChild(self.messages[m].text);
        self.world.removeChild(self.messages[m].shape);
        self.world.removeChild(self.messages[m].arrow);
    }
    self.messages = [];
    self.timer.sec = json_data.timer_sec;
    self.spawnTime = Math.floor((Math.random() * (json_data.spawnTime_max - json_data.spawnTime_min + 1)) + json_data.spawnTime_min);
    self.gateHealth = json_data.gate_Health;

    for ( var bp in self.buildPos ) {
        self.buildPos[bp].occupied = false;
    }

    for ( var b in self.building ) {
        self.building[b].scaleX = json_data.buildingScale_home;
        self.building[b].scaleY = json_data.buildingScale_home;
        self.building[b].x = self.building[b].homeX;
        self.building[b].y = self.building[b].homeY;
        self.building[b].built = false;
        self.building[b].training = false;
    }
    
    for ( var t in self.trainer ) {
        self.world.removeChild(self.trainer[t].frame);
        self.world.removeChild(self.trainer[t].barWrapper);
        self.world.removeChild(self.trainer[t].bar);
        self.world.removeChild(self.trainer[t].icon);
    }
    self.trainer = [];
    self.startScreen.visible = true;
    self.endScreen.visible = false;
    self.world.visible = true;
    self.world.alpha = 1;
}

var gameData = new game();