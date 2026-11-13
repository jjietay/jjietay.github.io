// Taken from Documents/Work/Resume/Juen_Jie_Tay_Resume.docx.
export const resume = {
  headline: "Robotics, embodied AI, computer vision",
  profile: "I am a final-year EEE student at NTU. I graduate in May 2027 and focus on [[embodied AI and robotics]]. My experience includes ROS 2 robot development, a UR5e manipulation final year project, and RF deep learning and CPU edge deployment at ST Engineering.",
  skills: [
    ["Languages", "Python, C++"],
    ["ML", "PyTorch, LeRobot, Hugging Face Transformers, Claude API, faster-whisper, ONNX, OpenVINO"],
    ["Robotics", "ROS 2, Nav2, SLAM Toolbox, robot_localization (EKF), micro-ROS, MuJoCo, Foxglove, UR5e, RealSense"],
    ["Signal processing and tools", "DSP (STFT), USRP SDR, HDF5, Zarr, CMake, Git, Linux, uv, pytest, Sphinx"],
  ],
  experience: [
    {
      title: "Edge AI and Computer Vision Intern",
      org: "ST Engineering, Singapore",
      when: "Jan 2026 to Aug 2026",
      points: [
        "Trained and compared CNN, SE-ResNet and Swin-Tiny models for [[drone detection in RF spectrograms]]. Applied multiple instance learning to sub-band views and selected SE-ResNet-18 to balance inference speed and accuracy.",
        "Built a [[multithreaded C++ engine]] for USRP capture and OpenVINO CPU inference across the 2.4 GHz and 5.8 GHz bands. Connected capture and inference threads through a bounded queue.",
        "Developed a C++ PID automatic gain controller with a slew-rate limit and anti-windup that holds the noise floor steady in changing RF conditions, so the model receives a consistent input level. Verified with GoogleTest unit tests.",
        "Created a PySide6 and C++ tool to record, replay, simulate and view SDR captures. Moved the training dataset from HDF5 to chunked Zarr and documented the training pipeline.",
      ],
    },
  ],
  projects: [
    {
      title: "Modular vs End-to-End VLA Models for Embodied Robotic Manipulation",
      org: "LeRobot, SmolVLA, OWLv2, UR5e. NTU Final Year Project",
      when: "Aug 2026 to present",
      points: [
        "Designed a [[UR5e comparison]] between a modular OWLv2 and LLM pipeline and an end-to-end SmolVLA policy. Both use shared speech input, robot control, camera access and safety checks.",
        "Implementing command clarification, motion safety checks and failure tracing for the modular pipeline. Integrated SmolVLA through LeRobot, with [[more than 230 unit tests]] across the project.",
        "Built an evaluation suite of 5 task tiers (pick-and-place, pouring, ambiguity, changing world state and generalisation) with 20 seeded layouts per tier and held-out phrasings, frozen before tuning either pipeline.",
      ],
    },
    {
      title: "Autonomous Robotic Tank",
      org: "ROS 2, C++, SLAM, Nav2, Foxglove. Personal project",
      when: "Feb 2026 to Jun 2026",
      points: [
        "Built a tracked robot with 2D LiDAR, IMU and encoders. Wrote C++ micro-ROS firmware on a Pico W for PID speed control, a command watchdog and an ultrasonic e-stop.",
        "Fused encoder and IMU data in a 30 Hz EKF. Fixed [[SLAM map drift]] caused by track slip by moving heading to the IMU, calibrating the wheelbase and zeroing IMU heading at boot.",
        "Compared DWB and Regulated Pure Pursuit on a Raspberry Pi 4 and selected RPP after DWB missed its control deadlines. The robot replanned around obstacles at 2 Hz with RPP control at 5 Hz.",
        "Streamed ROS 2 topics to Foxglove over a websocket bridge after Fast DDS and Cyclone DDS discovery over WiFi was unreliable. Documented the build and tests on a public Sphinx site.",
      ],
    },
    {
      title: "Knowledge Space",
      org: "Obsidian, Quartz, Cloudflare Pages. Personal project",
      when: "Jan 2026 to present",
      points: ["Built a public notes site of 240 notes across 10 fields with Obsidian, Quartz and Cloudflare Pages."],
    },
  ],
  education: {
    title: "Nanyang Technological University, Singapore",
    org: "B.Eng. Electrical and Electronic Engineering",
    when: "Expected May 2027",
    points: [
      "Specialisation: Data Analysis and Machine Learning.",
      "AI and robotics coursework: Multimodal Large Language Models, Computer Vision, Pattern Recognition and Machine Learning, Robotics and Automation, and Natural Language Processing.",
      "Selected results: Enhanced Professional Internship A+, Modelling and Control A, Signals and Systems A-, Engineering Electromagnetics A-.",
    ],
  },
  more: [
    ["Freelance photographer and videographer", "Oct 2024 to Jan 2026. Managed client projects end to end, from sales and requirements to shooting, editing and final delivery."],
    ["Certifications", "Universal Robots e-Series Core Track, Jun 2026. Google Advanced Data Analytics Specialization, Jul 2024."],
    ["Leadership", "Badminton Captain, NTU Hall 10. Badminton Captain, Yishun Innova Junior College."],
  ],
};
