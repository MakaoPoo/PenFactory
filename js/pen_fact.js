let PI = 3.141592;
var width, height;
var canvasScale;

var renderer;
var scene;
var camera;

var penObj = new Array(4);
var capObj = new Array(3);
var objSourceList = ["pen", "cap"];

var penDir = new Array(penObj.length);
var isCapSet =  new Array(capObj.length);
let penSpan = 100;
var movingCount = penSpan;
var rotateCount = 180;
var score = new Array(35);
var miss;

var touchStartX;
var touchStartY;
var touchEndX;
var touchEndY;

var leftSwipe = false;
var upSwipe = false;
var downSwipe = false;
var oneTap = false;

var touchstartTime;

var load3dFlag = false;

function threejsSetting() {
  // レンダラーを作成
  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('WebGL'),
    alpha: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  // シーンを作成
  scene = new THREE.Scene();
  renderer.setClearColor(0x000000, 0.0);
  // カメラを作成
  camera = new THREE.PerspectiveCamera(45, 640 / 480, 1, 10000);
  camera.position.set(0, 32, +300);
  // 平行光源
  const directionalLight1 = new THREE.PointLight(0xFFFFFF, 0.5);
  directionalLight1.position.set(-50, 100, -50);
  const directionalLight2 = new THREE.PointLight(0xFFFFFF, 0.5);
  directionalLight2.position.set(50, 100, -50);
  const directionalLight3 = new THREE.PointLight(0xFFFFFF, 0.5);
  directionalLight3.position.set(150, 100, -50);

  const directionalLight4 = new THREE.PointLight(0xFFFFFF, 0.5);
  directionalLight4.position.set(-50, 100, -50);
  const directionalLight5 = new THREE.PointLight(0xFFFFFF, 0.5);
  directionalLight5.position.set(50, 100, -50);
  const directionalLight6 = new THREE.PointLight(0xFFFFFF, 0.5);
  directionalLight6.position.set(150, 100, -50);

  const directionalLight7 = new THREE.DirectionalLight(0xFFFFFF, 0.5);
  directionalLight7.position.set(20, -50, 100);

  // シーンに追加
  scene.add(directionalLight1);
  scene.add(directionalLight2);
  scene.add(directionalLight3);
  scene.add(directionalLight4);
  scene.add(directionalLight5);
  scene.add(directionalLight6);
  scene.add(directionalLight7);
}

