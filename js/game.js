/*global $ */
/*global _ */
// (function () {
    "use strict";
    //TODO: Display that a game-master has seen the topic for this round,
    //      if it's been peeked or manually set.

    //TODO: when adding or deleting players, ensure that current topicInfo and
    // gInfos are all wiped.  A deleted player could have been the impostor...

    //TODO: clicking add player should set focus there, and select contents for overwrite

    //TODO: put all game state in one object.

    //TODO: have dialogs be modal.  don't allow editing of other stuff while a dialog is forward.

    //TODO: swipe right to remove player.  Use foundation Touch.js:
    //      $('selector').spotSwipe().on('swipeleft', handleLeftSwipe);
    // ------
    //
    //DONE: Save player names to local storeage after any change to them in input text fields


    var currentTopicInfo,
        gInfos,
        topicsInfoList = TOPICS.data,

        oldTopicsInfoList = [
            {
                category: "Activity",
                topic: "Fishing",
                difficulty: 1
            },
            {
                category: "Activity",
                topic: "Sailing",
                difficulty: 1
            },
            {
                category: "Activity",
                topic: "Ballet Dancing",
                difficulty: 2
            },
            {
                category: "Activity",
                topic: "Wine Tasting",
                difficulty: 2
            },
            {
                category: "Activity",
                topic: "Parachuting",
                difficulty: 2
            },
            {
                category: "Animal",
                topic: "Ant-Eater",
                difficulty: 1
            },
            {
                category: "Animal",
                topic: "Dog",
                difficulty: 1
            },
            {
                category: "Animal",
                topic: "Cat",
                difficulty: 1
            },
            {
                category: "Animal",
                topic: "Lion",
                difficulty: 1
            },
            {
                category: "Animal",
                topic: "Giraffe",
                difficulty: 1
            },
            {
                category: "Animal",
                topic: "Octopus",
                difficulty: 1
            },
            {
                category: "Animal",
                topic: "Rhino",
                difficulty: 1
            },
            {
                category: "Animal",
                topic: "Elephant",
                difficulty: 1
            },
            {
                category: "Famous Landmark",
                topic: "Eiffel Tower",
                difficulty: 1
            },
            {
                category: "Famous Landmark",
                topic: "Big Ben",
                difficulty: 1
            },
            {
                category: "Famous Landmark",
                topic: "Pyramids",
                difficulty: 1
            },
            {
                category: "Famous Landmark",
                topic: "Niagara Falls",
                difficulty: 1
            },
            {
                category: "Food/Drink",
                topic: "Ice Cube",
                difficulty: 2
            },
            {
                category: "Food/Drink",
                topic: "Banana",
                difficulty: 2
            },
            {
                category: "Profession",
                topic: "Wrestler",
                difficulty: 2
            },
            {
                category: "Profession",
                topic: "Policeman",
                difficulty: 2
            },
            {
                category: "Profession",
                topic: "Assassin",
                difficulty: 2
            },
            {
                category: "Profession",
                topic: "Painter",
                difficulty: 2
            },
            {
                category: "Profession",
                topic: "Fisherman",
                difficulty: 1
            },
            {
                category: "Science",
                topic: "Space Station",
                difficulty: 1
            },
            {
                category: "Science",
                topic: "Mars Rover",
                difficulty: 1
            },
            {
                category: "Science",
                topic: "Mars Rover",
                difficulty: 1
            },
            {
                category: "Science",
                topic: "antimatter",
                difficulty: 3
            },
            {
                category: "Science-Fiction",
                topic: "Teleporter",
                difficulty: 1
            },
            {
                category: "Science-Fiction",
                topic: "Teleporter",
                difficulty: 1
            },
            {
                category: "Sport",
                topic: "Rugby",
                difficulty: 1
            },
            {
                category: "Transportation",
                topic: "Dog Sled",
                difficulty: 2
            },
            {
                category: "Transportation",
                topic: "Wind Surfer",
                difficulty: 2
            },
            {
                category: "Vehicle",
                topic: "Submarine",
                difficulty: 1
            },
            {
                category: "Vehicle",
                topic: "Tug Boat",
                difficulty: 1
            },
            {
                category: "Vehicle",
                topic: "Breakdown recovery truck",
                difficulty: 2
            },
            {
                category: "Vehicle",
                topic: "Tractor",
                difficulty: 1
            },
            {
                category: "Vehicle",
                topic: "Combine Harvester",
                difficulty: 1
            },
            {
                category: "Vehicle",
                topic: "Motorbike",
                difficulty: 1
            },
            {
                category: "Vehicle",
                topic: "Ambulance",
                difficulty: 1
            },
            {
                category: "Vehicle",
                topic: "Helicopter",
                difficulty: 1
            }
        ];

    $(document).ready(function () {
        $(document).foundation();

        currentTopicInfo = null;

        $('#addPlayerButton').bind('click', addPlayer);

        $('#setTopicButton').bind('click', function () {
            //clear the dialog
            $('#topicInputModal #topicInput').val("");
            $('#topicInputModal #categoryInput').val("");
        });
        $('#randomTopicButton').bind('click', function () {
            setRandomTopic();
        });

        $('#saveAndExitTopicInputModalButton').bind('click', function () {
            var info = {
                topic: $('#topicInputModal #topicInput').val(),
                category: $('#topicInputModal #categoryInput').val()
            };
            //Prevent close if topic+category are not valid
            if (!info.topic || info.topic.length < 2 || !info.category || info.category.length < 2) {
                return false;
            } else {
                setTopicInfo(info);
            }
        });


        $('#editGameButton').bind('click', editGame);
        $('#distributeTopicButton').bind('click', buildScreen2);
        $('#endAndRevealButton').bind('click', revealImpostor);
        $('#exitRevealModalButton').bind('click', function () {
            buildScreen1();
        });
        $('#startButton').bind('click', buildScreen3);

        buildScreen1();
    });


    function editGame() {
        changeScreenTo('#screenSetPlayers');
    }

    function setTopicInfo(info) {
        currentTopicInfo = info;
        updateCategoryDisplay();
        if (numPlayers() > 2 && currentTopicInfo.topic && currentTopicInfo.category) {
            $('#distributeTopicButton').show();
        } else {
            $('#distributeTopicButton').hide();
        }
    }

    function updateCategoryDisplay() {
        $('#categoryDisplay').html(currentTopicInfo ? currentTopicInfo.category : "no category set");
    }

    function toggleMenu() {
        $('#header ul').toggleClass('hide');
        $('#header .leftButton').toggleClass('pressed');
    }

    function getPlayersFromForm() {
        return $('.playerNameInput');
    }


    function numPlayers() {
        return $('#playerList li').size();
    }

    function addPlayer(opts) {
        var n = opts.name || ("Player" + (numPlayers() + 1)),
            cloned = $('#playerLiToClone').clone(),
            inp;

        cloned.removeAttr("id");
        cloned.removeAttr("style");
        cloned.addClass('playerListItem');
        cloned.appendTo('#playerList');
        inp = cloned.find(".playerNameInput");
        inp.attr("value", n);
        storePlayerList();
    }

    function nameInputChanged(obj) {
        storePlayerList();
    }

    function deletePlayer(obj) {
        $(obj).closest(".playerListItem").remove();
        storePlayerList();
    }

    function restorePlayersFromStoreage() {
        var playerNamesStr = localStorage.getItem("playerNames"),
            playerNames;
        if (playerNamesStr) {
            //TODO: playerNames may not have been in storeage
            playerNames = JSON.parse(playerNamesStr);
            return playerNames;
        } else {
            return [];
        }
    }

    function getCurrentPlayerNames() {
        return $('#playerList .playerNameInput').map(function () {
            return this.value;
        }).get();
    }

    function storePlayerList() {
        if (typeof (Storage) !== "undefined") {
            localStorage.setItem("playerNames", JSON.stringify(getCurrentPlayerNames()));
        } else {
            //Storage unsupported - do nothing
            console.log("storage is unsupported.  player list will not be stored.");
        }
    }

    function pick(arr) {
        return _.sample(arr);
    }



    function randInt(n) {
        return Math.floor(Math.random() * n);
    }

    function setRandomTopic() {
        //TODO: don't pick a topic we've played already in this session.
        var randomPick = pick(topicsInfoList);
        setTopicInfo(randomPick);
    }

    function changeScreenTo(screenId) {
        $('.screen').hide();
        $(screenId).show();
    }

    function buildScreen1() {
        changeScreenTo('#screenSetPlayers');
        $('.playerListItem').remove();
        var playerNames = restorePlayersFromStoreage();
        playerNames.forEach(function (n) {
            addPlayer({
                name: n
            });
        });

        $('#distributeTopicButton').hide();
        gInfos = [];
        currentTopicInfo = null;
        updateCategoryDisplay();
    }

    function buildScreen2() {
        if (!currentTopicInfo) {
            console.log("Can't proceed - no topic set.");
            return;
        }
        console.log('Building screen 2');
        //TODO: disable add/remove players controls.
        changeScreenTo('#screenDistributeTopic');
        var topic = currentTopicInfo.topic,
            category = currentTopicInfo.category,
            playerNames = getCurrentPlayerNames(),
            impostorInfo;

        //remove existing elems of show-list
        $('#playerListForShowTopic li').remove();
        $('#startButton').hide();

        gInfos = [];

        playerNames.forEach(function (playerName) {
            gInfos.push({
                category: category,
                topic: topic,
                isImpostor: false,
                playerName: playerName
            });
        });

        impostorInfo = _.sample(gInfos);
        impostorInfo.topic = "???";
        impostorInfo.isImpostor = true;

        playerNames.forEach(function (n, i) {
            var info = gInfos[i],
                labelText = info.playerName,
                inp = $("<a class='button large hollow expanded' data-open='showRoleModal'>" + labelText + "</a>"),
                li = $("<li>");
            inp.appendTo(li);
            inp.bind('click', function () {
                showForPlayer($(this), info);
            });
            li.appendTo('#playerListForShowTopic');
        });
    }

    function buildScreen3() {
        changeScreenTo('#screenGameInProgress');
    }

    function revealImpostor() {
        var impostorInfo = gInfos.find(function (info) {
            return info.isImpostor;
        });
        $('#revealModal .impostorName').html(impostorInfo.playerName);
        $('#revealModal .topic').html(currentTopicInfo.topic);

    }

    function showForPlayer(obj, info) {
        //TODO: Don't show topic for the impostor, show only the category.
        //TODO: Ensure dialog is cleared before and after being displayed,
        //      so that no lazy rendering gives info away where it should not.
        if (info.isImpostor) {
            $('#showRoleModal .topicDisplay').html("You're the impostor!");
            $('#showRoleModal .topicDisplayLabel').hide();
        } else {
            $('#showRoleModal .topicDisplay').html(info.topic);
            $('#showRoleModal .topicDisplayLabel').show();
        }
        $('#showRoleModal .nameDisplay').html(info.playerName);
        $('#showRoleModal .categoryDisplay').html(info.category);

        obj.closest("li").remove();
        var remainingPlayerCount = $('#playerListForShowTopic li').size();
        if (remainingPlayerCount < 1) {
            $('#startButton').show();
        }
    }
//  }());
