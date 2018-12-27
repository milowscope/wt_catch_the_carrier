//////////////////////////////////////////////////////////////////////
//
// 運び手に追いつけるか？
//
// シーン：
// 1.createTitleScene()
//   最初に呼び出されるタイトルロゴ
//
// 2.createGameScene()
//   ゲーム本体
//
// 3.createFujinScene()
//   例のシーン。
//   createGameOverSceneとほぼ同等のため修正した場合のコピペ注意
//
// 4.createGameOverScene()
//   被弾後のシーン
//   createFujinSceneとほぼ同等のため修正した場合のコピペ注意
//
//////////////////////////////////////////////////////////////////////

var GROUND_LINE  = 240;
var SCROLL_SPEED = 15; // 背景、オブジェクトのスクロールの速さ
var BG_WIDTH = 1000;
var WINDOW_WIDTH = 500;
var WINDOW_HEIGHT = 350;
var DEBUG = false; // trueで当たり判定なし
var FUJIN_DEBUG = false; // trueで風刃でしぬ

var SCROLL = 0;  // スクロール量
var CHARA_X = 0; // 隊長の横位置
var CHARA_Y = 0; // 隊長の縦位置
var SUWA = 0;    // 諏訪
var DAMAGE = 0;  // 被弾数
var SLIP_REASON = "normal"; // コケたモーション normal or banana
enchant();

