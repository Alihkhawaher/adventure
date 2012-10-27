#pragma strict

var speed : float; // m/s

private var controller : CharacterController;

function Start () {
  controller = GetComponent(CharacterController);
}

function Update () {
  var dr : Vector3 = Input.GetAxis("Horizontal") * transform.right;
  var df : Vector3 = Input.GetAxis("Vertical") * transform.forward;
  var velocity : Vector3 = speed * Vector3.ClampMagnitude(dr + df, 1);
  controller.SimpleMove(velocity);
}
