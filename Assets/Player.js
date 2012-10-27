#pragma strict

private static var XZ : Vector3 = Vector3(1, 0, 1);

var angle : float;
var minCameraDistance : float;
var maxCameraDistance : float;
var mainCamera : Transform;
var speed : float; // m/s

private var controller : CharacterController;

function Start () {
  controller = GetComponent(CharacterController);
}

function FixedUpdate () {
  mainCamera.transform.LookAt(transform);
  var directionToPlayer : Vector3 = 
      Vector3.Scale(XZ, transform.position) - Vector3.Scale(XZ, mainCamera.position);
  var cameraDistance : float = directionToPlayer.magnitude;
  var correction : Vector3;
  if (cameraDistance > maxCameraDistance) {
    correction = directionToPlayer.normalized * (cameraDistance - maxCameraDistance);
    mainCamera.transform.position += correction;
  } else if (cameraDistance < minCameraDistance) {
    correction = directionToPlayer.normalized * (cameraDistance - minCameraDistance);
    mainCamera.transform.position += correction;
  }
  var dr : Vector3 = Input.GetAxis("Horizontal") * mainCamera.right;
  var df : Vector3 = Input.GetAxis("Vertical") * directionToPlayer;
  var rotation : Quaternion =
      Quaternion.AngleAxis(Input.GetAxis("VerticalHat") * angle, mainCamera.right) *
          Quaternion.AngleAxis(Input.GetAxis("HorizontalHat") * angle * 1.5, mainCamera.up);
  mainCamera.rotation = rotation * mainCamera.rotation;
  var velocity : Vector3 = speed * Vector3.ClampMagnitude(dr + df, 1);
  controller.SimpleMove(velocity);
}
