/* js doc
Requires jQuery.
 */

var i,
  j,
  cardNum,
  cards = new Array(),
  suits = new Array()
;
suits = ["H", "S", "C", "D"];
for (i = 0; i < 4; i++) {
  for (j = 0; j < 13; j++) {
    cardNum = (i * 13) + j
    cards[cardNum] = (j + 1) + suits[i];
  }
}

/*for (i = 0; i < cards.length; i++) {
  console.log(i + ": " + cards[i]);
}

num = Math.random(52);
console.log(num);*/

$( document ).ready(function() {

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