# Yoga_Gamify_AI

This project enables real-time yoga pose detection using a webcam. It leverages the MediaPipe library for body and pose tracking and provides feedback to users to ensure proper posture during yoga exercises.

**Features**

Real-time Pose Detection: Track and display key body landmarks to ensure proper form during yoga poses.

Pose Accuracy Feedback: Visual or textual feedback when the user’s pose deviates from the expected form.

Pose Library: Detect and validate common yoga poses (e.g., Downward Dog, Warrior Pose, etc.).

Interactive Interface: Display key points on the user's body and guide them through the correct alignment.

**Prerequisites**

Libraries
Ensure the following Python libraries are installed:

OpenCV

MediaPipe

NumPy

**You can install them with:**

command

pip install opencv-python mediapipe numpy

**Hardware Requirements**

A webcam (internal or external).

A computer capable of running Python and the above libraries.

**How to Run**
**
Run the Script:**

Execute the Python script to start detecting yoga poses:

python yoga_pose_detection.py

This will open the webcam and display the pose tracking interface.

**Perform Yoga Poses:**

Position yourself in front of the webcam.

The system will track your body’s key points and compare them to predefined yoga poses.

You'll receive feedback on whether your pose is correct or needs adjustment.

Pose Detection Feedback
**Pose Mapping**
Pose	Feedback

Downward Dog	Ensure hands and feet form a straight line

Warrior Pose	Check your front knee alignment

Tree Pose	Keep the balance and foot placement in check

**Notes**

Ensure proper lighting for accurate detection.

Make sure your full body is visible in the webcam frame.

If the pose is not detected, adjust your position or improve the lighting.

**Troubleshooting**

Issue: The pose is not detected.

Solution: Ensure your full body is within the webcam's view and well-lit.

Issue: The pose detection is inaccurate.

Solution: Adjust your posture slightly or move closer/further from the webcam for better detection.

**Acknowledgments**

MediaPipe: For providing efficient pose tracking.

OpenCV: For video capture and image processing.

NumPy: For numerical operations involved in pose validation.


