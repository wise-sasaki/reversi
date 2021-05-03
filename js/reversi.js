$(window).on('load', () => {
    // windowオブジェクトが読み込まれたタイミングで処理が実行される。
    initialize();
});
// クラス構文はあえて使わないように書いてみた。
/** 定数：空 */
const BLANK_STONE = 0;
/** 定数：黒 */
const BLACK_STONE = 1;
/** 定数：白 */
const WHITE_STONE = 2;
/** 現在の手番 */
let turn = 1; // 1:黒 2:白
/** プレイヤー1の色 */
let player1 = BLACK_STONE;
/** プレイヤー2の色 */
let player2 = WHITE_STONE;
/** 盤面の初期値 */
const defaultPanels = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 2, 0, 0, 0],
    [0, 0, 0, 2, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
];
/** 変更前の盤面 */
let beforePanels;
/** 変更後の盤面 */
let afterPanels;
/** 手番のスキップフラグ */
let skip = false;
/** ゲーム中フラグ */
let inplay = false;
/**
 * 初期化処理
 */
function initialize() {
    turn = 1;
    player1 = BLACK_STONE;
    player2 = WHITE_STONE;
    beforePanels = JSON.parse(JSON.stringify(defaultPanels));
    afterPanels = JSON.parse(JSON.stringify(defaultPanels));
    createReversiElemets();
    drawBoard();
    inplay = true;
}
/**
 * 盤面のHTML要素作成
 */
function createReversiElemets() {
    const elemet = $('#reversi-wrap').html();
    if (!elemet) {
        const wrap = $('<div></div>', {
            id: "reversi-wrap"
        });
        // ゲームのタイトル表示
        const title = $('<div></div>', {
            id: "reversi-title",
            text: "オセロ"
        });
        wrap.append(title);
        // ゲーム情報
        // 外枠
        const status = $('<div></div>', {
            id: "reversi-status"
        });
        // 手番表示の作成
        const turnView = $('<div></div>', {
            id: "reversi-turn",
            text: "手番：黒"
        });
        status.append(turnView);
        // 現在スコアの作成
        const scoreView = $('<div></div>', {
            id: "reversi-score",
            text: "2 - 2"
        });
        status.append(scoreView);
        // 手番プレイヤーの作成
        const playerName = $('<div></div>', {
            id: "reversi-player",
            text: turn === player1 ? "あなた" : "ＣＯＭ"
        });
        status.append(playerName);
        wrap.append(status);
        // 盤面の作成
        const modal = $('<div></div>', {
            id: "reversi-modal"
        });
        wrap.append(modal);
        const frame = $('<div></div>', {
            id: "reversi-frame"
        });
        for (let i = 0; i < afterPanels.length; i++) {
            for (let j = 0; j < afterPanels.length; j++) {
                const panel = $('<div></div>', {
                    id: `panel-${i}-${j}`,
                    addClass: "reversi-panel"
                });
                // 盤面内のマスごとにclickイベントを設定する。
                panel.on('click', (event) => addPanelHandler(event));
                const blankPanel = $('<div></div>', {
                    addClass: "blank"
                });
                panel.append(blankPanel);
                frame.append(panel);
            }
        }
        wrap.append(frame);
        // 対戦状況の作成
        const result = $('<div></div>', {
            id: "reversi-info",
            text: ""
        });
        wrap.append(result);
        $('body').append(wrap);
    }
}
/**
 * クリックされた時に発生するイベント処理です。
 * @param {*} event clickイベント
 */
function addPanelHandler(event) {
    let target = $(event.target);
    if (target.parent().attr('id') !== 'reversi-frame') {
        // パネルの子要素がクリックされたらパネル自体がクリックされたことにする。
        target = target.parent();
    }
    // クリックされたパネルの位置から配列の座標に置き換える。
    const selecty = parseInt(target.attr('id').replace('panel-', '').substring(0, 1), 10);
    const selectx = parseInt(target.attr('id').replace('panel-', '').substring(2, 3), 10);
    // パネルを変更する。
    changePanel(selectx, selecty);
    // 盤面を画面描画する。
    drawBoard();
}
/**
 * マスの変更処理です。
 * 
 * @param {*} x 列を表す0～7のx座標
 * @param {*} y 行を表す0～7のy座標
 */
