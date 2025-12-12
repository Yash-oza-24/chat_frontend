const audio = new Audio('/notification.mp3');
audio.preload = 'auto';
let unlocked = false;

function unlockAudio() {
    if (unlocked) return;
    audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        unlocked = true;
        removeListeners();
    }).catch(() => {
        // play was blocked; keep listeners so we can try again on next interaction
    });
}

function removeListeners() {
    try {
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
    } catch (e) { }
}

function setupUnlockListeners() {
    try {
        window.addEventListener('click', unlockAudio, { passive: true });
        window.addEventListener('touchstart', unlockAudio, { passive: true });
        window.addEventListener('keydown', unlockAudio, { passive: true });
    } catch (e) { }
}

function play() {
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {
        // If play is blocked, we'll rely on the unlock listeners to enable it later.
    });
}

setupUnlockListeners();

export default {
    play,
    _audio: audio
};


  // Close chat options when pressing Escape
//   useEffect(() => {
//     const handleEscape = (e) => {
//       if (e.key === "Escape") {
//         setChatOptionsOpen(null);
//         if (showDeleteConfirm) {
//           setShowDeleteConfirm(false);
//           setGroupToDelete(null);
//         }
//       }
//     };
//     document.addEventListener("keydown", handleEscape);
//     return () => document.removeEventListener("keydown", handleEscape);
//   }, [showDeleteConfirm]);