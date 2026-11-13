// Text in [[double brackets]] gets a strip of tape behind it (see Tape.tsx).

export const person = {
  name: "Juen Jie Tay",
  email: "tayjuenjie.tjj@gmail.com",
  github: "https://github.com/jjietay",
  linkedin: "https://www.linkedin.com/in/jjietay",
  knowledge: "https://knowledge-space-vault.pages.dev/",
  resumePdf: "/Juen_Jie_Tay_Resume.pdf",
};

export type Project = {
  id: string;
  fig: "vla" | "lidar" | "signals" | "clay" | "graph";
  figCaption: string;
  title: string;
  kind: string;
  when: string;
  text: string;
  tags: string[];
  href?: string;
  linkLabel?: string;
};

export const projects: Project[] = [
  {
    id: "P-01",
    fig: "vla",
    figCaption: "One command, two control stacks",
    title: "Modular vs end-to-end VLA",
    kind: "UR5e",
    when: "Aug 2026 to present",
    text: "A UR5e comparison for my NTU final year project. A [[modular pipeline]] with OWLv2 and an LLM planner runs against an [[end-to-end SmolVLA policy]]. Both use the same speech input, robot control, camera and safety checks. The test suite has 5 task tiers with 20 seeded layouts each. I froze it before I tuned either pipeline.",
    tags: ["LeRobot", "SmolVLA", "OWLv2", "Claude API", "RealSense", "UR5e"],
  },
  {
    id: "P-02",
    fig: "lidar",
    figCaption: "2D LiDAR scan of a room",
    title: "Autonomous Robotic Tank",
    kind: "ROS 2",
    when: "Feb 2026 to Jun 2026",
    text: "A tracked robot with 2D LiDAR, IMU and encoders. C++ micro-ROS firmware on a Pico W does PID speed control, with a command watchdog and an ultrasonic e-stop. A [[30 Hz EKF]] fuses the encoders and the IMU. I fixed [[SLAM map drift]] from track slip by moving heading to the IMU. On a Raspberry Pi 4, the robot replans around obstacles at 2 Hz.",
    tags: ["ROS 2", "C++", "SLAM", "Nav2", "Foxglove"],
    href: "https://jjietay.github.io/robotic_tank_project/",
    linkLabel: "Open the project page",
  },
  {
    id: "P-03",
    fig: "signals",
    figCaption: "Three sensors, one decision",
    title: "SENTINEL drone detection",
    kind: "Multimodal",
    when: "2026",
    text: "Detects drone presence from [[camera, RF and audio]] with a multimodal LLM. I built it for IE4422 at NTU. The repository has a replay demo.",
    tags: ["Multimodal LLM", "RF", "Audio", "Vision"],
    href: "https://github.com/jjietay/sentinel-demo",
    linkLabel: "Open the demo repository",
  },
  {
    id: "P-04",
    fig: "clay",
    figCaption: "Script, check, voice, video",
    title: "Clayducation",
    kind: "AI video",
    when: "2026",
    text: "An AI video engine built on Claude Code. It makes [[narrated teaching videos]] in a soft 3D clay look with a silent mascot. One agent checks the script before the engine makes the voice.",
    tags: ["Claude Code", "Agents", "Video"],
    href: "https://jjietay.github.io/clayducation/",
    linkLabel: "Open the Clayducation gallery",
  },
  {
    id: "P-05",
    fig: "graph",
    figCaption: "Linked notes",
    title: "Knowledge Space",
    kind: "Notes",
    when: "Jan 2026 to present",
    text: "A public notes site with [[240 notes]] in 10 fields. I write in Obsidian and publish with Quartz and Cloudflare Pages.",
    tags: ["Obsidian", "Quartz", "Cloudflare Pages"],
    href: "https://knowledge-space-vault.pages.dev/",
    linkLabel: "Open Knowledge Space",
  },
];

export const experience = {
  role: "Edge AI and Computer Vision Intern",
  org: "ST Engineering, Singapore",
  when: "Jan 2026 to Aug 2026",
  figCaption: "RF waterfall, two bands",
  points: [
    "Trained and compared CNN, SE-ResNet and Swin-Tiny models for [[drone detection in RF spectrograms]]. Selected SE-ResNet-18 for its balance of inference speed and accuracy.",
    "Built a multithreaded C++ engine for USRP capture and OpenVINO CPU inference across the [[2.4 GHz and 5.8 GHz]] bands.",
    "Wrote a C++ PID automatic gain controller that holds the noise floor steady, so the model receives a consistent input level.",
    "Made a PySide6 and C++ tool to record, replay, simulate and view SDR captures.",
  ],
};

export const street = [
  { src: "/photos/street/neon.webp", title: "First time shooting at night" },
  { src: "/photos/street/walker.webp", title: "Walker" },
  { src: "/photos/street/lanterns.webp", title: "Lanterns" },
  { src: "/photos/street/cat.webp", title: "Cat" },
  { src: "/photos/street/stairs.webp", title: "Stairs" },
  { src: "/photos/street/barrage.webp", title: "Marina Barrage" },
  { src: "/photos/street/settle.webp", title: "Settle down" },
];