function changePanel(x, y) {
    let result = false; // ひっくり返された判定
    if (afterPanels[y][x] !== BLANK_STONE) {
        // クリックされたマスが空じゃない場合、処理しない。
        return;
    }

    // 全方位に対してひっくり返すことのできる石をひっくり返す。
    if (isTopCheck(x, y)) {
        afterPanels[y][x] = turn;
        for (let i = y - 1; i >= 0; i--) {
            if (afterPanels[i][x] === (turn === 1 ? 2 : 1)) {
                afterPanels[i][x] = turn;
            } else {
                break;
            }
        }
        result = true;
    }
    if (isBottomCheck(x, y)) {
        afterPanels[y][x] = turn;
        for (let i = y + 1; i < afterPanels.length; i++) {
            if (afterPanels[i][x] === (turn === 1 ? 2 : 1)) {
                afterPanels[i][x] = turn;
            } else {
                break;
            }
        }
        result = true;
    }
    if (isLeftCheck(x, y)) {
        afterPanels[y][x] = turn;
        for (let i = x - 1; i >= 0; i--) {
            if (afterPanels[y][i] === (turn === 1 ? 2 : 1)) {
                afterPanels[y][i] = turn;
            } else {
                break;
            }
        }
        result = true;
    }
    if (isRightCheck(x, y)) {
        afterPanels[y][x] = turn;
        for (let i = x + 1; i < afterPanels[0].length; i++) {
            if (afterPanels[y][i] === (turn === 1 ? 2 : 1)) {
                afterPanels[y][i] = turn;
            } else {
                break;
            }
        }
        result = true;
    }
    if (isTopLeftCheck(x, y)) {
        const min = y < x ? y : x;
        afterPanels[y][x] = turn;
        for (let i = 1; i <= min; i++) {
            if (afterPanels[y - i][x - i] === (turn === 1 ? 2 : 1)) {
                afterPanels[y - i][x - i] = turn;
            } else {
                break;
            }
        }
        result = true;
    }
    if (isTopRightCheck(x, y)) {
        const min = y < afterPanels[0].length - x ? y : afterPanels[0].length - x;
        afterPanels[y][x] = turn;
        for (let i = 1; i <= min; i++) {
            if (afterPanels[y - i][x + i] === (turn === 1 ? 2 : 1)) {
                afterPanels[y - i][x + i] = turn;
            } else {
                break;
            }
        }
        result = true;
    }
    if (isBottomLeftCheck(x, y)) {
        const min = afterPanels.length - y < x ? afterPanels.length - y : x;
        afterPanels[y][x] = turn;
        for (let i = 1; i <= min; i++) {
            if (afterPanels[y + i][x - i] === (turn === 1 ? 2 : 1)) {
                afterPanels[y + i][x - i] = turn;
            } else {
                break;
            }
        }
        result = true;
    }
    if (isBottomRightCheck(x, y)) {
        const min = afterPanels.length - y < afterPanels[0].length - x ? afterPanels.length - y : afterPanels[0].length - x;
        afterPanels[y][x] = turn;
        for (let i = 1; i <= min; i++) {
            if (afterPanels[y + i][x + i] === (turn === 1 ? 2 : 1)) {
                afterPanels[y + i][x + i] = turn;
            } else {
                break;
            }
        }
        result = true;
    }

    if (result) {
        // ひっくり返すことができた場合、手番を入れ替え、スキップフラグを初期化する。
        turn = turn === 1 ? 2 : 1;
        skip = false;
    }
}
/**
 * 上方向のマスの入力チェック処理。
 * 
 * @param {*} x 列を表す0～7のx座標
 * @param {*} y 行を表す0～7のy座標
 * @returns ture:石を置くことができる。 false:石を置くことができない。
 */
