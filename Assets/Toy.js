#pragma strict

function Start () {

}

function Update () {

}

function OnCollisionEnter(collision : Collision) {
  if (collision.gameObject.name == "Toybox") {
    collision.gameObject.GetComponent(AudioSource).Play();
    transform.position.y -= 1000.0;
  }
}