#pragma strict

private static var XZ : Vector3 = Vector3(1, 0, 1);

var alpha : float;
var angle : float;
var cameraAlpha : float;
var minCameraDistance : float;
var hCameraRotationMultiplier : float;
var maxCameraDistance : float;
var mainCamera : Transform;
var speed : float; // m/s
var strafeThresholdVelocity : float; // m/s
var velocityAlpha : float;

private var controller : CharacterController;
private var orientation : Quaternion;
private var velocity : Vector3;

#if UNITY_STANDALONE_WIN
private static var HORIZONTAL_HAT : String = "HorizontalHatXbox360";
private static var VERTICAL_HAT : String = "VerticalHatXbox360";
#endif

#if UNITY_STANDALONE_OSX
private static var HORIZONTAL_HAT : String = "HorizontalHatPs3";
private static var VERTICAL_HAT : String = "VerticalHatPs3";
#endif

function Start () {
  controller = GetComponent(CharacterController);
  orientation = Quaternion.identity;
  velocity = Vector3.zero;
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
  var newVelocity : Vector3 = speed * Vector3.ClampMagnitude(dr + df, 1);
  if (newVelocity.sqrMagnitude > strafeThresholdVelocity) {
    transform.rotation = Quaternion.Lerp(
        transform.rotation, Quaternion.FromToRotation(Vector3.forward, velocity), alpha);
  }
  velocity = Vector3.Lerp(velocity, newVelocity, velocityAlpha);
  controller.SimpleMove(velocity);
  mainCamera.transform.LookAt(transform);
  var rotation : Quaternion = Quaternion.AngleAxis(
      Input.GetAxis("Horizontal") / 3.0 * angle * hCameraRotationMultiplier +
          Input.GetAxis(HORIZONTAL_HAT) * angle * hCameraRotationMultiplier, mainCamera.up) *
      Quaternion.AngleAxis(-Input.GetAxis("Vertical") / 4.0 * angle + 
          Input.GetAxis(VERTICAL_HAT) * angle, mainCamera.right);
  orientation = Quaternion.Lerp(orientation, rotation, cameraAlpha);
  mainCamera.rotation = orientation * mainCamera.rotation;
}