function isTopCheck(x, y) {
    for (let i = y - 1; i >= 0; i--) {
        // 置いた石の１つ上側から処理を開始する。
        if (y === 0 || (afterPanels[y - 1][x] === 0 || afterPanels[y - 1][x] === turn)) {
            // 上端または上側に石が置かれてないまたは上側が自分の石の場合には処理しない。
            break;
        }
        // ひっくり返す石があるか判定する。
        let reverseFlg = false;
        if (afterPanels[i][x] === (turn === 1 ? 2 : 1)) {
            // 対戦相手の石なら処理を続ける。
            continue;
        } else if (afterPanels[i][x] === turn) {
            // 自分の石ならひっくり返すことができる。
            reverseFlg = true;
        }
        return reverseFlg;
    }
    return false;
}
/**
 * 下方向のマスの入力チェック処理。
 * 
 * @param {*} x 列を表す0～7のx座標
 * @param {*} y 行を表す0～7のy座標
 * @returns ture:石を置くことができる。 false:石を置くことができない。
 */
function isBottomCheck(x, y) {
    for (let i = y + 1; i < afterPanels.length; i++) {
        // 置いた石の１つ下側から処理を開始する。
        if (y === afterPanels.length - 1 || afterPanels[y + 1][x] === 0 || afterPanels[y + 1][x] === turn) {
            // 下端または下側に石が置かれてないまたは下側が自分の石の場合には処理しない。
            break;
        }
        // ひっくり返す石があるか判定する。
        let reverseFlg = false;
        if (afterPanels[i][x] === (turn === 1 ? 2 : 1)) {
            // 対戦相手の石なら処理を続ける。
            continue;
        } else if (afterPanels[i][x] === turn) {
            // 自分の石ならひっくり返すことができる。
            reverseFlg = true;
        }
        return reverseFlg;
    }
    return false;
}
/**
 * 左方向のマスの入力チェック処理。
 * 
 * @param {*} x 列を表す0～7のx座標
 * @param {*} y 行を表す0～7のy座標
 * @returns ture:石を置くことができる。 false:石を置くことができない。
 */
function isLeftCheck(x, y) {
    for (let i = x - 1; i >= 0; i--) {
        // 置いた石の１つ左側から処理を開始する。
        if (x === 0 || afterPanels[y][x - 1] === 0 || afterPanels[y][x - 1] === turn) {
            // 左端または左側に石が置かれてないまたは左側が自分の石の場合には処理しない。
            break;
        }
        // ひっくり返す石があるか判定する。
        let reverseFlg = false;
        if (afterPanels[y][i] === (turn === 1 ? 2 : 1)) {
            // 対戦相手の石なら処理を続ける。
            continue;
        } else if (afterPanels[y][i] === turn) {
            // 自分の石ならひっくり返すことができる。
            reverseFlg = true;
        }
        return reverseFlg;
    }
    return false;
}
/**
 * 右方向のマスの入力チェック処理。
 * 
 * @param {*} x 列を表す0～7のx座標
 * @param {*} y 行を表す0～7のy座標
 * @returns ture:石を置くことができる。 false:石を置くことができない。
 */
function isRightCheck(x, y) {
    for (let i = x + 1; i < afterPanels.length; i++) {
        // 置いた石の１つ右側から処理を開始する。
        if (x === afterPanels[0].length - 1 || afterPanels[y][x + 1] === 0 || afterPanels[y][x + 1] === turn) {
            // 右端または右側に石が置かれてないまたは右側が自分の石の場合には処理しない。
            break;
        }
        // ひっくり返す石があるか判定する。
        let reverseFlg = false;
        if (afterPanels[y][i] === (turn === 1 ? 2 : 1)) {
            // 対戦相手の石なら処理を続ける。
            continue;
        } else if (afterPanels[y][i] === turn) {
            // 自分の石ならひっくり返すことができる。
            reverseFlg = true;
        }
        return reverseFlg;
    }
    return false;
}
/**
 * 左上方向のマスの入力チェック処理。
 * 
 * @param {*} x 列を表す0～7のx座標
 * @param {*} y 行を表す0～7のy座標
 * @returns ture:石を置くことができる。 false:石を置くことができない。
 */
