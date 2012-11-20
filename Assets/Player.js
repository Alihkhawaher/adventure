#pragma strict

private static var XZ : Vector3 = Vector3(1, 0, 1);

var adultHeight : float;
var alpha : float;
var angle : float;
var cameraAlpha : float;
var center : Transform;
var creepySound : AudioClip;
var creepySoundDelay : float;
var childLookDistance : float;
var minCameraDistance : float;
var hCameraRotationMultiplier : float;
var head : Transform;
var maxCameraDistance : float;
var mainCamera : Camera;
var speed : float; // m/s
var strafeThresholdVelocity : float; // m/s
var toyBuddha : Transform;
var toyBunny : Transform;
var toyDragon : Transform;
var toyMonkey : Transform;
var unzoomedFieldOfView : float;
var velocityAlpha : float;
var zoomedFieldOfView : float;
var rainbowSound : AudioClip;
var squeaker : Collider;

private var controller : CharacterController;
private var correction : Vector3;
private var normalFieldOfView : float;
private var orientation : Quaternion;
private var headOrientation : Quaternion;
private var velocity : Vector3;
private var pointer : Vector2;
private var toys : Array;
private var stareTimestamp : float;
private var staring : boolean;

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
  headOrientation = Quaternion.identity;
  velocity = Vector3.zero;
  pointer = Vector2.zero;
  toys = [toyBuddha, toyBunny, toyDragon, toyMonkey];
  stareTimestamp = 0;
  staring = false;
}

function OnGUI() {
  // Create some text style descriptors: style and textStyle.
  var style : GUIStyle = new GUIStyle();
  var textStyle : GUIStyleState = new GUIStyleState();
  style.fontSize = 32;
  textStyle = new GUIStyleState();
  textStyle.textColor = Color.white;
  style.normal = textStyle;
  // Calculate the exponential moving average of the screen position
  // of the player's cursor using Lerp().
  var newPointer : Vector2 = new Vector2(
      Input.GetAxis(HORIZONTAL_HAT), Input.GetAxis(VERTICAL_HAT));
  pointer = Vector2.Lerp(pointer, newPointer, cameraAlpha);
  // If the player has moved the stick out of the dead zone:
  if (Vector2.Distance(pointer, Vector2.zero) > 0.05) {
    // Draw a unicode symbol as a crosshair.
    GUI.Label(new Rect(Screen.width / 2.0 * (1 + pointer.x),
        Screen.height / 2.0 * (1 + pointer.y), 50, 50), "◎", style);
  }
}

function FixedUpdate () {
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
  var cachedHeadRotation : Quaternion;
  var dir : Vector3;
  var newDir : Vector3;
  if (Vector3.Distance(
      mainCamera.transform.position, transform.position) < childLookDistance
      && Vector3.Dot(mainCamera.transform.forward, transform.forward) < 0.0) {
    // If avatar is facing camera:
    cachedHeadRotation = head.rotation;
    head.LookAt(mainCamera.transform);
    headOrientation = Quaternion.Lerp(
        headOrientation, head.rotation, cameraAlpha);
    head.rotation = cachedHeadRotation;
    if (!staring) {
      stareTimestamp = Time.fixedTime;
      staring = true;
    }
  } else {
    staring = false;
    // If closest toy is within 5 meters:
    var closestToy : Transform = null;
    var closestDistance : float = Mathf.Infinity;
    for (var i = 0; i < toys.length; ++i) {
      var currentToy : Transform = toys[i];
      var currentDistance : float = Vector3.Distance(
          currentToy.position, transform.position);
      if (currentDistance < closestDistance) {
        closestDistance = currentDistance;
        closestToy = currentToy;
      }
    }
    if (closestDistance < childLookDistance &&
        Vector3.Dot(transform.forward, (transform.position - closestToy.position).normalized) < 0.0) {
      center.position = closestToy.position;
      cachedHeadRotation = head.rotation;
      if (Vector3.Dot(transform.forward, center.position - head.position) < 0.0) {
        dir = center.position - head.position;
        newDir = dir - Vector3.Dot(dir, transform.forward) /
            Vector3.Dot(transform.forward, transform.forward) * transform.forward;
        center.position = head.position + newDir;
      }
      head.LookAt(center);
      headOrientation = Quaternion.Lerp(headOrientation,
          head.rotation, cameraAlpha);
      head.rotation = cachedHeadRotation;
    } else {
      headOrientation = Quaternion.Lerp(
          headOrientation, Quaternion.FromToRotation(
              Vector3.forward, velocity), cameraAlpha);
    }
  }
  if (staring && Time.fixedTime - stareTimestamp > creepySoundDelay &&
    !GetComponent(AudioSource).isPlaying) {
    GetComponent(AudioSource).clip = creepySound;
    GetComponent(AudioSource).Play();
  }
  head.rotation = headOrientation;
  // Audio
  if (Input.GetButton("Jump") && !mainCamera.GetComponent(AudioSource).isPlaying) {
    mainCamera.GetComponent(AudioSource).Play();
  }
  // idle noise
  if (Physics.Raycast(mainCamera.transform.position, (transform.position - mainCamera.transform.position).normalized, hit)
    && hit.collider != squeaker
    && !GetComponent(AudioSource).isPlaying) {
    GetComponent(AudioSource).clip = rainbowSound;
    GetComponent(AudioSource).Play();
  }
}

//IVZ TEST
