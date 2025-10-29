// Dummy reels data for development/demo
// Fields mirror backend shape where possible
export const DUMMY_REELS = [
  {
    _id: "r1",
    title: "Sunset ride along the coast",
    description: "Catching golden hour on a quick coastal bike ride. What a view!",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    uploadedBy: { username: "alex", avatarUrl: "" },
  },
  {
    _id: "r2",
    title: "Street coffee art in 30s",
    description: "Testing a new pour-over technique. Thoughts?",
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    uploadedBy: { username: "jamie", avatarUrl: "" },
  },
  {
    _id: "r3",
    title: "Trail run POV",
    description: "6km through the woods. The air was super crisp today.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    uploadedBy: { username: "riley", avatarUrl: "" },
  },
  {
    _id: "r4",
    title: "Quick pasta dinner",
    description: "15 minutes from start to plate. Simple ingredients, big flavor.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    uploadedBy: { username: "morgan", avatarUrl: "" },
  },
];

export default DUMMY_REELS;
