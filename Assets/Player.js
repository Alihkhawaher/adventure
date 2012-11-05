#pragma strict

private static var XZ : Vector3 = Vector3(1, 0, 1);

var adultHeight : float;
var alpha : float;
var angle : float;
var cameraAlpha : float;
var minCameraDistance : float;
var hCameraRotationMultiplier : float;
var maxCameraDistance : float;
var mainCamera : Camera;
var speed : float; // m/s
var strafeThresholdVelocity : float; // m/s
var velocityAlpha : float;
var unzoomedFieldOfView : float;
var zoomedFieldOfView : float;

private var controller : CharacterController;
private var correction : Vector3;
private var normalFieldOfView : float;
private var orientation : Quaternion;
private var velocity : Vector3;

#if UNITY_STANDALONE_WIN
private static var HORIZONTAL_HAT : String = 'HorizontalHatXbox360';
private static var VERTICAL_HAT : String = 'VerticalHatXbox360';
private static var ZOOM : String = 'ZoomXbox360';
#endif

#if UNITY_STANDALONE_OSX
private static var HORIZONTAL_HAT : String = 'HorizontalHatPs3';
private static var VERTICAL_HAT : String = 'VerticalHatPs3';
private static var ZOOM : String = 'ZoomPs3';
#endif

function Start () {
  controller = GetComponent(CharacterController);
  correction = Vector3.zero;
  normalFieldOfView = mainCamera.fieldOfView;
  orientation = Quaternion.identity;
  velocity = Vector3.zero;
}

function Update () {
  mainCamera.transform.LookAt(transform);
  var directionToPlayer : Vector3 = 
      Vector3.Scale(XZ, transform.position) -
          Vector3.Scale(XZ, mainCamera.transform.position);
  var cameraDistance : float = directionToPlayer.magnitude;
  var newCorrection : Vector3 = Vector3.zero;
  if (cameraDistance > maxCameraDistance) {
    newCorrection = directionToPlayer.normalized * (
        cameraDistance - maxCameraDistance);
  } else if (cameraDistance < minCameraDistance) {
    newCorrection = directionToPlayer.normalized * (
        cameraDistance - minCameraDistance);
  }
  var hit : RaycastHit;
  if (Physics.Raycast(mainCamera.transform.position, -Vector3.up, hit)) {
    newCorrection.y = hit.point.y -
        mainCamera.transform.position.y + adultHeight;
  }
  correction = Vector3.Lerp(correction, newCorrection, cameraAlpha);
  mainCamera.transform.position += correction;
  var dr : Vector3 = Input.GetAxis('Horizontal') * mainCamera.transform.right;
  var df : Vector3 = Input.GetAxis('Vertical') * directionToPlayer.normalized;
  var newVelocity : Vector3 = speed * Vector3.ClampMagnitude(dr + df, 1);
  if (newVelocity.sqrMagnitude > strafeThresholdVelocity) {
    transform.rotation = Quaternion.Lerp(
        transform.rotation, Quaternion.FromToRotation(
            Vector3.forward, velocity), alpha);
  }
  velocity = Vector3.Lerp(velocity, newVelocity, velocityAlpha);
  controller.SimpleMove(velocity);
  mainCamera.transform.LookAt(transform);
  var rotation : Quaternion = Quaternion.AngleAxis(
      Input.GetAxis('Horizontal') / 3.0 * angle * hCameraRotationMultiplier +
          Input.GetAxis(HORIZONTAL_HAT) * angle * hCameraRotationMultiplier,
          mainCamera.transform.up) *
      Quaternion.AngleAxis(-Input.GetAxis('Vertical') / 4.0 * angle + 
          Input.GetAxis(VERTICAL_HAT) * angle, mainCamera.transform.right);
  orientation = Quaternion.Lerp(orientation, rotation, cameraAlpha);
  mainCamera.transform.rotation = orientation * mainCamera.transform.rotation;
  mainCamera.fieldOfView = Mathf.Lerp(
      mainCamera.fieldOfView, normalFieldOfView +
          Mathf.Clamp(Input.GetAxis(ZOOM), -1, 0) * zoomedFieldOfView +
              Mathf.Clamp(Input.GetAxis(ZOOM), 0, 1) * unzoomedFieldOfView,
                  cameraAlpha);
}

//IVZ TEST