function isTopLeftCheck(x, y) {
    // 左上方向端までの最短距離を算出する。
    const topLeft = y < x ? y : x;
    let count = 0;
    for (let i = 0; i < topLeft; i++) {
        // 盤面の端まで処理する。
        if (y === 0 || x === 0 || afterPanels[y - 1][x - 1] === 0 || afterPanels[y - 1][x - 1] === turn) {
            // 上端ではないまたは左端または左上側に石が置かれてないまたは左上側が自分の石の場合には処理しない。
            break;
        }
        // ひっくり返す石があるか判定する。
        let reverseFlg = false;
        if (afterPanels[y - (count + 1)][x - (count + 1)] === (turn === 1 ? 2 : 1)) {
            // 対戦相手の石なら処理を続ける。
            count++;
            continue;
        } else if (afterPanels[y - (count + 1)][x - (count + 1)] === turn) {
            // 自分の石ならひっくり返すことができる。
            reverseFlg = true;
        }
        return reverseFlg;
    }
    return false;
}
/**
 * 右上方向のマスの入力チェック処理。
 * 
 * @param {*} x 列を表す0～7のx座標
 * @param {*} y 行を表す0～7のy座標
 * @returns ture:石を置くことができる。 false:石を置くことができない。
 */
function isTopRightCheck(x, y) {
    // 右上方向端までの最短距離を算出する。
    const topRight = y < (afterPanels[0].length - 1) - x ? y : (afterPanels[0].length - 1) - x;
    let count = 0;
    for (let i = 0; i < topRight; i++) {
        // 盤面の端まで処理する。
        if (y === 0 || x === afterPanels[0].length - 1 || afterPanels[y - 1][x + 1] === 0 || afterPanels[y - 1][x + 1] === turn) {
            // 上端ではないまたは右端または右上側に石が置かれてないまたは右上側が自分の石の場合には処理しない。
            break;
        }
        // ひっくり返す石があるか判定する。
        let reverseFlg = false;
        if (afterPanels[y - (count + 1)][x + (count + 1)] === (turn === 1 ? 2 : 1)) {
            // 対戦相手の石なら処理を続ける。
            count++;
            continue;
        } else if (afterPanels[y - (count + 1)][x + (count + 1)] === turn) {
            // 自分の石ならひっくり返すことができる。
            reverseFlg = true;
        }
        return reverseFlg;
    }
    return false;
}
/**
 * 左下方向のマスの入力チェック処理。
 * 
 * @param {*} x 列を表す0～7のx座標
 * @param {*} y 行を表す0～7のy座標
 * @returns ture:石を置くことができる。 false:石を置くことができない。
 */
function isBottomLeftCheck(x, y) {
    // 左下方向端までの最短距離を算出する。
    const bottomLeft = (afterPanels.length - 1) - y < x ? (afterPanels.length - 1) - y : x;
    let count = 0;
    for (let i = 0; i < bottomLeft; i++) {
        // 盤面の端まで処理する。
        if (y === afterPanels.length - 1 || x === 0 || afterPanels[y + 1][x - 1] === 0 || afterPanels[y + 1][x - 1] === turn) {
            // 下端ではないまたは左端または左下側に石が置かれてないまたは左下側が自分の石の場合には処理しない。
            break;
        }
        // ひっくり返す石があるか判定する。
        let reverseFlg = false;
        if (afterPanels[y + (count + 1)][x - (count + 1)] === (turn === 1 ? 2 : 1)) {
            // 対戦相手の石なら処理を続ける。
            count++;
            continue;
        } else if (afterPanels[y + (count + 1)][x - (count + 1)] === turn) {
            // 自分の石ならひっくり返すことができる。
            reverseFlg = true;
        }
        return reverseFlg;
    }
    return false;
}
/**
 * 右下方向のマスの入力チェック処理。
 * 
 * @param {*} x 列を表す0～7のx座標
 * @param {*} y 行を表す0～7のy座標
 * @returns ture:石を置くことができる。 false:石を置くことができない。
 */
function isBottomRightCheck(x, y) {
    // 右上方向端までの最短距離を算出する。
    const bottomRight = (afterPanels.length - 1) - y < (afterPanels[0].length - 1) - x ? (afterPanels.length - 1) - y : (afterPanels[0].length - 1) - x;
    let count = 0;
    for (let i = 0; i < bottomRight; i++) {
        // 盤面の端まで処理する。
        if (y === afterPanels.length - 1 || x === afterPanels[0].length - 1 || afterPanels[y + 1][x + 1] === 0 || afterPanels[y + 1][x + 1] === turn) {
            // 下端ではないまたは右端または右下側に石が置かれてないまたは右下側が自分の石の場合には処理しない。
            break;
        }
        // ひっくり返す石があるか判定する。
        let reverseFlg = false;
        if (afterPanels[y + (count + 1)][x + (count + 1)] === (turn === 1 ? 2 : 1)) {
            // 対戦相手の石なら処理を続ける。
            count++;
            continue;
        } else if (afterPanels[y + (count + 1)][x + (count + 1)] === turn) {
            // 自分の石ならひっくり返すことができる。
            reverseFlg = true;
        }
        return reverseFlg;
    }
    return false;
}
/**
 * ゲームの終了を判定します。
 * 
 * @returns true:終了 false:継続
 */
