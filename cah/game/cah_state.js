/*
 * A class to hold the game state.
 */
function State(gameCode) {
    this.gameCode = gameCode;
    this.players = [];
    this.round = 0;
    this.submissions = {};
    this.voted = {};
    this.results = [];
    this.winningScore = 0;
}

/*
 * Restarts the game state.
 */
State.prototype.restart = function() {
    this.round = 0;
    this.submissions = {};
    this.voted = {};
    this.results = [];
    for (var i = 0; i < this.players.length; i++) {
        this.players[i].score = 0;
    }
    this.winningScore = 0;
};

/*
 * Starts a new round.
 */
State.prototype.newRound = function() {
    this.round++;
    this.submissions = {};
    this.voted = {};
    this.results = [];
};

/*
 * Add a new player.
 */
State.prototype.addUser = function(userid, username) {
    this.players.push({
        userid: userid,
        username: username,
        score: 0
    });
};

/*
 * Remove a player.
 */
State.prototype.removeUser = function(userid) {
    var indexToRemove = -1;
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].userid === userid) {
            indexToRemove = i;
        }
    }
    if (indexToRemove > -1) {
        this.players.splice(indexToRemove, 1);
    }
};

State.prototype.getUser = function(userid) {
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].userid === userid) {
            return this.players[i];
        }
    }
};

/*
 * Adds a user's response to the list of submissions.
 */
State.prototype.addUserAnswer = function(userid, cardText, done) {
    if (userid in this.submissions) {
        this.submissions[userid].cards += ' / ' + cardText;
        this.submissions[userid].done = done;
    } else {
        this.submissions[userid] = {
            done: done,
            cards: cardText
        };
    }
};

/*
 * Determines if all users are done submitting their responses. If the
 * round is over, initialize the result list.
 */
State.prototype.isRoundOver = function() {
    var allDone = true;
    var count = 0;
    for (var userid in this.submissions) {
        allDone &= this.submissions[userid].done;
        count++;
    }
    return allDone && count >= this.players.length;
};

/*
 * Initialize the results list at the start of voting. Return the
 * submitted map of those users who finished before timing out.
 */
State.prototype.startVoting = function() {
    var submittedMap = {};
    for (var userid in this.submissions) {
        var submission = this.submissions[userid];
        if (submission.done) {
            submittedMap[userid] = submission.cards;
            this.results.push({
                userid: userid,
                cards: submission.cards,
                voters: []
            });
        }
    }
    return submittedMap;
};

/*
 * Adds a user's vote to the voted map and the result list. Results is
 * a list of objects containing the user, their submitted cards, and
 * the list of the people who voted for them.
 */
State.prototype.addUserVote = function(userid, cardText, done) {
    this.voted[userid] = done;
    var useridWithVote = null;
    for (var i = 0; i < this.results.length; i++) {
        if (this.results[i].cards === cardText) {
            useridWithVote = this.results[i].userid;
            console.log(this.getUser(userid).username + ' voted for ' +
                this.getUser(useridWithVote).username);
            this.results[i].voters.push(userid);
        }
    }
    for (var i = 0; i < this.players.length; i++) {
        if (useridWithVote === this.players[i].userid) {
            this.players[i].score++;
        }
    }
};

/*
 * Determines if all users are done submitting their votes.
 */
State.prototype.isVotingOver = function() {
    var allDone = true;
    var count = 0;
    for (var userid in this.voted) {
        allDone &= this.voted[userid];
        count++;
    }
    return allDone && count >= this.players.length;
};

/*
 * The game is over if any player has more than the winning
 * score and is the sole leader. Assumes player list is
 * already sorted.
 */
State.prototype.isGameOver = function() {
    if (this.players[0].score >= this.winningScore &&
        this.players[0].score > this.players[1].score) {
            return true;
    }
    return false;
};
