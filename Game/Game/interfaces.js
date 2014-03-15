var PlayerState;
(function (PlayerState) {
    PlayerState[PlayerState["Standing"] = 0] = "Standing";
    PlayerState[PlayerState["Walking"] = 1] = "Walking";
})(PlayerState || (PlayerState = {}));

var WalkDirection;
(function (WalkDirection) {
    WalkDirection[WalkDirection["Up"] = 0] = "Up";
    WalkDirection[WalkDirection["Down"] = 1] = "Down";
    WalkDirection[WalkDirection["Left"] = 2] = "Left";
    WalkDirection[WalkDirection["Right"] = 3] = "Right";
    WalkDirection[WalkDirection["None"] = 4] = "None";
})(WalkDirection || (WalkDirection = {}));