window.onload = function () {
	
	init();
	
	var game = new Game(WINDOW_WIDTH, WINDOW_HEIGHT);
	
	// 事前読み込み画像
	game.preload('img/logo.png','img/border.png','img/button1.png','img/button_tw.png',
				'img/hairein_run2.png', 'img/hairein_slip.png', 'img/hairein_shadow.png',
				'img/hairein_fujin.png', 'img/hairein_shadow2.png', 'img/fujin.png',
				'img/hairein_jump.png', 'img/hairein_banana_slip.png',
				'img/osamu2.png', 'img/cube.png',
				'img/bird1.png', 'img/bird2.png',
				'img/banana.png', 'img/escudo2.png');
	game.fps = 20;
	setScale(game);

	game.onload = function() {
		////////////////////////////////////////////////////////////////
		// タイトル
		var createTitleScene = function() {
			var scene = new Scene();
			var bg1 = addWall(game, scene, 0, 0);
			
			var logo = new Sprite(300,200);
			logo.x = 100;
			logo.y = 100;
			logo.image = game.assets['img/logo.png'];
			scene.addChild(logo);
			
			scene.addEventListener(Event.TOUCH_START, function(e) {
				game.replaceScene(createGameScene());
			});
			return scene;
		};
		
		////////////////////////////////////////////////////////////////
		// ゲーム本体
		var createGameScene = function() {
			var scene = new Scene(); 
			var bg1 = addWall(game, scene, 0, 0);
			var bg2 = addWall(game, scene, BG_WIDTH-50, 0);

			
			// スコア
			var scoreLabel = new Label("");
			scoreLabel.color = '#fff';
			scoreLabel.x = 50;
			scoreLabel.y = 50;
			scene.addChild(scoreLabel);
			
			// 障害物
			var enemy1 = new Sprite(20,51);
			enemy1.x = 500;
			enemy1.y = GROUND_LINE + 0;
			enemy1.image = game.assets['img/escudo2.png'];
			scene.addChild(enemy1);
			
			var enemy2 = new Sprite(20,51);
			enemy2.x = 1500;
			enemy2.y = GROUND_LINE+0;
			enemy2.image = game.assets['img/escudo2.png'];
			scene.addChild(enemy2);
			
			var banana = new Sprite(20,16);
			banana.x = 800;
			banana.y = GROUND_LINE+30;
			banana.image = game.assets['img/banana.png'];
			scene.addChild(banana);

			// 鳥 max5
			var bird_back = [addBird2(game, scene, -2050, 200),
							addBird2(game, scene, -2220, 220),
							addBird2(game, scene, -2080, 240),
							addBird2(game, scene, -2060, 230),
							addBird2(game, scene, -2030, 250)]
			bird_back[1].frame = 1;
			bird_back[2].frame = 2;
			bird_back[3].frame = 3;
			bird_back[4].frame = 0;
			

			// 流れてくる諏訪
			var cube = addCube(game, scene, -100, GROUND_LINE + 20);
			
			
			// fujin
			var fujin = new Sprite(350,30);
			fujin.x = -1000; // 横位置
			fujin.y = GROUND_LINE + 20; // 縦位置
			fujin.image = game.assets['img/fujin.png'];
			scene.addChild(fujin);
			
			// キャラ
			var shadow = new Sprite(45,42);
			shadow.x = 50; // 横位置
			shadow.y = GROUND_LINE; // 縦位置
			shadow.image = game.assets['img/hairein_shadow.png'];
			scene.addChild(shadow);
			var chara = new Sprite(45,42);
			chara.x = 50; // 横位置
			chara.y = GROUND_LINE; // 縦位置
			chara.image = game.assets['img/hairein_run2.png'];
			scene.addChild(chara);
			var jump = new Sprite(65,62);
			jump.x = -1050; // 横位置（見えないところに隠しておいてモーション差し替え）
			jump.y = GROUND_LINE; // 縦位置
			jump.image = game.assets['img/hairein_jump.png'];
			scene.addChild(jump);
			
			if (FUJIN_DEBUG ==  true) {
				chara.x = 299;
				shadow.x = 299;
			}

			// とり max5
			var bird_front = [addBird1(game, scene, -2100, 180),
							addBird1(game, scene, -2140, 280),
							addBird1(game, scene, -2110, 120),
							addBird1(game, scene, -2020, 180),
							addBird1(game, scene, -2030, 240)];
			bird_front[1].frame = 1;
			bird_front[2].frame = 2;
			bird_front[3].frame = 3;
			bird_front[4].frame = 0;
			
			scene.addEventListener(Event.ENTER_FRAME, function(){

				// 背景をスクロールさせる
				bg1.x -= SCROLL_SPEED;
				bg2.x -= SCROLL_SPEED;
				if (bg1.x <= -800) {
					bg1.x = 0;
				}if (bg2.x <= 0) {
					bg2.x = 800;
				}
				// スクロールをスコア加算
				SCROLL += 1;
				scoreLabel.text = 'score:' + getScore();
				
				// 障害物1移動
				if (SCROLL % 20 == 0 && enemy1.x < 0) {
					enemy1.x = WINDOW_WIDTH + getRand(100);
				}
				if (enemy1.x <= BG_WIDTH && enemy1.x > -BG_WIDTH) {
					enemy1.x -= SCROLL_SPEED;
				}
				// 障害物2移動
				if (SCROLL % 30 == 0 && enemy2.x < 0) {
					enemy2.x = BG_WIDTH;
				}
				if (enemy2.x <= BG_WIDTH && enemy2.x > -BG_WIDTH) {
					enemy2.x -= SCROLL_SPEED;
				}
				// バナナ移動
				if (SCROLL % 72 == 0 && banana.x < 0) {
					banana.x = WINDOW_WIDTH + getRand(300);
				}
				if (banana.x <= BG_WIDTH && banana.x > -BG_WIDTH) {
					banana.x -= SCROLL_SPEED;
				}
				
				// 諏訪移動
				if (SCROLL % 17 == 0 && cube.x < 0) {
					cube.x = BG_WIDTH;
				}
				if (cube.x <= BG_WIDTH && cube.x > -BG_WIDTH) {
					cube.x -= SCROLL_SPEED;
				}
				
				
				// 風刃
				if (chara.x > 300) {
					fujin.x = -20;
					if (game.frame % 2) {
						fujin.frame ++;
					}
					if (fujin.frame > 2) {
						game.replaceScene(createFujinScene());
					}
				}
				
				// 当たり判定
				if (chara.intersect(enemy1)) {
					// 当たった
					SUWA -= 3;
					if (SUWA < 0) {
						SUWA = 0;
					}
					DAMAGE++;
					changeBird(bird_back, bird_front, chara);
					console.log(SUWA);
					if (DEBUG == false) {
						if (SUWA <= 0) {
							SLIP_REASON = 'normal';
							game.replaceScene(createGameOverScene());
						} else {
							enemy1.x = -10;
						}
					}
				}
				
				if (chara.intersect(enemy2)) {
					// 当たった
					SUWA -= 3;
					if (SUWA < 0) {
						SUWA = 0;
					}
					DAMAGE++;
					changeBird(bird_back, bird_front, chara);
					console.log(SUWA);
					if (DEBUG == false) {
						if (SUWA <= 0) {
							SLIP_REASON = 'normal';
							game.replaceScene(createGameOverScene());
						} else {
							enemy2.x = -10;
						}
					}
				}
				if (chara.intersect(banana)) {
					if (DEBUG == false) {
						SLIP_REASON = 'banana';
						game.replaceScene(createGameOverScene());
					}
				}
				
				
				// 諏訪ゲット
				if (chara.intersect(cube)) {
					cube.x = -100;
					SUWA++;
					changeBird(bird_back, bird_front, chara);
				}
			});

			bird_back[0].addEventListener(Event.ENTER_FRAME, function() {
				if (SCROLL % 4 == 0) {
					for(i = 0; i < 5; i++) {
						bird_back[i].frame++;
						bird_front[i].frame++;
					}
				}
				// 鳥の上下移動
				bird_front[0].tl.moveBy(0, -50, 17, enchant.Easing.CUBIC_EASEOUT).moveBy(0, 50, 18, enchant.Easing.CUBIC_EASEIN);
				bird_front[1].tl.moveBy(0, -70, 30, enchant.Easing.CUBIC_EASEOUT).moveBy(0, 70, 35, enchant.Easing.CUBIC_EASEIN);
				bird_front[2].tl.moveBy(0, -30, 50, enchant.Easing.CUBIC_EASEOUT).moveBy(0, 30, 50, enchant.Easing.CUBIC_EASEIN);
				bird_front[3].tl.moveBy(0, -20, 50, enchant.Easing.CUBIC_EASEOUT).moveBy(0, 20, 50, enchant.Easing.CUBIC_EASEIN);
				bird_front[4].tl.moveBy(0, -40, 50, enchant.Easing.CUBIC_EASEOUT).moveBy(0, 40, 50, enchant.Easing.CUBIC_EASEIN);
				bird_back[0].tl.moveBy(0, -20, 50, enchant.Easing.CUBIC_EASEOUT).moveBy(0, 20, 50, enchant.Easing.CUBIC_EASEIN);
				bird_back[1].tl.moveBy(0, -10, 40, enchant.Easing.CUBIC_EASEOUT).moveBy(0, 10, 40, enchant.Easing.CUBIC_EASEIN);
				bird_back[2].tl.moveBy(0, -30, 40, enchant.Easing.CUBIC_EASEOUT).moveBy(0, 30, 40, enchant.Easing.CUBIC_EASEIN);
				bird_back[3].tl.moveBy(0, -10, 50, enchant.Easing.CUBIC_EASEOUT).moveBy(0, 10, 50, enchant.Easing.CUBIC_EASEIN);
				bird_back[4].tl.moveBy(0, -20, 40, enchant.Easing.CUBIC_EASEOUT).moveBy(0, 20, 40, enchant.Easing.CUBIC_EASEIN);
				if (bird_front[0].y > 250) {
					bird_front[0].y = 180;
				}
				if (bird_front[1].y > 300) {
					bird_front[1].y = 200;
                }
			});
			
			chara.addEventListener(Event.ENTER_FRAME, function() {
				if (SCROLL % 3 == 0) {
					chara.frame ++;
					shadow.frame ++;
				}
				if (SCROLL % 2 == 0) {
					jump.frame ++;
				}
				if (SCROLL % 10 == 0) {
					// 隊長の右へ進む量
					chara.x += 2;
					shadow.x += 2;
					jump.x += 2;
					for(i = 0; i < 5; i++) {
						bird_back[i].x++;
						bird_front[i].x++;
					}
				}
				CHARA_X = chara.x;
				CHARA_Y = chara.y;
			});
			
			var touch_flag = false;
			scene.addEventListener(Event.TOUCH_START, function(e){
				if (touch_flag == true) {
					return;
				}
				touch_flag = true;
				// タッチでジャンプ
				jump.x = chara.x;
				chara.x = -1000;
				jump.tl.moveBy(0, -100, 8, enchant.Easing.CUBIC_EASEOUT) 
				.moveBy(0, 100, 8, enchant.Easing.CUBIC_EASEIN)
				.then(function() {
					chara.x = jump.x;
					jump.x = -1000;
					touch_flag = false;
				});
			});
			return scene;
		};

		////////////////////////////////////////////////////////////////
		// 風刃に斬られる
		var createFujinScene = function() {
			var scene = new Scene();
			var bg1 = addWall(game, scene, 0, 0);
			
			
            // hujin
            var fujin = new Sprite(350,30);
			fujin.x = -20; // 横位置
			fujin.y = GROUND_LINE + 20; // 縦位置
			fujin.image = game.assets['img/fujin.png'];
			scene.addChild(fujin);
			fujin.frame = 3;
			
			// キャラ
			var shadow = new Sprite(65,62);
			shadow.x = CHARA_X; // 横位置
			shadow.y = GROUND_LINE - 10; // 縦位置
			shadow.image = game.assets['img/hairein_shadow2.png'];
			scene.addChild(shadow);
			var chara = new Sprite(65,62);
			chara.x = CHARA_X; // コケた位置
			chara.y = GROUND_LINE - 10;
			chara.image = game.assets['img/hairein_fujin.png'];
			scene.addChild(chara);
			
			
			var osamu = new Sprite(64,53);
			osamu.x = 420;
			osamu.y = GROUND_LINE - 15;
			osamu.image = game.assets['img/osamu2.png'];
			scene.addChild(osamu);
			
			
			// とり
			var bird1 = addBird1(game, scene, 100+CHARA_X, 180);
			var bird2 = addBird1(game, scene, 140+CHARA_X, 280);
			var bird3 = addBird1(game, scene, 50+CHARA_X, 230);
			var bird4 = addBird2(game, scene, 50+CHARA_X-50, 200);
			var bird5 = addBird2(game, scene, 40+CHARA_X-50, 220);
			bird2.frame = 1;
			bird3.frame = 2;
			bird5.frame = 1;
			
			var button = addScore(game, scene, '「斬撃……！どこから……」');
			
			button[0].addEventListener(Event.TOUCH_START, function(e) {
				init();
				game.replaceScene(createGameScene());
			});
			button[1].addEventListener(Event.TOUCH_START, function(e) {
				var msg = tweetScore('「斬撃……！どこから……」');
				if(!window.open(msg,'surfing')) {
					location.href = msg;
				}
			});
			
			
			chara.addEventListener(Event.ENTER_FRAME, function() {
				if (game.frame % 1 == 0) {
					if (chara.frame < 5) {
						chara.frame ++;
						shadow.frame ++;
					}
				}
				if (game.frame % 4 == 0) {
					if (chara.frame > 4 && chara.frame < 9) {
						chara.frame ++;
						shadow.frame ++;
					}
				}
				if (chara.frame > 1) {
					fujin.x = -1000;
				}
			});
			bird1.addEventListener(Event.ENTER_FRAME, function() {
				if (game.frame % 4 == 0) {
					bird1.frame ++;
					bird2.frame ++;
					bird3.frame ++;
					bird4.frame ++;
					bird5.frame ++;
				}
				bird1.x += 10;
				bird2.x += 10;
				bird3.x += 10;
				
				bird1.tl.moveBy(0, -50, 17, enchant.Easing.CUBIC_EASEOUT)
				.moveBy(0, 50, 18, enchant.Easing.CUBIC_EASEIN);
				bird2.tl.moveBy(0, -70, 30, enchant.Easing.CUBIC_EASEOUT)
				.moveBy(0, 70, 35, enchant.Easing.CUBIC_EASEIN);
				bird3.tl.moveBy(0, -50, 50, enchant.Easing.CUBIC_EASEOUT)
				.moveBy(0, 50, 50, enchant.Easing.CUBIC_EASEIN);
				bird4.tl.moveBy(0, -20, 50, enchant.Easing.CUBIC_EASEOUT)
				.moveBy(0, 20, 50, enchant.Easing.CUBIC_EASEIN);
				bird5.tl.moveBy(0, -10, 40, enchant.Easing.CUBIC_EASEOUT)
				.moveBy(0, 10, 40, enchant.Easing.CUBIC_EASEIN);
				if (bird1.y > 250) {
					bird1.y = 180;
				}
				if (bird2.y > 300) {
					bird2.y = 200;
                }
			});
			return scene;
		}
		
		////////////////////////////////////////////////////////////////
		// ゲームオーバー
		var createGameOverScene = function() {
			var scene = new Scene();
			var bg1 = addWall(game, scene, 0, 0);
			
			
			// キャラ
			var chara;
			if (SLIP_REASON == 'normal') {
				chara = new Sprite(60,42);
				chara.x = CHARA_X; // コケた位置
				chara.y = GROUND_LINE;
				chara.image = game.assets['img/hairein_slip.png'];
			} else {
				chara = new Sprite(65,62);
				chara.x = CHARA_X; // コケた位置
				chara.y = GROUND_LINE;
				chara.image = game.assets['img/hairein_banana_slip.png'];
			}
			scene.addChild(chara);
			
			
			// とり
			var bird1 = addBird1(game, scene, 100+CHARA_X, 180);
			var bird2 = addBird1(game, scene, 140+CHARA_X, 280);
			var bird3 = addBird1(game, scene, 50+CHARA_X, 230);
			var bird4 = addBird2(game, scene, 50+CHARA_X-50, 200);
			var bird5 = addBird2(game, scene, 40+CHARA_X-50, 220);
			bird2.frame = 1;
			bird3.frame = 2;
			bird5.frame = 1;
			
			var button = addScore(game, scene, '運び手に逃げられた…');
			
			
			button[0].addEventListener(Event.TOUCH_START, function(e) {
				init();
				game.replaceScene(createGameScene());
			});
			button[1].addEventListener(Event.TOUCH_START, function(e) {
				var msg = tweetScore('運び手に逃げられた…');
				if(!window.open(msg,'surfing')) {
					location.href = msg;
				}
			});
			chara.addEventListener(Event.ENTER_FRAME, function() {
				if (SLIP_REASON == 'normal') {
					if (game.frame % 4 == 0) {
						if (chara.frame < 5) {
							chara.frame ++;
						}
					}
				} else {
					if (game.frame % 1 == 0) {
						if (chara.frame < 4) {
							chara.frame ++;
						}
					}
					if (game.frame % 3 == 0) {
						if (chara.frame >= 4 && chara.frame < 9) {
							chara.frame ++;
						}
					}
				}
			});
			bird1.addEventListener(Event.ENTER_FRAME, function() {
				if (game.frame % 4 == 0) {
					bird1.frame ++;
					bird2.frame ++;
					bird3.frame ++;
					bird4.frame ++;
					bird5.frame ++;
				}
				bird1.x += 10;
				bird2.x += 10;
				bird3.x += 10;
				
				bird1.tl.moveBy(0, -50, 17, enchant.Easing.CUBIC_EASEOUT)
				.moveBy(0, 50, 18, enchant.Easing.CUBIC_EASEIN);
				bird2.tl.moveBy(0, -70, 30, enchant.Easing.CUBIC_EASEOUT)
				.moveBy(0, 70, 35, enchant.Easing.CUBIC_EASEIN);
				bird3.tl.moveBy(0, -50, 50, enchant.Easing.CUBIC_EASEOUT)
				.moveBy(0, 50, 50, enchant.Easing.CUBIC_EASEIN);
				bird4.tl.moveBy(0, -20, 50, enchant.Easing.CUBIC_EASEOUT)
				.moveBy(0, 20, 50, enchant.Easing.CUBIC_EASEIN);
				bird5.tl.moveBy(0, -10, 40, enchant.Easing.CUBIC_EASEOUT)
				.moveBy(0, 10, 40, enchant.Easing.CUBIC_EASEIN);
				if (bird1.y > 250) {
					bird1.y = 180;
				}
				if (bird2.y > 300) {
					bird2.y = 200;
                }
			});
			return scene;
		}
		game.replaceScene(createTitleScene());
	};
		
	game.start();
}