$(window).on('load', function(){
  initWebAPI({
    pon: "resource/pon.wav",
    hyoi: "resource/hyoi.wav",
    next: "resource/next.wav"
  });
  loadSound("pon");
  loadSound("hyoi");
  loadSound("next");
  threejsSetting();

  $(window).trigger('resize');

  $('#game_back').css("width",  640*canvasScale);
  $('#game_back').css("height", 480*canvasScale);
  $('#game_back').css("left", width/2 - 320*canvasScale);
  $('#game_back').css("top", height/2 - 240*canvasScale);

  var ls = localStorage;
  var lsScore = JSON.parse(ls.getItem("score"));
  if(lsScore == null) {
    for(var i=0; i<score.length; i++) {
      score[i] = 0;
    }
  }else {
    score = lsScore;
  }

  loadObj(0);

  var device = ["iPhone", "iPad", "iPod", "Android"];
  for(var i=0; i<device.length; i++){
    if (navigator.userAgent.indexOf(device[i])>0){
      $('.touch_area').on('touchstart', function(event) {
        event.preventDefault();
        touchstartTime = new Date().getTime();
        // 座標の取得
        touchStartX = event.touches[0].pageX;
        touchStartY = event.touches[0].pageY;
        touchEndX = touchStartX;
        touchEndY = touchStartY;
      });
      $('.touch_area').on('touchmove', function(event) {
        event.preventDefault();
        // 座標の取得
        touchEndX = event.touches[0].pageX;
        touchEndY = event.touches[0].pageY;
      });

      $('.touch_area').on('touchend', function(event) {
        var touchendTime = new Date().getTime();
        if(touchendTime - touchstartTime < 300) {
          var touchMoveX = touchEndX - touchStartX;
          var touchMoveY = touchEndY - touchStartY;

          if (touchMoveY > 50 && Math.abs(touchMoveY/touchMoveX) > 2) {
            upSwipe = true;
          }else if (touchMoveY < -50 && Math.abs(touchMoveY/touchMoveX) > 2) {
            downSwipe = true;
          }else if (touchMoveX < -50 && Math.abs(touchMoveX/touchMoveY) > 2) {
            leftSwipe = true;
          }else if(Math.abs(touchMoveX)<10 && Math.abs(touchMoveY)<10) {
            oneTap = true;
          }
        }
      });

      $('#title').on('touchstart', function() {
        playSoundSilent();
      }
      $('#title').on('touchend', function() {
        if(isLoadingText()) {
          audioCtx.createBufferSource().audioBuffer;
          start();
        }
      });
      break;
    }
    if(i == device.length-1) {
      $('html').keydown(function(e){
        if(e.keyCode == 38){
          upSwipe = true;
        }else if(e.keyCode == 40){
          downSwipe = true;
        }else if(e.keyCode == 37){
          leftSwipe = true;
        }else if(e.keyCode == 32){
          oneTap = true;
        }
      });
    }
  };

  for(var i=0; i<score.length; i++) {
    $('.score').append("<p></p>");
    if((score.length-i-1)%3 == 0 && i != score.length-1) {
      $('.score').append("<p class='ten'>,</p>");
    }
  }
  $('.score').append("<p class='hon'>本</p>");
  fontResize();
  updateScore();

  LoadingTextStart(function() {
    return load3dFlag && isSoundLoadEnd();
  });
});

$(window).resize(function() {
  width = $('body').width();
  height = $('body').height();

  if(height / width < 0.75) {
    canvasScale = height/480;
  }else {
    canvasScale = width/640;
  }
  setLoadingTextScale();

  renderer.setSize(640*canvasScale, 480*canvasScale);

  $('#WebGL').css("width",  640*canvasScale);
  $('#WebGL').css("height", 480*canvasScale);
  $('#WebGL').css("left", width/2 - 320*canvasScale);
  $('#WebGL').css("top", height/2 - 240*canvasScale);

  $('#title').css("width",  640*canvasScale);
  $('#title').css("height", 480*canvasScale);
  $('#title').css("left", width/2 - 320*canvasScale);
  $('#title').css("top", height/2 - 240*canvasScale);

  fontResize();
});

function loadObj(index) {
  if(index >= objSourceList.length) {
    load3dFlag = true;
    return;
  }

  var objLoader = new THREE.OBJLoader();
  var mtlLoader = new THREE.MTLLoader();

  var modelPath = "resource/";
  var objName = objSourceList[index] + ".obj";
  var mtlName = objSourceList[index] + ".mtl";
  mtlLoader.setPath(modelPath);
  mtlLoader.load(mtlName, function (materials){
    materials.preload();

    objLoader.setMaterials(materials);
    objLoader.setPath(modelPath);
    objLoader.load(objName, function (object){
      if(index == 0) {
        for(var i=0; i<penObj.length; i++) {
          var clone = object.clone();
          penObj[i] = clone;
          scene.add( clone );
          penDir[i] = (getRand(1, 0) == 0);
          if(i < 2) {
            penObj[i].visible = false;
          }
        }
      }else if(index == 1) {
        for(var i=0; i<capObj.length; i++) {
          var clone = object.clone();
          capObj[i] = clone;
          scene.add( clone );
          isCapSet[i] = false;
          if(i < 2) {
            capObj[i].visible = false;
          }
        }
      }

      loadObj(index+1);
    });
  });
}

function start() {
  $('#title').css("display", "none");
  main();
}

function main() {
  requestAnimationFrame(main);

  Action() ;
  FixModel();
  // レンダリング
  renderer.render(scene, camera);
}

function Action() {
  var speed = 8;
  if(movingCount > 0) {
    movingCount += speed;
  }
  if(rotateCount > 0) {
    rotateCount += speed*2;
  }
  if(rotateCount < 0) {
    rotateCount -= speed*2;
  }
  if(movingCount > penSpan) {
    movingCount = penSpan;
  }
  if(rotateCount > 180) {
    rotateCount = 180;
  }
  if(rotateCount < -180) {
    rotateCount = -180;
  }
  if(movingCount == penSpan && Math.abs(rotateCount) == 180) {
    if(oneTap) {
      isCapSet[capObj.length-1] = !isCapSet[capObj.length-1];
      playSound("pon");
    }else if(leftSwipe) {
      if(penDir[penObj.length/2] && isCapSet[capObj.length-1]) {
        scoreAdd();
        ls = localStorage;
        ls.setItem("score", JSON.stringify(score));
        updateScore();
      }else {
        miss++;
      }
      playSound("next");
      slidePen();
      movingCount = speed;
    }else if(upSwipe && !isCapSet[capObj.length-1]) {
      penDir[capObj.length-1] = !penDir[capObj.length-1];
      rotateCount = speed*2;
      playSound("hyoi");
    }else if(downSwipe && !isCapSet[capObj.length-1]) {
      penDir[capObj.length-1] = !penDir[capObj.length-1];
      rotateCount = -speed*2;
      playSound("hyoi");
    }
  }

  oneTap = false;
  upSwipe = false;
  downSwipe = false;
  leftSwipe = false;
}

function scoreAdd() {
  for(var i=score.length-1; i>=0; i--) {
    score[i] += 1;
    if(score[i] >= 10) {
      score[i] = 0;
      continue;
    }
    break;
  }
}

function updateScore() {
  var p = $('p').first();
  for(var i=0; i<score.length; i++) {
    p.text(score[i]);
    p = p.next('p');
    if((score.length-i-1)%3 == 0 && i != score.length-1) {
      p = p.next('p');
    }
  }
}

function fontResize() {
  $('.score').css("width", 640*canvasScale);
  $('.score').css("top", $('#WebGL').css("top"));
  $('.score').css("left", $('#WebGL').css("left"));
  $('.score').css("height", 19*canvasScale +"px");
  $('p').css("font-size", 20*canvasScale +"px");
  $('p').css("height", 18*canvasScale +"px");
  $('.hon').css("font-size", 14*canvasScale +"px");
}

function FixModel() {
  for(var i=0; i<penObj.length; i++) {
    if(penObj[i] == null) continue;
    var posX = -penSpan + i*penSpan - movingCount;
    var direct = penDir[i] *180 *PI/180;
    if(i == penObj.length/2) {
      direct += (180-rotateCount)*PI/180;
    }

    if(posX <= 0) {
      penObj[i].rotation.x = direct;
    }else if(posX >= penSpan-1) {
      var rotation = 90 * PI / 180;
      penObj[i].rotation.x = rotation + direct;
    }else {
      var rotation = (90 * PI / 180) * ((penSpan-movingCount)/ penSpan);
      penObj[i].rotation.x = rotation + direct;
    }
    penObj[i].position.x = -penSpan + i*penSpan - movingCount;
  }

  var lastCap = capObj.length-1;
  for(var i=0; i<capObj.length; i++) {
    if(capObj[i] == null) continue;

    if(i < capObj.length) {
      if(isCapSet[i]) {
        capObj[i].position.y = 0;
      }else {
        capObj[i].position.y = 45;
      }
    }

    if(i < lastCap) {
      capObj[i].position.x = -penSpan + i*penSpan - movingCount;
    }
  }
  if(isCapSet[lastCap]) {
    capObj[lastCap].rotation.z = 0.0;
  }else {
    capObj[lastCap].rotation.y += 0.07;
    capObj[lastCap].rotation.z = 0.02;
  }
}

function slidePen() {
	for(var i=0; i<penObj.length-1; i++) {
    penObj[i].visible = penObj[i+1].visible;
		penDir[i] = penDir[i+1];
	}
  penDir[penObj.length-1] = (getRand(1, 0) == 0);

	for(var i=0; i<capObj.length-1; i++) {
  	isCapSet[i] = isCapSet[i+1];
    capObj[i].visible = isCapSet[i];
    capObj[i].rotation.y = capObj[i+1].rotation.y
	}
  if(isCapSet[capObj.length - 1]) {
    capObj[capObj.length - 1].rotation.y = 1.0;
  }
  isCapSet[capObj.length - 1] = false;
}

function getRand(max, min){
  var rand = Math.floor( Math.random() * (max + 1 - min) ) + min ;
  return rand;
}