function isGameOver() {
    // 全てのマスにおいて石を置くことができるか判定する。
    for (let y = 0; y < afterPanels.length; y++) {
        for (let x = 0; x < afterPanels[y].length; x++) {
            if (afterPanels[y][x] !== BLANK_STONE) {
                continue;
            }
            if (isTopCheck(x, y)) {
                return false;
            }
            if (isBottomCheck(x, y)) {
                return false;
            }
            if (isLeftCheck(x, y)) {
                return false;
            }
            if (isRightCheck(x, y)) {
                return false;
            }
            if (isTopLeftCheck(x, y)) {
                return false;
            }
            if (isTopRightCheck(x, y)) {
                return false;
            }
            if (isBottomLeftCheck(x, y)) {
                return false;
            }
            if (isBottomRightCheck(x, y)) {
                return false;
            }
        }
    }
    if (skip) {
        // どちらのプレイヤーも石を置くことができない場合、ゲーム終了する。
        return true;
    }
    // 片方のプレイヤーが石を置けない場合は、ゲームを継続する。
    skip = true;
    return false;
}
/**
 * 盤面や画面情報を描画します。
 */
function drawBoard() {
    // エフェクトを反映するためにひっくり返した個数を数える。
    let changeCount = 0;
    for (let i = 0; i < afterPanels.length; i++) {
        for (let j = 0; j < afterPanels[i].length; j++) {
            if (beforePanels[i][j] !== afterPanels[i][j]) {
                changeCount++;
            }
        }
    }
    let addEffect = "small-effect";
    if (changeCount < 3) {
        addEffect = "small-effect";
    } else if (changeCount < 6) {
        addEffect = "midium-effect";
    } else {
        addEffect = "large-effect";
    }
    // 盤面を描画に反映する。
    let elements = $('.reversi-panel');
    let count = 0;
    for (let i = 0; i < afterPanels.length; i++) {
        for (let j = 0; j < afterPanels[i].length; j++) {
            $(elements[count]).empty();
            if (afterPanels[i][j] === BLANK_STONE) {
                const blankPanel = $('<div></div>', {
                    addClass: "blank"
                });
                $(elements[count]).append(blankPanel);
            } else if (afterPanels[i][j] === BLACK_STONE) {
                const blackPanel = $('<div></div>', {
                    addClass: "circle black"
                });
                $(elements[count]).append(blackPanel);
                if (beforePanels[i][j] !== afterPanels[i][j]) {
                    // ひっくり返した石にエフェクトを付与する。
                    blackPanel.addClass(addEffect);
                }
                setTimeout(() => {
                    // 一定時間でエフェクトを削除する。
                    blackPanel.removeClass(addEffect);
                }, 500);
            } else if (afterPanels[i][j] === WHITE_STONE) {
                const whitePnale = $('<div></div>', {
                    addClass: "circle white"
                });
                $(elements[count]).append(whitePnale);
                if (beforePanels[i][j] !== afterPanels[i][j]) {
                    // ひっくり返した石にエフェクトを付与する。
                    whitePnale.addClass(addEffect);
                }
                setTimeout(() => {
                    // 一定時間でエフェクトを削除する。
                    whitePnale.removeClass(addEffect);
                }, 500);
            }
            count++;
        }
    }
    // 変更前の盤面に変更後の盤面を上書きする。
    beforePanels = JSON.parse(JSON.stringify(afterPanels));

    // 対戦情報を更新する。
    updateGameInfo();
    // COM操作時にユーザー操作を受け付けないよう盤面をモーダル化する。
    if (turn === player2) {
        $('#reversi-modal').css({
            width: `${$('#reversi-frame').outerWidth()}px`,
            height: `${$('#reversi-frame').outerHeight()}px`
        });
    } else {
        $('#reversi-modal').css({
            width: `0px`,
            height: `0px`
        });
    }
    // コンピュータを処理する。
    computer();
}
/**
 * 対戦情報を更新する。
 */
