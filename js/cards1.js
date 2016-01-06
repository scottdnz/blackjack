/* js doc
Requires jQuery.
 */




$(function() {
  
   // Prototype for a player's info & cards
  var protoPlayer = {
    "credits": 20,
    "currentAction": "stand",
    "name": "",
    "hand": new Array(),
    "currentBet": 3,
    "addCredits": function(amount) {
      this.credits += parseInt(amount);
    },
    "subtractCredits": function(amount) {
      this.credits -= parseInt(amount);
    },
    "countVal": function() {
      var i,
        cardNum,
        total;
      total = 0;
      for (var i = 0; i < this.hand.length; i++) {
        cardNum = String(this.hand[i]).substring(0,2);
        total += parseInt(cardNum);
      }
      return total;  
    }
  };
  
  
  // Prototype for the card deck
  var protoDeck = {
    "col": new Array(),
    "initialise": function () {
      // Assign cards into deck. Each card will have a value like "03H", "11S".
      var i,
        j,
        cardPosn,
        cardRank;
      for (i = 0; i < 4; i++) {
        for (j = 0; j < 13; j++) {
          cardPosn = (i * 13) + j;
          cardRank = j + 1;
          if (cardRank < 10) {
            cardRank = "0" + cardRank;
          }       
          this.col[cardPosn] = cardRank + suits[i];
        }
      }
    },
    "shuffle": function () {
      var i, 
        newCol = new Array(),
        randPos,
        posnFound,
        oldColLength;
      oldColLength = this.col.length;
      // Fill up the array with blank values
      for (i = 0; i < oldColLength; i++) {
        newCol[i] = "";
      }
      for (i = 0; i < oldColLength; i++) {
        /* Keep checking random positions in the new collection to see if one 
         * position is empty. if so, fill it with a card's value. */
        posnFound = false;
        while (posnFound == false) {
          randPos = Math.round(Math.random() * oldColLength);
          if (newCol[randPos] == "") {
            newCol[randPos] = this.col[i];
            posnFound = true;
          }
        }
      }
      this.col = newCol;
    },
    "setCol": function(theCol) {
      this.col = theCol;
    },
    "getCol": function() {
      return this.col;
    }
  };
  
  
  // Factory function to make players based on prototype
  var makePlayer = function() {
    var player = Object.create(protoPlayer);
    player.hand = new Array();  // Clear anything
    return player;
  }
  
  
  var makeDeck = function() {
    var deck = Object.create(protoDeck);
    deck.setCol(new Array());
    deck.initialise();
    deck.shuffle();
    return deck;
  }
  
  
  var res,
    suits = ["H", "S", "C", "D"],
    cardLblMap = {"01": "Ace", "02": "Two", "03": "Three", "04": "Four",
      "05": "Five", "06": "Six", "07": "Seven", "08": "Eight", 
      "09": "Nine", "10": "Ten", "11": "Jack", "12": "Queen", "13": "King"},
    suitsLblMap = {"H": "Hearts", "S": "Spades", "C": "Clubs", "D": "Diamonds"},
    result
  ;
  
  
  function getCardLabel(card) {
    var cardNum = card.substring(0,2),
      cardSuit = card.substring(2); 
    return cardLblMap[cardNum] + " of " + suitsLblMap[cardSuit];
  }
  
  
  function testPrintCol(col) {
    var k;
    for (k = 0; k < col.length; k++) {
  //    process.stdout.write(col[k] + ", " + getCardLabel(String(col[k])) + "\t");
    }
    console.log("\n*****");
  }
  
  
  function takeCardFromTopAssign(deckCol, otherCol, times) {
  //  console.log("Length: " + deckCol.length);
    var i,
      cardTaken;
    for (i = 0; i < times; i++) {
      cardTaken = deckCol.splice(0, 1);
      otherCol.push(cardTaken); 
    }
    return {"deckCol": deckCol,
        "otherCol": otherCol};
  }
  
  
  function actionChecker(cmd, player1, dealer, colDeck) {
    var result = {"status": "ok",
      "msg": "", //Bet placed
      "finished": "n"
    };
    if (cmd["type"] == "bet") {
      if (cmd["action"] == "raise") {
        if (player1.credits < cmd["amount"]) {
          result["status"] = "failed";
          result["msg"] = "Not enough credits";
        }
        else {
          player1.currentBet = cmd["amount"];
          result["msg"] = "Bet placed";
          console.log("Bet for " + player1.currentBet);
        }
      }
    }
    else if (cmd["type"] == "decision") {  
      if (cmd["action"] == "hit") {
        // Give the player another card
        res = takeCardFromTopAssign(colDeck.getCol(), player1.hand, 1);
        player1.hand = res["otherCol"];
        colDeck.setCol(res["deckCol"]);
        result["msg"] = "You received another card. ";
        if (player1.countVal() > 21) {
          result["status"] = "failed";
          result["msg"] += "Player1 bust! ";
          result["finished"] = "y";
        }
        
        // Give the dealer another card
        res = takeCardFromTopAssign(colDeck.getCol(), dealer.hand, 1);
        dealer.hand = res["otherCol"];
        colDeck.setCol(res["deckCol"]);
        result["msg"] += "Dealer received another card. ";
        if (dealer.countVal() > 21) {
          result["msg"] += "Dealer bust! ";
          result["finished"] = "y";
        }
  
        
        console.log("Deck length: " + colDeck.getCol().length + ", \np1 hand: " + 
          player1.hand + ", value: " + player1.countVal());
        console.log("Dealer hand: " + dealer.hand + ", value: " + dealer.countVal());  
      }
      if (cmd["action"] == "stand") {
      
      }
    }
    return {"result": result, 
      "player1": player1, 
      "colDeck": colDeck};
  }
  
  
  /* Only needs to be done once at start */
  var colDeck = makeDeck();
  console.log("Deck is initialised");
  //console.log("Deck init. Deck length: " + colDeck.getCol().length);
  //testPrintCol(colDeck.getCol());
   
  
  //console.log("Dealer assigning. Deck length: " + colDeck.getCol().length);
  
    
    //Assign two cards to dealer
    var dealer = makePlayer();
    dealer.name = "Dealer";
    
    var player1 = makePlayer();
    player1.name = "Player1";
    /* ******* */
    
    /* Needs to be done at the start of every deal */
    player1.action = "stand";
    dealer.action = "stand";
    //Assign two cards to player1
    res = takeCardFromTopAssign(colDeck.getCol(), dealer.hand, 2);
    dealer.hand = res["otherCol"];
    colDeck.hand = res["deckCol"];
    //console.log("Player 1 assigning. Deck length: " + colDeck.getCol().length);
    
    //Assign two cards to player1
    res = takeCardFromTopAssign(colDeck.getCol(), player1.hand, 2);
    player1.hand = res["otherCol"];
    colDeck.setCol(res["deckCol"]); 
  
  console.log("Player 1 is dealt this hand:");
  testPrintCol(player1.hand);
  console.log("Dealer is dealt this hand:");
  testPrintCol(dealer.hand);
  
  // Clear player and dealer cards displayed
  for (i = 1; i < 7; i++) {
    $("#pCard" + i) .html("");
    $("#dCard" + i) .html("");
  }

  for (i = 0; i < player1.hand.length; i++) {
    imgFName = player1.hand[i] + ".png";
    console.log("imgFName: " + imgFName);
    cardBoxName = "#pCard" + (i + 1);
    $(cardBoxName).html(
      "<img src=\"./img/cards_small/" + imgFName + "\" class=\"cardImg\">");
  }  
  
  for (i = 0; i < dealer.hand.length; i++) {
    imgFName = dealer.hand[i] + ".png";
    console.log("imgFName: " + imgFName);
    cardBoxName = "#dCard" + (i + 1);
    setTimeout(function(){
    }, 1000);
    $(cardBoxName).html(
      "<img src=\"./img/cards_small/" + imgFName + "\" class=\"cardImg\">");
  }
  
  /* ****** */
  
  // Test data. Player Places bet
  var cmd = {"type": "bet", // "decision"
    "action": "raise", // "hit", "stand"
    "amount": "5" 
  };
  
  res = actionChecker(cmd, player1, dealer, colDeck);
  result = res["result"];
  
  console.log(res["result"]);
  //if (res["result"]["status"] == "ok") {
  //  player1 = res["player1"];
  //  colDeck = res["colDeck"];
  //}
  
  // Test data. 
  var cmd = {"type": "decision", // "decision"
    "action": "hit", // "hit", "stand" 
  };
  
  var finished = false;
  while (! finished) {
    console.log("*****");
    res = actionChecker(cmd, player1, dealer, colDeck);
    result = res["result"];
  
    console.log(res["result"]);
    if (result["finished"] == "y") {
      finished = true;
  //    break;
    }
    if (res["result"]["status"] == "ok") {
      player1 = res["player1"];
      colDeck = res["colDeck"];
    }
  }
  
  // If a new card was dealt and the finished signal was given
  if (cmd["type"] == "decision" && cmd["action"] == "hit" && finished) {
    // If the player won (dealer bust)
    if (res["result"]["status"] == "ok") {
      player1.addCredits(player1.currentBet);
      console.log("Bet won by player! credits: " + player1.credits);
    }
    // If the dealer won (player1 bust)
    else {
      player1.subtractCredits(player1.currentBet);
      console.log("Bet lost by player! credits: " + player1.credits);
    }
  }
  
  
  //player1.addCredits(5);
  //console.log("Credits: " + player1.credits);
  //player1.subtractCredits(7);
  //console.log("Credits: " + player1.credits);
  //player1.setAction("Raise"); 
  //console.log("Player 1 name, credits, action: " + player1.name + ", " + player1.credits + ", " +
  //player1.currentAction);
  
  //var dealer = makePlayer();
  //dealer.setName("Dealer");
  //console.log("Dealer name, credits, action: " + dealer.name + ", " + dealer.credits + ", " +
  //dealer.currentAction);



  $("#btnArrowUp").hover(function() {
    $(this).attr("src", "./img/arrow_up_inverse.png");
    $(this).css("cursor", "pointer");
  }, 
    function() {
      $(this).attr("src", "./img/arrow_up.png")
  });
  
  $("#btnArrowDown").hover(function() {
    $(this).attr("src", "./img/arrow_down_inverse.png");
    $(this).css("cursor", "pointer");
  }, 
    function() {
      $(this).attr("src", "./img/arrow_down.png")
  });
  
 
  
});
