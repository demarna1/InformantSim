ScreenEnum = {
    LOBBY: 0,
    ROUND_TRANSITION: 1,
    ROUND: 2
}

function State() {
    this.gameCode = '????';
    this.screen = ScreenEnum.LOBBY;
    this.transition = 0;
    this.players = [];
    this.colors = ['skyblue', 'lime', 'orange', 'pink'];
    this.roundWord = 'abcdef';
    this.roundMatches = [];
}

State.prototype.addUser = function(userid, username) {
    var rindex = Math.floor(Math.random()*this.colors.length);
    this.players.push({
        userid: userid,
        username: username,
        gameMaster: false,
        dirty: true,
        color: this.colors.splice(rindex, 1)[0],
        score: 0,
        roundScore: 0
    });
    if (this.players.length == 1) {
        this.players[0].gameMaster = true;
    }
};

State.prototype.removeUser = function(userid) {
    var indexToRemove = -1;
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].userid === userid) {
            indexToRemove = i;
        }
    }
    if (indexToRemove > -1) {
        var removedPlayer = this.players.splice(indexToRemove, 1)[0];
        this.colors.push(removedPlayer.color);
        if (removedPlayer.gameMaster && this.players.length >= 1) {
            this.players[0].gameMaster = true;
        }
    }
    // If we have less than 2 people, end the game
    if (this.players.length < 2 && state.screen != ScreenEnum.LOBBY) {
        state.screen = ScreenEnum.LOBBY;
        state.transition = 0;
    }
};

State.prototype.getUser = function(userid) {
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].userid === userid) {
            return this.players[i];
        }
    }
};

State.prototype.startGame = function(word, matches) {
    state.screen = ScreenEnum.ROUND;
    state.transition = 0;
    for (var i = 0; i < this.players.length; i++) {
        this.players[i].score = 0;
        this.players[i].roundScore = 0;
    }
    this.roundWord = word;
    this.roundMatches = [];
    for (var i = 0; i < matches.length; i++) {
        this.roundMatches.push({
            word : matches[i],
            solved: false,
            color: 'white'
        });
    }
};

State.prototype.getWordScore = function(word) {
    switch (word.length) {
    case 3: return 200;
    case 4: return 300;
    case 5: return 500;
    case 6: return 1000;
    }
}

State.prototype.submitWord = function(word, userid) {
    for (var i = 0; i < this.roundMatches.length; i++) {
        var match = this.roundMatches[i];
        if (match.word === word && !match.solved) {
            match.solved = true;
            match.color = this.getUser(userid).color;
            return this.getWordScore(match.word);
        }
    }
    return 0;
};
