#pragma strict

var speed : float; // m/s

function Start () {

}

function Update () {
  var dr : Vector3 = Input.GetAxis("Horizontal") * transform.right;
  var df : Vector3 = Input.GetAxis("Vertical") * transform.forward;
  var velocity : Vector3 = speed * Time.deltaTime * Vector3.ClampMagnitude(dr + df, 1);
  transform.position += velocity;
}
