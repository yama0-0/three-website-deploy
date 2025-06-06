import "./style.css";
import * as THREE from "three";
 
//canvas
// #webglはタグの意味
//querySelectorはJavascriptで用意されている関数
const canvas = document.querySelector("#webgl");
 
//シーン
const scene = new THREE.Scene();

//背景用のテクスチャ
const textureLoader = new THREE.TextureLoader();
// 変数を用意
const bgTexture = textureLoader.load("bg/bg.jpg")
// 背景を追加する場合はscene.addではなく、scene.backgroundで追加する
scene.background = bgTexture;
 
//サイズ
// アスペクト比などで使用する幅と高さをプロパティとして用意
const sizes = {
  width: innerWidth,
  height: innerHeight,
};
 
//カメラ
const camera = new THREE.PerspectiveCamera(
  // 視野角
  75,
  // アスペクト比の指定、ブラウザの幅と高さ（上記で指定した）
  sizes.width / sizes.height,
  // カメラの描画距離
  0.1,
  1000
);
 
//レンダラー
const renderer = new THREE.WebGLRenderer({
  // レンダラーがcanvasの中に描画することを明示している
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);

//オブジェクトを作成
//ボックスを追加
const boxGeometry = new THREE.BoxGeometry(5, 5, 5, 10);
// MeshNormalMaterialは光源を必要としないマテリアル
const boxMaterial = new THREE.MeshNormalMaterial();
// メッシュ化する
const box = new THREE.Mesh(boxGeometry, boxMaterial);
// カメラよりも奥に位置を変更して、カメラでジオメトリが写せるようにする
box.position.set(0, 0.5, -15);
//回転を加える
box.rotation.set(1, 1, 0);

//ドーナツ型（トーラスを追加）
const torusGeometry = new THREE.TorusGeometry(8, 2, 16, 100);
const torusMaterial = new THREE.MeshNormalMaterial();
const torus = new THREE.Mesh(torusGeometry, torusMaterial);
//今回はカメラの後ろ側に配置する
torus.position.set(0, 1, 10);

// シーンに追加
scene.add(box, torus);

//線形保管で滑らかに移動させる
//xには開始の値、yには終了の値、aにはscaleParcentを代入する
function lerp(x, y, a){
  return (1 - a) * x + a * y;
}

//lerp関数のaに入れるための関数を用意する
function scaleParcent(start, end){
  //各区間におけるどの位置をスクロールしているかを算出する式
  return (scrollParcent - start) / (end - start);
}

//スクロールアニメーション
// animationScriptsというからの配列を用意
const animationScripts = [];
// animationScriptsにpushという形で要素（オブジェクトのプロパティのアニメーション）を追加
animationScripts.push({
  // 0%~40%までという意味
  start: 0,
  end: 40,
  // 上記の区間で次の関数を実行してくださいということを記述する
  function(){
    //カメラはどこを向いて欲しいか
    camera.lookAt(box.position);
    //カメラをz方向の手前方向に変えておく
    camera.position.set(0, 1, 10);
    //lerp関数を使用する
    //boxの始めのpositionが-15のため第一引数は-15, 終了させたい値として第二引数は2, 第三引数にscaleParcentを代入し、scaleParcentにstart=0, end=40を代入
    //boxは奥から手前に動く
    box.position.z = lerp(-15, 2, scaleParcent(0, 40));
    //torusは手前から奥に動く
    torus.position.z = lerp(10, -20, scaleParcent(0, 40));
  }
});

//ボックスのみを半回転させる
animationScripts.push({
  // 40%~60%までという意味
  start: 40,
  end: 60,
  // 上記の区間で次の関数を実行してくださいということを記述する
  function(){
    //カメラはどこを向いて欲しいか
    camera.lookAt(box.position);
    //カメラをz方向の手前方向に変えておく
    camera.position.set(0, 1, 10);
    //lerp関数を使用する
    //boxを半回転（Math.PI(180度））
    box.rotation.z = lerp(1, Math.PI, scaleParcent(40, 60));
  }
});

//カメラを移動させる
animationScripts.push({
  // 60%~80%までという意味
  start: 60,
  end: 80,
  // 上記の区間で次の関数を実行してくださいということを記述する
  function(){
    //カメラはどこを向いて欲しいか
    camera.lookAt(box.position);
    //lerp関数を使用する
    //カメラを移動させる
    camera.position.x = lerp(0, -15, scaleParcent(60, 80));
    camera.position.y = lerp(1,  15, scaleParcent(60, 80));
    camera.position.z = lerp(10, 25, scaleParcent(60, 80));
  }
});

//boxのrotation(回転)を加え続ける
animationScripts.push({
  // 80%~100%までという意味
  start: 80,
  //ブラウザの仕様や計算誤差により、100をわずかに超えることに対応するために100よりも少し大きめの値をendに設定
  end: 120,
  // 上記の区間で次の関数を実行してくださいということを記述する
  function(){
    //カメラはどこを向いて欲しいか
    camera.lookAt(box.position);
    //lerp関数を使用する
    //boxのrotation(回転)を加え続ける
    box.rotation.x += 0.02;
    box.rotation.y += 0.02;
  }
});

//アニメーションを開始
// 関数を実行するための記述
//アニメーションを記述
function playScrollAnimation(){
  // 配列の中から一つ一つ取り出していく
  animationScripts.forEach((animation) => {
    //「スクロール率がanimationのstartよりも大きければ」かつ「スクロール率がanimationのend」よりも小さければ関数が実行される
    if (scrollParcent >= animation.start && scrollParcent <= animation.end)
    animation.function();
  })
}

//ブラウザのスクロール率を取得
//ブラウザのスクロール率を格納するための変数を用意する（初期値として0を代入しておく）
let scrollParcent = 0;
// onscrollというトリガーを使用してスクロール率を取得していく
document.body.onscroll = () => {
  scrollParcent =
    //スクロール率を取得できる式＝(x/(l-y))*100
    //上から下までスクロールできる長さ/上からブラウザの上までの長さ-ブラウザの長さ
    (document.documentElement.scrollTop / 
      (document.documentElement.scrollHeight - 
        document.documentElement.clientHeight)) * 
      100;
      console.log(scrollParcent)
}

 
//アニメーション
//今回はAnimationではなく、tickとして用意する
const tick = () => {
  // tickをフレーム単位で何度も呼び出す
  window.requestAnimationFrame(tick);
  //配列のアニメーションを入れる
  playScrollAnimation();
  // レンダーラーのrender関数を何度も呼び出す(sceneとcamera)
  renderer.render(scene, camera);
};
 
tick();
 
//ブラウザのリサイズ操作(他のプロジェクトでも使用できる)
//リサイズを検知するためのトリガーが用意されている。
window.addEventListener("resize", () => {
  //リサイズすると何度もブラウザのサイズを元に戻してあげる、変更したサイズに適用していく
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //カメラのアスペクト比も合わせる
  camera.aspect = sizes.width / sizes.height;
  //これを呼び出すことで、アスペクト比が変わる
  camera.updateProjectionMatrix();
 
  //レンダラーのサイズも変更
  renderer.setSize(sizes.width, sizes.height);
  //setPixelRatioも対応
  renderer.setPixelRatio(window.devicePixelRatio);
});
