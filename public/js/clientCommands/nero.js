/* jshint esversion: 6 */

define([
  'namespace',
  'jscookie',
  'handlebars',
  'bootstrap',
  'jqueryui',
  'bootstrapslider'
],

function (namespace, Cookies, handlebars) {

  "use strict";

  const naai = 2;

  console.log(naai);

  naai = 3;

  console.log(naai);

  var
    globals = namespace,
    gTemplates = globals.gTemplates,
    template = handlebars.compile(gTemplates['buttons-app'])(),
    socket = globals.socket,
    // chess variables start here
    colours = {
      white: 'white',
      black: 'black'
    },

    gWhoIsInCheck = {
      white: false,
      black: false,
      attackers: {
        white: [],
        black: []
      },
      clearCheck: function () {
        this.white = false;
        this.black = false;
        this.attackers.white = [];
        this.attackers.black = [];
      }
    },

    players = {
      a: {
        name: 'Guy',
        colour: colours.white,
        side: 'bottom',
        inCheck: false
      },
      b: {
        name: 'Melissa',
        colour: colours.black,
        side: 'top',
        inCheck: false
      }
    },

    sides = {
      top: {
        y: 0
      },
      bottom:{
        y: 7
      }
    },

    blockColours = {
      attack: 'red',
      move: 'blue',
      check: 'yellow',
      castle: 'purple'
    },

    turn = {
      player: (players.a.colour === 'white') ? players.a : players.b,
      turnCount: 0
    },

    board = {
      xAxisBlocks : 8,
      yAxisBlocks : 8
    },

    gMoveReg = [],

    gMovesList = {},

    templates = {
      'playingBlock': handlebars.compile(gTemplates['playing-block']),
      'gamePiece': handlebars.compile(gTemplates['game-piece'])
    },

    gPieces = {
      white : {
        k  : {name: 'King', x: 4, y: 7, moveCount: 0},
        q  : {name: 'Queen', x: 3, y: 7, moveCount: 0},
        r1 : {name: 'Rook', x: 0, y: 7, moveCount: 0},
        r2 : {name: 'Rook', x: 7, y: 7, moveCount: 0},
        b1 : {name: 'Bishop', x: 2, y: 7, moveCount: 0},
        b2 : {name: 'Bishop', x: 5, y: 7, moveCount: 0},
        k1 : {name: 'Knight', x: 1, y: 7, moveCount: 0},
        k2 : {name: 'Knight', x: 6, y: 7, moveCount: 0},
        p1 : {name: 'Pawn', x: 0, y: 6, moveCount: 0},
        p2 : {name: 'Pawn', x: 1, y: 6, moveCount: 0},
        p3 : {name: 'Pawn', x: 2, y: 6, moveCount: 0},
        p4 : {name: 'Pawn', x: 3, y: 6, moveCount: 0},
        p5 : {name: 'Pawn', x: 4, y: 6, moveCount: 0},
        p6 : {name: 'Pawn', x: 5, y: 6, moveCount: 0},
        p7 : {name: 'Pawn', x: 6, y: 6, moveCount: 0},
        p8 : {name: 'Pawn', x: 7, y: 6, moveCount: 0}
      },
      black : {
        k  : {name: 'King', x: 4, y: 0, moveCount: 0},
        q  : {name: 'Queen', x: 3, y: 0, moveCount: 0},
        r1 : {name: 'Rook', x: 0, y: 0, moveCount: 0},
        r2 : {name: 'Rook', x: 7, y: 0, moveCount: 0},
        b1 : {name: 'Bishop', x: 2, y: 0, moveCount: 0},
        b2 : {name: 'Bishop', x: 5, y: 0, moveCount: 0},
        k1 : {name: 'Knight', x: 1, y: 0, moveCount: 0},
        k2 : {name: 'Knight', x: 6, y: 0, moveCount: 0},
        p1 : {name: 'Pawn', x: 0, y: 1, moveCount: 0},
        p2 : {name: 'Pawn', x: 1, y: 1, moveCount: 0},
        p3 : {name: 'Pawn', x: 2, y: 1, moveCount: 0},
        p4 : {name: 'Pawn', x: 3, y: 1, moveCount: 0},
        p5 : {name: 'Pawn', x: 4, y: 1, moveCount: 0},
        p6 : {name: 'Pawn', x: 5, y: 1, moveCount: 0},
        p7 : {name: 'Pawn', x: 6, y: 1, moveCount: 0},
        p8 : {name: 'Pawn', x: 7, y: 1, moveCount: 0}
      }
    },

    gPiecesReset = {},

    gBlockArr = {},
    gBlockIndex = [],
    gIndex = 0,

  // chess function start here


  gRules = {
    King: {
      direction: ['diagonal', 'perpendicular'],
      distance: 1,
      attack: ['diagonal', 'perpendicular'],
      calculatePossibleMoves: function (aValues, aWho) {
        // console.log('King');
        aValues.blocks.castle = getCastlingMoves(aValues.blocks, aWho);

        return removeFriendlyFire(aValues);
      }
    },
    Queen: {
      direction: ['diagonal', 'perpendicular'],
      distance: -1,
      attack: ['diagonal', 'perpendicular'],
      calculatePossibleMoves: function (aValues, aWho) {
        return removeFriendlyFire(aValues);
      }
    },
    Rook: {
      direction: ['perpendicular'],
      distance: -1,
      attack: ['perpendicular'],
      calculatePossibleMoves: function (aValues, aWho) {
        return removeFriendlyFire(aValues);
      }
    },
    Bishop: {
      direction: ['diagonal'],
      distance: -1,
      attack: ['diagonal'],
      calculatePossibleMoves: function (aValues, aWho) {
        return removeFriendlyFire(aValues);
      }
    },
    Knight: {
      direction: ['jump'],
      distance: 3,
      attack: ['jump'],
      calculatePossibleMoves: function (aValues, aWho) {
        return removeFriendlyFire(aValues);
      }
    },
    Pawn: {
      direction: ['diagonal'],
      distance: 1,
      attack: ['diagonal'],
      calculatePossibleMoves: function (aValues, aWho) {
        var
          values = aValues,
          mKey,
          i,
          moveBlockY = values.pieceBlockXY.y + (values.moveDirection * 1),
          moveBlockID = 'x' + values.pieceBlockXY.x + '_y' + moveBlockY,
          isMoveBlockEmpty =  gBlockArr[moveBlockID] === 'empty',
          doubleMoveBlockY = values.pieceBlockXY.y + (values.moveDirection * 2),
          doubleMoveBlockID = 'x' + values.pieceBlockXY.x + '_y' + doubleMoveBlockY,
          isDoubleMoveBlockEmpty =  gBlockArr[doubleMoveBlockID] === 'empty',
          move,
          // possibleMoves = [],
          moves,
          tKey,

          possibleMoves = getCleanFilter();

        if (isMoveBlockEmpty) {
          move = {
            x: values.pieceBlockXY.x,
            y: moveBlockY,
            type: 'move',
            direction: 'forward'
          };
          possibleMoves.move.push(move);
          // possibleMoves.push(move);
        }

        if (values.pieceMoveCount === 0 && isDoubleMoveBlockEmpty && isMoveBlockEmpty) {
          move = {
            x: values.pieceBlockXY.x,
            y: doubleMoveBlockY,
            type: 'move',
            direction: 'forward'
          };
          possibleMoves.move.push(move);
          // possibleMoves.push(move);
        }

        moves = removeFriendlyFire(values);

        for(mKey in moves){
          for (tKey in moves[mKey]) {
            move = moves[mKey][tKey];
            // pawns only move forward
            if ((values.pieceBlockXY.y - move.y) !== values.moveDirection) {
              //pawn cant move diagonal
              if (move.type === 'move' && move.direction === 'diagonal') {

              }
              else {
                // possibleMoves.push(moves[mKey]);
                possibleMoves[move.type].push(move);

              }
            }
          }
        }
        return possibleMoves;
      }
    }
  },

  removeFriendlyFire = function (aMoves) {
    var move, bKey, blockID, blockContent, isOccupied,
      pieceColour, moves, mKey,
      possibleMoves = getCleanFilter();

    for(bKey in aMoves.blocks){
      moves = aMoves.blocks[bKey];
      for (mKey in moves) {
        move = moves[mKey];
        blockID = 'x' + move.x + '_y' + move.y;
        blockContent = gBlockArr[blockID];
        isOccupied = blockContent !== 'empty';
        pieceColour = isOccupied ? getPieceKeys(blockContent).colour : isOccupied;

        if (pieceColour !== aMoves.pieceColour) {
          possibleMoves[move.type].push(move);
        }
      }
    }
    return possibleMoves;
  },

  prepareMoveVariables = function (aData) {
    var
      blockID = aData.blockID,
      pieceID = aData.pieceID,
      pieceKeys = getPieceKeys(pieceID),
      pieceColour = pieceKeys.colour,
      moveDirection = gPieces[pieceColour][pieceKeys.key].side === 'bottom' ? -1 : 1,
      possibleMoves = [],
      pieceBlockXY = getBlockXY(blockID),
      pieceMoveCount = gPieces[pieceColour][pieceKeys.key].moveCount,
      blocks = getPossibleMoves(aData);

    return {
      blockID:  blockID,
      pieceID:  pieceID,
      pieceColour:  pieceColour,
      moveDirection:  moveDirection,
      possibleMoves:  possibleMoves,
      pieceBlockXY:  pieceBlockXY,
      pieceKeys:  pieceKeys,
      pieceMoveCount:  pieceMoveCount,
      blocks:  blocks
    };
  },

  getPossibleMoves = function (aData) {
    var blocks = [], x, y, i, blockContent, dKey, distance, iNav, closePaths,
      blockID, pieceKeys = getPieceKeys(aData.pieceID),
      pieceColour = pieceKeys.colour,
      pieceType = gPieces[pieceColour][pieceKeys.key].name,
      pieceBlock = getBlockXY(aData.blockID),
      rules = gRules[pieceType],
      aDirections = rules.direction,
      type;

      blocks = getCleanFilter();

    //go though all directions of moves
    for (dKey in aDirections) {
      switch (aDirections[dKey]) {
        case 'jump':
          for (iNav = 0; iNav < 8; iNav++) {
            switch(iNav){
              //forward
              case 0: // 2 forward 1 left
                x = pieceBlock.x - 1;
                y = pieceBlock.y - 2;
              break;
              case 1: // 2 forward 1 right
                x = pieceBlock.x + 1;
                y = pieceBlock.y - 2;
              break;
              //right
              case 2: // 2 right 1 forward
                x = pieceBlock.x + 2;
                y = pieceBlock.y - 1;
              break;
              case 3: // 2 right 1 back
                x = pieceBlock.x + 2;
                y = pieceBlock.y + 1;
              break;
              //back
              case 4: // 2 back 1 left
                x = pieceBlock.x - 1;
                y = pieceBlock.y + 2;
              break;
              case 5: // 2 back 1 right
                x = pieceBlock.x + 1;
                y = pieceBlock.y + 2;
              break;
              //left
              case 6: // 2 left 1 forward
                x = pieceBlock.x - 2;
                y = pieceBlock.y - 1;
              break;
              case 7: // 2 left 1 back
                x = pieceBlock.x - 2;
                y = pieceBlock.y + 1;
              break;
            }
            blockID = 'x' + x + '_y' + y;
            if (gBlockArr[blockID]) {
              type = getMoveType(blockID);
              blockContent = $('#x' + x + '_y' + y).html();
              blocks[type].push({
                x: x,
                y: y,
                type: type,
                content: blockContent,
                direction: aDirections[dKey],
              });
            }
          }
        break;
        case 'perpendicular':
          closePaths = {};
          //get distance -1 means full board: 8
          distance = (rules.distance === -1) ? board.xAxisBlocks : rules.distance;
          for (i = 1; i <= distance; i++) {
            for (iNav = 0; iNav < 4; iNav++) {
              if (closePaths[iNav] !== true) {
                switch(iNav){
                 case 0: //forward
                    x = pieceBlock.x;
                    y = pieceBlock.y - i;
                  break;
                  case 1: //right
                    x = pieceBlock.x + i;
                    y = pieceBlock.y;
                  break;
                  case 2: //bottom
                    x = pieceBlock.x;
                    y = pieceBlock.y + i;
                  break;
                  case 3: //left
                    x = pieceBlock.x - i;
                    y = pieceBlock.y;
                  break;
                }
                blockID = 'x' + x + '_y' + y;
                if (gBlockArr[blockID]) {
                  type = getMoveType(blockID);
                  blockContent = $('#x' + x + '_y' + y).html();
                  blocks[type].push({
                    x: x,
                    y: y,
                    type: type,
                    content: blockContent,
                    direction: aDirections[dKey],
                  });
                  closePaths[iNav] = gBlockArr[blockID] !== 'empty';
                }
              }
            }
          }
        break;
        case 'diagonal':
          closePaths = {};
          //get distance -1 means full board: 8
          distance = (rules.distance === -1) ? board.xAxisBlocks : rules.distance;
          for (i = 1; i <= distance; i++) {
            for (iNav = 0; iNav < 4; iNav++) {
              if (closePaths[iNav] !== true) {
                switch(iNav){
                  case 0: //top left
                    x = pieceBlock.x - i;
                    y = pieceBlock.y - i;
                  break;
                  case 1: //top right
                    x = pieceBlock.x + i;
                    y = pieceBlock.y - i;
                  break;
                  case 2: //bottom left
                    x = pieceBlock.x - i;
                    y = pieceBlock.y + i;
                  break;
                  case 3: //bottom right
                    x = pieceBlock.x + i;
                    y = pieceBlock.y + i;
                  break;
                }
                blockID = 'x' + x + '_y' + y;
                if (gBlockArr[blockID]) {
                  type = getMoveType(blockID);
                  blockContent = $('#x' + x + '_y' + y).html();
                  blocks[type].push({
                    x: x,
                    y: y,
                    type: type,
                    content: blockContent,
                    direction: aDirections[dKey],
                  });
                  closePaths[iNav] = gBlockArr[blockID] !== 'empty';
                }
              }
            }
          }
        break;
      }
    }
    return blocks;
  },

  playTestMoveForward = function (aFromBlockID, aToBlockID) {
    //put whatever is in the "from" block into the "to" block
    gBlockArr[aToBlockID] = gBlockArr[aFromBlockID];
    gBlockArr[aFromBlockID] = 'empty';
  },

  playTestMoveBack = function (aFromBlockID, aToBlockID, aToBlockContent) {
    //put what is in the "to" block back into the "from" block
    gBlockArr[aFromBlockID] = gBlockArr[aToBlockID];
    //put whatever was in the "to" block back into the "to" block
    gBlockArr[aToBlockID] = aToBlockContent;
  },

  getCleanFilter = function () {
    return {
      check: [],
      move: [],
      attack: [],
      castle: []
    };
  },

  // take an array of moves and filters
  filterForEscapeCheckMoves = function (aMoves) {
    var
      mKey, tKey, blockID, toBlockContent, toBlockID,
      fromBlockID, inCheck, move,
      filteredMoves = getCleanFilter();

    //loop through blocks
    for (mKey in aMoves) {
      for (tKey in aMoves[mKey]) {
        move = aMoves[mKey][tKey];
        blockID = 'x' + move.x + '_y' + move.y;
        //if possible move block exists on board
        if(gBlockArr[blockID]){
          gWhoIsInCheck.clearCheck();

          toBlockContent = gBlockArr[blockID];
          toBlockID = blockID;
          fromBlockID = $('.highlighted').attr('id');

          //play test move
          playTestMoveForward(fromBlockID, toBlockID);

          // check if move gets player out of check
          inCheck = isKingChecked(turn.player.colour, 'filterForEscapeCheckMoves {'+ turn.player.colour +'}: ' + blockID);

          if (!inCheck) {
            filteredMoves[move.type].push(move);
          }
          else {
            // check if attacking moves are defending the king and allow through
            if (move.type === 'attack' && isDefendingKing(toBlockID)) {
              filteredMoves[move.type].push(move);
            }
          }
          //revert test move
          playTestMoveBack(fromBlockID, toBlockID, toBlockContent);
        }
      }
    }
    return filteredMoves;
  },

  isDefendingKing = function (aBlockID){
    var mKey, move, isDefending = false,
      enemyColour = turn.player.colour === 'white' ? 'black' : 'white',
      moveList = gWhoIsInCheck.attackers[enemyColour];

    for (mKey in moveList) {
      move = moveList[mKey];
      if (move.blockID === aBlockID) {
        isDefending = true;
      }
    }
    return isDefending;
  },

  getMoveType = function (aBlockID){
    var
      pieceKeys = getPieceKeys(gBlockArr[aBlockID]),
      type  = (gBlockArr[aBlockID] === 'empty') ? 'move' : (pieceKeys.key === 'k') ? 'check' : 'attack';
    return  type;
  },

  getPieceKeys = function (aPieceID, aWho) {

    // console.log('aPieceID', aPieceID);
    // console.log('aWho', aWho);

    var bits = aPieceID.split('_');
    return {
      colour: bits[0],
      key: bits[1]
    };
  },

  takePiece = function (aPieceKeys, aPieceHtml) {
    var newPieces = {}, pKey, pieceID = $(aPieceHtml).attr('id');

    $('.takenPieces').append('<br>' + pieceID);

    for(pKey in gPieces[aPieceKeys.colour]){
      if (pKey !== aPieceKeys.key) {
        newPieces[pKey] = gPieces[aPieceKeys.colour][pKey];
      }
    }
    gPieces[aPieceKeys.colour] = newPieces;
  },

  clearClicks = function () {
    $('.gamePiece').off('click');
  },

  highLightBlocks = function (aMoves) {

    // console.log('highLightBlocks aMoves: ', aMoves);

    var mKey, blockID, $block, move, tKey, moves = aMoves;

    gMovesList = [];

    for (mKey in moves) {
      for (tKey in moves[mKey]) {
        move = moves[mKey][tKey];
        blockID = 'x' + move.x + '_y' + move.y;
        // push move into global arr to check for crazy moves laters
        gMovesList.push(move);
        $block = $('#' + blockID);
        if (gBlockArr[blockID] !== 'empty') {
          $($block.children()[0]).on('click', movePiece);
        }
        else {
          $block.on('click', movePiece);
        }
        $block.addClass(move.type + 'Block');
      }
    }
  },

  isLeagalMove = function (aBlockID) {
    var mKey, move, legalType = false;
    for (mKey in gMovesList) {
      move = gMovesList[mKey];
      if ('x' + move.x + '_y' + move.y === aBlockID) {
        legalType = move.type;
      }
    }
    return legalType;
  },

  movePiece = function (aElement) {
    var
      htmlElement = $(aElement.currentTarget),
      idA = htmlElement.parent()[0].id,
      idB = aElement.target.id,
      blockID = htmlElement.hasClass('gamePiece') ? idA : idB,
      $block = $('#' + blockID),
      takenPiece,
      highlighted = $('.highlighted'),
      pieceHtml = highlighted.html(),
      pieceID = $(pieceHtml).attr('id'),
      pieceKeys,
      invertColour = turn.player.colour === 'white' ? 'black' : 'white',
      inCheck = false,
      moveType = isLeagalMove(blockID),
      king,
      rookKey, rook,
      rookBlockID,
      newRookX;

    if (moveType) {

      gWhoIsInCheck.clearCheck();

      if (gBlockArr[blockID] !== 'empty') {
        takenPiece = $($block.children()[0]);
        pieceKeys = getPieceKeys(takenPiece.attr('id'));
        //remove piece from gPieces object
        takePiece(pieceKeys, $block.html());
      }

      //register the move
      registerMove(highlighted.attr('id'), blockID, pieceHtml);

      //move rook when castling
      if (moveType === 'castle') {
        king = gPieces[turn.player.colour].k;
        rookKey = king.x > 4 ? 'r2' : 'r1';
        rook = gPieces[turn.player.colour][rookKey];
        rookBlockID = 'x' + rook.x + '_y' + rook.y;
        newRookX = king.x + (rookKey === 'r1' ? 1 : -1);
        blockID = 'x' + newRookX + '_y' + rook.y;
        registerMove(rookBlockID, blockID, $('#' + rookBlockID).html());
      }

      // check if move put the oppenents king in check
      inCheck = isKingChecked(invertColour);

      clearPossibleMoves();
      $('.checkBlock').removeClass('checkBlock');

      //increment piece/move counter
      incrementCounters(pieceID);

      //change to next player turn
      nextPlayerTurn();

      //show if king is in check
      highlightCheckedKing(turn.player.colour, inCheck);

      //display move list
      displayMoveListPanel();

      //reset clicks for next turn
      addClick4PossibleMoves();
    }
  },

  registerMove = function (aFromBlockID, aToBlockID, aPieceHtml) {
    var
      mKey,
      html = '',
      attackingPieceID = gBlockArr[aFromBlockID],
      enemyPieceID = $('#' + aToBlockID).children()[0] !== undefined ? $('#' + aToBlockID).children()[0].id : undefined,
      move,
      pieceKeys;

    pieceKeys = getPieceKeys(gBlockArr[aFromBlockID]);

    gPieces[turn.player.colour][pieceKeys.key].x = getBlockXY(aToBlockID).x;
    gPieces[turn.player.colour][pieceKeys.key].y = getBlockXY(aToBlockID).y;

    //replace enemy piece with players attacking piece
    $('#' + aToBlockID).html(aPieceHtml);
    gBlockArr[aToBlockID] = attackingPieceID;
    //remove piece from previous block
    $('#' + aFromBlockID).html('');
    gBlockArr[aFromBlockID] = 'empty';

    move = {
      player: turn.player,
      attackingPieceID: attackingPieceID,
      fromBlockID: aFromBlockID,
      toBlockID: aToBlockID,
      enemyPieceID: enemyPieceID,
      state: gBlockArr
    };

    gMoveReg.push(move);
    // send move to other player
    sendMoveToPlayer(move);
  },

  isKingChecked = function (aKingColour, aWho, aIsWhiteQueenUnderAttack) {
    var
      enemyColour = aKingColour === 'white' ? 'black' : 'white', pKey,
      inCheck = false, moves, values, mKey, pieceType, pieceID, blockID, tKey,
      move;

    // run through all peices of enemny colour
    for (pKey in gPieces[enemyColour]) {
      //get piece type to gernerate rules for possible moves
      pieceType = gPieces[enemyColour][pKey].name;
      //get blockID of enemy peice
      blockID = 'x' + gPieces[enemyColour][pKey].x + '_y' + gPieces[enemyColour][pKey].y;
      //get pieceID of enemy
      pieceID = enemyColour + '_' + pKey;
      //get values for calculating moves
      values = prepareMoveVariables({pieceID: pieceID, blockID: blockID}, pKey);
      //get possible moves
      moves = gRules[pieceType].calculatePossibleMoves(values, aWho);

      //loop through moves
      for(mKey in moves){
        for (tKey in moves[mKey]) {
          move = moves[mKey][tKey];
          //if any have the type 'check'
          if (move.type === 'check') {
            inCheck = true;
            gWhoIsInCheck[aKingColour] = inCheck;
            gWhoIsInCheck.attackers[enemyColour].push({pKey: pKey, blockID: blockID});
          }
        }
      }
    }
    return inCheck;
  },

  clearPossibleMoves = function () {
    // console.log('clearPossibleMoves');
    $('.playingBlock').removeClass('highlighted');
    $('.playingBlock').removeClass('moveBlock');
    $('.playingBlock').removeClass('attackBlock');
    $('.playingBlock').removeClass('castleBlock');

    $('.playingBlock').off('click');
    // $('.gamePiece').off('click');
  },

  displayMoveListPanel = function () {
    var mKey, html;
    //display crap pointless ignore
    for (mKey in gMoveReg){
      if (gMoveReg[mKey].enemyPieceID === undefined) {
      html += '<hr>piece[' + gMoveReg[mKey].attackingPieceID + '] on block[' +
        gMoveReg[mKey].fromBlockID + '] moved to block[' + gMoveReg[mKey].toBlockID + ']';
      }else{
      html += '<hr>piece[' + gMoveReg[mKey].attackingPieceID + '] on block[' +
        gMoveReg[mKey].fromBlockID + '] attacked block[' + gMoveReg[mKey].toBlockID +
        '] and took piece[' + gMoveReg[mKey].enemyPieceID + ']';
      }
    }
    $('.moves').html(html);
  },

  highlightCheckedKing = function (aColour, aInCheck) {
    $('#' + aColour + '_' + 'k').parent().toggleClass('checkBlock', aInCheck);
  },

  showPossibleMoves = function () {
    var moves, values, data,
      pieceID = $(this).attr('id'),
      blockID = $(this).parent().attr('id'),
      $piece = $(this),
      pieceType = $piece.attr('piece'),
      colour = $piece.attr('colour');

    //only add moves to current players
    if (turn.player.colour === colour) {
      clearPossibleMoves();
      $piece.parent().addClass('highlighted');
      data = {
        pieceID: pieceID,
        blockID: blockID
      };

      values = prepareMoveVariables(data);
      //
      moves = gRules[pieceType].calculatePossibleMoves(values, 'showPossibleMoves');
      //
      moves = filterForEscapeCheckMoves(moves);
      //
      moves.castle = filterIleagalCastling(moves);
      //
      highLightBlocks(moves, data);
    }
  },

  filterIleagalCastling = function (aMoves) {
    var move, mKey, leftRight,
      castleMoves = aMoves.castle,
      possibleMoves = [],
      king = gPieces[turn.player.colour].k,
      isLeagal;

      for (mKey in castleMoves) {
        move = castleMoves[mKey];
        leftRight = move.x > king.x ? 1 : -1;
        isLeagal = _.findWhere(aMoves.move, {x: king.x + leftRight, y: king.y});

        if (isLeagal !== undefined) {
          possibleMoves.push(move);
        }
      }

    return possibleMoves;
  },

  getCastlingMoves = function (aMoves, aWho) {
    var
      rKey, rook, rookBlockID, inc, i, x, b1, b2, b3,
      castleMoves = [],
      incArray = [-1, 1],
      colour = turn.player.colour,
      king = gPieces[colour].k;

    if (king.moveCount === 0 && !gWhoIsInCheck[colour]) {
      for (i in incArray) {
        inc = incArray[i];
        x = king.x + inc;
        b1 = 'x' + x + '_y' + king.y;
        b2 = 'x' + (x + inc) + '_y' + king.y;
        b3 = 'x' + (x + (inc * 2)) + '_y' + king.y;

        rKey = 'r' + (parseInt(i, 10) + 1);
        rook = gPieces[colour][rKey];
        rookBlockID = 'x' + rook.x + '_y' + rook.y;

        if (
          gBlockArr[b1] === 'empty' &&
          gBlockArr[b2] === 'empty' &&
          (gBlockArr[b3] === 'empty' || rookBlockID === b3) &&
          rook.moveCount === 0
        ) {
          castleMoves.push({
            x: x + inc,
            y: king.y,
            type: 'castle',
            direction: 'lateral'
          });
        }
      }
    }

    return castleMoves;
  },

  addClick4PossibleMoves = function () {
    $('.gamePiece').off('click');
    $('.playingBlock').off('click');

    $('.gamePiece').on('click', showPossibleMoves);
  },

  incrementCounters = function (aPieceID) {
    var pieceKeys = getPieceKeys(aPieceID);

    turn.turnCount++;
    gPieces[pieceKeys.colour][pieceKeys.key].moveCount++;
  },

  nextPlayerTurn = function () {
    var pKey, nextPlayer;
    for (pKey in players) {
      if(turn.player !== players[pKey]){
        nextPlayer = players[pKey];
      }
    }
    turn.player = nextPlayer;
  },

  getBlockXY = function (aID) {
    var
      bits = aID.split('_'),
      x = parseInt(bits[0].split('x')[1], 10),
      y = parseInt(bits[1].split('y')[1], 10);
    return {x: x, y: y};
  },

  shuffle = function (a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
      j = Math.floor(Math.random() * i);
      x = a[i - 1];
      a[i - 1] = a[j];
      a[j] = x;
    }
  },

  moveBlock = function () {
    if(gBlockIndex[gIndex]){
      var $it = $('#' + gBlockIndex[gIndex]);
      $it.fadeIn("slow").animate({left: $it.attr('x') + 'px', top: $it.attr('y') + 'px'}, 1, function () {
        gIndex++;
        moveBlock();
      });
    }
    else{
      placePieces();
    }
  },

  buildBoard = function () {
    var x, y, id, width, backgroundColor, colour, blockData, playingBlock,
      xCnt = board.xAxisBlocks,
      yCnt = board.yAxisBlocks;

    for (x = 0; x <  xCnt; x++) {
      for (y = 0; y <  yCnt; y++) {
        id = 'x' + x + '_y' + y;
        gBlockIndex.push(id);
        backgroundColor = (x + y) % 2 ? 'black' : 'white';
        colour = (x + y) % 2 ? 'white' : 'black';

        blockData = {
          backgroundColor: backgroundColor,
          x: x * 100,
          y: y * 100,
          title: 'block: ' + x + ' / ' + y,
          id: id,
          colour: colour
        };
        playingBlock = templates.playingBlock(blockData);
        $('.main').append(playingBlock);

        gBlockArr[id] = 'empty';
      }
    }
    shuffle(gBlockIndex);
    gIndex = 0;
    moveBlock();
  },

  setSides = function () {
    console.log(y);
  },

  placePieces = function(){
    var cKey, pKey, piece, pieceID, blockID, htmlPiece, y, bgImg, side = {},
      yPawn = {}, gamePiece, pieceData;

    side[players.a.colour] = players.a.side;
    side[players.b.colour] = players.b.side;

    yPawn[players.a.colour] = sides[players.a.side].y;
    yPawn[players.b.colour] = sides[players.b.side].y;

    for(cKey in gPieces){
      for(pKey in gPieces[cKey]){
        piece = gPieces[cKey][pKey];
        y = yPawn[cKey];
        if(piece.name === 'Pawn' && y === 7){
          y = 6;
        }
        if(piece.name === 'Pawn' && y === 0){
          y = 1;
        }

        $.extend(piece, {side: side[cKey]});

        blockID = 'x' + piece.x + '_y' + piece.y;
        bgImg = 'img/pieces/' + piece.name + '-' + cKey + '.png';
        pieceID = cKey + '_' + pKey;

        pieceData = {
          side: side[cKey],
          colour: cKey,
          piece: piece.name,
          id: pieceID,
          img: bgImg
        };
        gamePiece = templates.gamePiece(pieceData);
        $('#' + blockID).html(gamePiece);

        gBlockArr[blockID] = pieceID;
      }
    }

    checkQueenColour();

    // remove for now
    addClick4PossibleMoves();
  },

  checkQueenColour = function () {
    var clone, queen, queenBlockID, queenBlock, king, kingBlock, colour, q;
    for (colour in colours) {
      q = gPieces[colour].q;
      queen = $('#' + colour + '_q');
      queenBlockID = q !== undefined ? 'x' + q.x + '_y' + q.y : false;

      if (queenBlockID) {
        queenBlock = $('#' + queenBlockID);
        king = $('#' + colour + '_k');
        kingBlock = $('#' + king.parent()[0].id);
        if (queen.attr('colour') !== queenBlock.attr('colour')) {
          //swop queen with king
          clone = queenBlock.html();
          queenBlock.html(kingBlock.html());
          kingBlock.html(clone);
        }
      }
    }
  },
  sendMoveToPlayer = function (aMove) {
    globals.chess.main({
      move: aMove,
      turn: turn
    });
  };

  globals.chess = {
    main: function (aData) {
      console.log('chess: main');
      socket.emit('command', {
        command: 'chess',
        data: aData
      });
    },
    success: function (aData) {
      console.log('chess: success', aData);
      if (aData.gameStart) {
        // if game is started add the clicks the game pieces
        // addClick4PossibleMoves();
      }
    },
    failure: function (aData) {
      console.log('chess: failure');
    },
    render: function () {
      // console.log('chess: render');
      buildBoard();
    }
  };
});
