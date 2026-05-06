export interface SlideData {
  title: string;
  subtitle?: string;
  type: 'title' | 'bullet' | 'code' | 'image-placeholder';
  bullets?: string[];
  code?: string;
}

export const slides: SlideData[] = [
  { title: "Understanding Computer Vision", subtitle: "Decoding the World through Pixels", type: 'title' },
  { title: "What is Vision?", subtitle: "From Raw Pixels to Meaningful Perception", type: 'bullet', bullets: ["Machine: Array of numbers", "Human: Meaningful objects", "Bridge: Algorithms & Math"] },
  { title: "A Brief History", type: 'bullet', bullets: ["1960s: Academic starts", "1970s: Edge detection", "2012: AlexNet Revolution", "Now: ViTs and Foundation Models"] },
  { title: "Image as a Matrix", type: 'code', code: "[[255, 0, 128], \n [64, 200, 32], \n [10, 55, 210]]" },
  { title: "Features & Gradients", type: 'bullet', bullets: ["Detecting changes in intensity", "Sobel, Canny Filters", "The building blocks of shapes"] },
  { title: "Task 1: Classification", subtitle: "What is in this image?", type: 'bullet', bullets: ["Mapping image to a single label", "Cats vs Dogs", "ImageNet 1000 Classes"] },
  { title: "Task 2: Object Detection", subtitle: "Where is it located?", type: 'bullet', bullets: ["Bounding Boxes (x, y, w, h)", "YOLO, Faster R-CNN", "Real-time recognition"] },
  { title: "Task 3: Segmentation", subtitle: "Pixel-level understanding", type: 'bullet', bullets: ["Semantic vs Instance", "Masking individual objects", "Self-driving lane detection"] },
  { title: "Task 4: Pose Estimation", type: 'bullet', bullets: ["Identifying skeletal joints", "Action recognition", "HCI Applications"] },
  { title: "Task 5: Face Landmarks", type: 'bullet', bullets: ["Aligning facial features", "AR Filters, Biometrics", "Emotion analysis"] },
  { title: "Classic vs Deep Learning", type: 'bullet', bullets: ["Classic: SIF T, HOG (Hard-coded)", "DL: CNNs (Self-learning features)", "Robustness to lighting & pose"] },
  { title: "The Power of CNNs", subtitle: "Convolutional Neural Networks", type: 'bullet', bullets: ["Local receptive fields", "Weight sharing", "Spatial hierarchy"] },
  { title: "Evolution: ResNet", type: 'bullet', bullets: ["Residual connections", "Training 100+ layers", "Solving vanishing gradients"] },
  { title: "Modern Era: ViT", subtitle: "Vision Transformers", type: 'bullet', bullets: ["Self-Attention on Image Patches", "Scaling laws", "MAEs & Foundation Models"] },
  { title: "Generative Vision", type: 'bullet', bullets: ["GANs: Adversarial training", "Diffusion: Latent Space", "Generating reality from noise"] },
  { title: "App: Medical Imaging", type: 'bullet', bullets: ["X-ray interpretation", "Tumor detection", "Automated diagnostics"] },
  { title: "App: Autonomous Vehicles", type: 'bullet', bullets: ["Lane keeping", "Pedestrian avoidance", "Sensor fusion"] },
  { title: "App: Robotics", type: 'bullet', bullets: ["Bin picking", "Visual Odometry", "Grasp planning"] },
  { title: "Future: Multi-modal", type: 'bullet', bullets: ["CLIP: Linking Image and Text", "SAM: Segment Anything", "Vision Language Models (VLM)"] },
  { title: "The Next Frontier", subtitle: "Vision is the core of AI", type: 'title' }
];