///////////////////////////////////////////////////////////////////////////////////

function init() {
	SCROLL = 0;  // スクロール量
	SUWA = 0;    // 諏訪
	DAMAGE = 0;  // 被弾数
}

// 背景
function addWall(game, scene, x, y) {
	var bg1 = new Sprite(BG_WIDTH, 350);
	bg1.image = game.assets['img/border.png'];
	bg1.x = x;
	bg1.y = y;
	scene.addChild(bg1);
	return bg1;
}

// 前にいる方の鳥
function addBird1(game, scene, x, y) {
	var bird = new Sprite(32,32);
	bird.x = x;
	bird.y = y;
	bird.image = game.assets['img/bird1.png'];
	scene.addChild(bird);
			
	return bird;
}

// 後ろにいる方の鳥
function addBird2(game, scene, x, y) {
	var bird = new Sprite(50,42);
	bird.x = x;
	bird.y = y;
	bird.image = game.assets['img/bird2.png'];
	scene.addChild(bird);
			
	return bird;
}

// 諏訪
function addCube(game, scene, x, y) {
	var obj = new Sprite(12,16);
	obj.x = x;
	obj.y = y;
	obj.image = game.assets['img/cube.png'];
	scene.addChild(obj);
			
	return obj;
}

// スコア計算
function getScore() {
	return SCROLL*20 + 'pt';
}

