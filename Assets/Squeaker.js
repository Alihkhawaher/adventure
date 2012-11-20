#pragma strict

function Start () {

}

function Update () {

}

function OnCollisionEnter(collision : Collision) {
  var audio : AudioSource = collision.gameObject.GetComponent(AudioSource);
  if (audio && !audio.isPlaying) {
    audio.Play();
  }
}