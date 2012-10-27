#pragma strict

private static var XZ : Vector3 = Vector3(1, 0, 1);

var maxCameraDistance : float;
var mainCamera : Transform;
var speed : float; // m/s

private var controller : CharacterController;

function Start () {
  controller = GetComponent(CharacterController);
}

function Update () {
  mainCamera.transform.LookAt(transform);
  var directionToPlayer : Vector3 = 
      Vector3.Scale(XZ, transform.position) - Vector3.Scale(XZ, mainCamera.position);
  var cameraDistance : float = directionToPlayer.magnitude;
  if (cameraDistance > maxCameraDistance) {
    var correction : Vector3 = directionToPlayer.normalized * (cameraDistance - maxCameraDistance);
    mainCamera.transform.position += correction;
  }
  var dr : Vector3 = Input.GetAxis("Horizontal") * mainCamera.right;
  var df : Vector3 = Input.GetAxis("Vertical") * mainCamera.forward;
  var velocity : Vector3 = speed * Vector3.ClampMagnitude(dr + df, 1);
  controller.SimpleMove(velocity);
}