// スコアツイート文字列
function tweetScore(msg) {
	return 'https://twitter.com/intent/tweet?text='+
		encodeURIComponent(msg + '\n' +
			'今回のスコア：'+getScore()+'！残生物弾：'+ SUWA + ',被弾数：' + DAMAGE +
			' #運び手に追いつけるか\nhttps://milowscope.matrix.jp/run/index.html');
}

function addScore(game, scene, msg, ) {

	var title = new Label(msg);
	title.x = game.width/2 - 70;
	title.y = game.height/2 - 70;
	scene.addChild(title);
	var label = new Label('スコア　'+ getScore());
	label.x = game.width/2 - 50;
	label.y = game.height/2 - 40;
	scene.addChild(label);
	var label2 = new Label('残生物弾：'+ SUWA + '　被弾数：' + DAMAGE);
	label2.x = game.width/2 - 70;
	label2.y = game.height/2 - 20;
	scene.addChild(label2);
	var button = new Sprite(100,30);
	button.x = 100;
	button.y = GROUND_LINE-50;
	button.image = game.assets['img/button1.png'];
	scene.addChild(button);	
	var button2 = new Sprite(100,30);
	button2.x = 300;
	button2.y = GROUND_LINE-50;
	button2.image = game.assets['img/button_tw.png'];
	scene.addChild(button2);
	
	return [button, button2]
}

