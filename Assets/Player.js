#pragma strict

private static var XZ : Vector3 = Vector3(1, 0, 1);

var alpha : float;
var angle : float;
var cameraAlpha : float;
var minCameraDistance : float;
var maxCameraDistance : float;
var mainCamera : Transform;
var speed : float; // m/s
var strafeThresholdVelocity : float; // m/s

private var controller : CharacterController;
private var orientation : Quaternion;

#if UNITY_STANDALONE_WIN
private static var HORIZONTAL_HAT : String = "HorizontalHat";
private static var VERTICAL_HAT : String = "VerticalHat";
#endif

#if UNITY_STANDALONE_OSX
private static var HORIZONTAL_HAT : String = "HorizontalHatMac";
private static var VERTICAL_HAT : String = "VerticalHatMac";
#endif

function Start () {
  controller = GetComponent(CharacterController);
  orientation = Quaternion.identity;
}

function Update () {
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
  var df : Vector3 = Input.GetAxis("Vertical") * directionToPlayer.normalized;
  var velocity : Vector3 = speed * Vector3.ClampMagnitude(dr + df, 1);
  if (velocity.sqrMagnitude > strafeThresholdVelocity) {
    transform.rotation = Quaternion.Lerp(
        transform.rotation, Quaternion.FromToRotation(Vector3.forward, velocity), alpha);
  }
  controller.SimpleMove(velocity);
  mainCamera.transform.LookAt(transform);
  var rotation : Quaternion =
      Quaternion.AngleAxis(Input.GetAxis(HORIZONTAL_HAT) * angle * 1.5, mainCamera.up) *
          Quaternion.AngleAxis(Input.GetAxis(VERTICAL_HAT) * angle, mainCamera.right);
  orientation = Quaternion.Lerp(orientation, rotation, alpha);
  mainCamera.rotation = orientation * mainCamera.rotation;
}