function updateGameInfo() {
    $('#reversi-turn').text(turn === BLACK_STONE ? "手番：黒" : "手番：白");
    $('#reversi-player').text(turn === player1 ? "あなた" : "ＣＯＭ");
    let blackScore = 0;
    let whiteScore = 0;
    for (let i = 0; i < afterPanels.length; i++) {
        for (let j = 0; j < afterPanels[i].length; j++) {
            if (afterPanels[i][j] === BLACK_STONE) {
                blackScore++;
            } else if (afterPanels[i][j] === WHITE_STONE) {
                whiteScore++;
            }
        }
    }
    $('#reversi-score').text(`黒${blackScore} - ${whiteScore}白`);
    // ゲームの継続を判定する。
    if (isGameOver() || blackScore + whiteScore === 64) {
        // どちらのプレイヤーも石を置くことができない場合、勝敗を表示する。
        if (blackScore < whiteScore) {
            $('#reversi-info').text(`白の勝ち`);
        } else if (whiteScore < blackScore) {
            $('#reversi-info').text(`黒の勝ち`);
        } else {
            $('#reversi-info').text(`引き分け`);
        }
        inplay = false;
    } else if (skip) {
        // 片方のプレイヤーが石を置くことができない場合、相手の番に交代する。
        $('#reversi-info').text(`${turn === BLACK_STONE ? '黒' : '白'}は石を置ける場所がありません。`);
        turn = turn === 1 ? 2 : 1;
        $('#reversi-turn').text(turn === BLACK_STONE ? "手番：黒" : "手番：白");
        $('#reversi-player').text(turn === player1 ? "あなた" : "ＣＯＭ");
    } else {
        $('#reversi-info').text(``);
    }
}
/**
 * 対戦相手のコンピューターの処理です。
 */
function computer() {
    if (turn === player2) {
        // 実際は即時に処理できるが、（コンピュータが思考している風な）演出のため3000ミリ秒は処理を遅らせます。
        setTimeout(() => {
            if (turn === player2) {
                // コンピューターがクリックするまで無限ループします。
                let loopCount = 0;
                while (inplay) {
                    const answer = ai();
                    let x = answer.x;
                    let y = answer.y;
                    // 入力範囲チェック
                    if (!Number.isInteger(x) && (x < 0 || x >= 8) || !Number.isInteger(y) && (y < 0 || y >= 8)) {
                        console.error(`computer's answer is not appropriate. Return integer values from 0 to 7. x[${x}] y[${y}]`);
                        x = Math.floor(Math.random() * 8);
                        y = Math.floor(Math.random() * 8);
                    }
                    // 指定されたマスが石を置くことができる場合、画面上のマスをクリックします。
                    if (afterPanels[y][x] === BLANK_STONE) {
                        if (isTopCheck(x, y) || isBottomCheck(x, y) || isLeftCheck(x, y) || isRightCheck(x, y)
                            || isTopLeftCheck(x, y) || isTopRightCheck(x, y) || isBottomLeftCheck(x, y) || isBottomRightCheck(x, y)) {
                            $(`#panel-${y}-${x}`).click();
                            break;
                        }
                    }
                    if (loopCount === 50) {
                        // 置けない状況が長続きした場合、画面情報を更新する。
                        updateGameInfo();
                        loopCount = 0;
                    }
                    loopCount++;
                }
            }
        }, 3000);
    }
}
/**
 * コンピューターの思考回路を処理します。
 * 
 * @returns '{x, y}' x:列をあらわす0～7までの整数 y:行をあらわす0～7までの整数
 */
function ai() {
    // wright here. from here
    // デフォルトではランダムに整数値を返却しています。
    const x = Math.floor(Math.random() * 8);
    const y = Math.floor(Math.random() * 8);
    // wright here. to here
    // console.log(`computer is thinking about it. x[${x}] : y[${y}]`);
    return { x, y }
}