// 鳥出現
function changeBird(bird_back, bird_front, chara) {

	/**
	var bird_back = [addBird2(game, scene, 50, 200),
			addBird2(game, scene, 220, 220),
			addBird2(game, scene, 80, 240),
			addBird2(game, scene, 60, 230),
			addBird2(game, scene, 30, 250)]
	var bird_front = [addBird(game, scene, 100, 180),
			addBird(game, scene, 140, 280),
			addBird(game, scene, 110, 120),
			addBird(game, scene, 20, 180),
			addBird(game, scene, 30, 240)];
	**/
	if (SUWA < 1) {
		bird_back[0].x  = -1000;
		bird_front[0].x = -1000;
		bird_back[1].x  = -1000;
		bird_front[1].x = -1000;
		bird_back[2].x  = -1000;
		bird_front[2].x = -1000;
		bird_back[3].x  = -1000;
		bird_front[3].x = -1000;
		bird_back[4].x  = -1000;
		bird_front[4].x = -1000;
	}
	if (SUWA == 1)  {
		bird_back[0].x = 50 + chara.x - 50;
		bird_front[0].x = -1000;
		bird_back[1].x  = -1000;
		bird_front[1].x = -1000;
		bird_back[2].x  = -1000;
		bird_front[2].x = -1000;
		bird_back[3].x  = -1000;
		bird_front[3].x = -1000;
		bird_back[4].x  = -1000;
		bird_front[4].x = -1000;
	}
	if (SUWA == 2)  {
		bird_front[0].x = 100 + chara.x - 50;
		bird_back[1].x  = -1000;
		bird_front[1].x = -1000;
		bird_back[2].x  = -1000;
		bird_front[2].x = -1000;
		bird_back[3].x  = -1000;
		bird_front[3].x = -1000;
		bird_back[4].x  = -1000;
		bird_front[4].x = -1000;
	}
	if (SUWA == 3)  {
		bird_back[1].x = 120 + chara.x - 50;
		bird_front[1].x = -1000;
		bird_back[2].x  = -1000;
		bird_front[2].x = -1000;
		bird_back[3].x  = -1000;
		bird_front[3].x = -1000;
		bird_back[4].x  = -1000;
		bird_front[4].x = -1000;
	}
	if (SUWA == 4)  {
		bird_front[1].x = 140 + chara.x - 50;
		bird_back[2].x  = -1000;
		bird_front[2].x = -1000;
		bird_back[3].x  = -1000;
		bird_front[3].x = -1000;
		bird_back[4].x  = -1000;
		bird_front[4].x = -1000;
	}
	if (SUWA == 5)  {
		bird_back[2].x = 80 + chara.x - 50;
		bird_front[2].x = -1000;
		bird_back[3].x  = -1000;
		bird_front[3].x = -1000;
		bird_back[4].x  = -1000;
		bird_front[4].x = -1000;
	}
	if (SUWA == 6)  {
		bird_front[2].x = 110 + chara.x - 50;
		bird_back[3].x  = -1000;
		bird_front[3].x = -1000;
		bird_back[4].x  = -1000;
		bird_front[4].x = -1000;
	}
	if (SUWA == 7)  {
		bird_back[3].x = 60 + chara.x - 50;
		bird_front[3].x = -1000;
		bird_back[4].x  = -1000;
		bird_front[4].x = -1000;
	}
	if (SUWA == 8)  {
		bird_front[3].x = 20 + chara.x - 50;
		bird_back[4].x  = -1000;
		bird_front[4].x = -1000;
	}
	if (SUWA == 9)  {
		bird_back[4].x = 30 + chara.x - 50;
		bird_front[4].x = -1000;
	}
	if (SUWA == 10) {
		bird_front[4].x = 30 + chara.x - 50;
	}
}

function getRand(num) {
	// 1～num
	return Math.ceil( Math.random()*num );
}

// スケール調整
function setScale(game) {
	var scaleWidth  = window.innerWidth  / game.width;
	var scaleHeight = window.innerHeight / game.height;
	var scale = scaleWidth;
	if (scaleWidth > scaleHeight) {
		scale = scaleHeight;
	}
	game.scale = scale;
}

