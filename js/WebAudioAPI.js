var audioCtx = null;
var soundBuffList = {};
var soundSourceList = {};
var loadAudioFlag = false;

function initWebAPI(source) {
  soundSourceList = source;
  try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  catch(e) {
    audioCtx = null;
    alert("このブラウザではWeb Audio APIがサポートされていません。");
  }
}

function loadSound(name){
  if (!audioCtx) { return; }
  var request = new XMLHttpRequest();
  var url = soundSourceList[name];
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    audioCtx.decodeAudioData(
      request.response,
      function(buffer) {
        soundBuffList[name] = buffer;
        if(Object.keys(soundBuffList).length == Object.keys(soundSourceList).length) {
          loadAudioFlag = true;
        }
      },
      function() {
        alert("音声ファイルの読み込みに失敗しました。");
      });
  }
  request.send();
}

function playSound(name, time=-1){
  if (!soundBuffList) { return; }
  var source = audioCtx.createBufferSource();
  source.buffer = soundBuffList[name];
  source.connect(audioCtx.destination);
  if(time > 0) {
    source.start(0,0,time);
  } else {
    source.start(0);
  }
}

function isSoundLoadEnd() {
  return loadAudioFlag;
}

function playSoundSilent() {
  const emptySource = audioCtx.createBufferSource();
  emptySource.start();
  emptySource.stop();
}
