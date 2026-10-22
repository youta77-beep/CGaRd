import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FileText,
  Smartphone,
  Monitor,
  Mic,
} from 'lucide-react';

interface AnimatedVideoPlayerProps {
  className?: string;
}

export const AnimatedVideoPlayer: React.FC<AnimatedVideoPlayerProps> = ({ className = '' }) => {
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(60);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [showCaptions, setShowCaptions] = useState<boolean>(true);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentVideoSrc =
    aspectRatio === '16:9'
      ? '/videos/cgard_explainer_16x9.mp4'
      : '/videos/cgard_explainer_9x16.mp4';

  // Sync mute with voiceEnabled state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted || !voiceEnabled;
    }
  }, [isMuted, voiceEnabled]);

  // When aspect ratio changes, retain time position and playback status
  const handleAspectRatioChange = (newRatio: '16:9' | '9:16') => {
    if (newRatio === aspectRatio) return;
    const currentT = videoRef.current ? videoRef.current.currentTime : currentTime;
    const wasPlaying = isPlaying;
    setAspectRatio(newRatio);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentT;
        if (wasPlaying) {
          videoRef.current.play().catch(() => {});
        }
      }
    }, 50);
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused || videoRef.current.ended) {
      if (videoRef.current.ended || currentTime >= duration) {
        videoRef.current.currentTime = 0;
      }
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    setCurrentTime(0);
    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const getActiveCaption = (t: number) => {
    if (t < 4.5) return 'Legal doesn’t always mean it works.';
    if (t < 6.5) return 'Meet CGaRd.';
    if (t < 13.5) return 'Here’s a mystery bottle. Let’s look at the claim behind it.';
    if (t < 17.0) return 'Here’s the full card, in five parts.';
    if (t < 22.0) return '1 · Regulatory basis. The rule the claim is measured against.';
    if (t < 27.0) return '2 · Clinical data. Is there a test on file for this product? If not, the card says so.';
    if (t < 32.0) return '3 · Notified actives. Which ingredients have published evidence for the benefit.';
    if (t < 36.5) return '4 · Permissible wording. The claims the rules allow the brand to make.';
    if (t < 40.5) return '5 · Claim history. How the wording and rulings changed, with dates.';
    if (t < 46.5) return 'Nothing is guessed. Draft and unverified tags stay visible until a source is checked.';
    if (t < 52.0) return 'Same five parts on every card. Nothing gets a verdict.';
    if (t < 57.0) return 'Every line links to its source, so you can check it yourself.';
    return 'CGaRd · Certified isn’t the same as effective. cgard.app/how-it-works';
  };

  const transcriptScenes = [
    { time: '0:00', label: 'Hook', text: 'Legal doesn’t always mean it works.' },
    { time: '0:04', label: 'Intro', text: 'Meet CGaRd.' },
    { time: '0:06', label: 'Mystery Bottle', text: 'Here’s a mystery bottle. Let’s look at the claim behind it.' },
    { time: '0:14', label: 'Five Parts Card', text: 'Here’s the full card, in five parts.' },
    { time: '0:17', label: 'Part 1', text: '1 · Regulatory basis. The rule the claim is measured against.' },
    { time: '0:22', label: 'Part 2', text: '2 · Clinical data. Is there a test on file for this product? If not, the card says so.' },
    { time: '0:27', label: 'Part 3', text: '3 · Notified actives. Which ingredients have published evidence for the benefit.' },
    { time: '0:32', label: 'Part 4', text: '4 · Permissible wording. The claims the rules allow the brand to make.' },
    { time: '0:36', label: 'Part 5', text: '5 · Claim history. How the wording and rulings changed, with dates.' },
    { time: '0:40', label: 'Verification', text: 'Nothing is guessed. Draft and unverified tags stay visible until a source is checked.' },
    { time: '0:46', label: 'Consistency', text: 'Same five parts on every card. Nothing gets a verdict.' },
    { time: '0:52', label: 'Transparency', text: 'Every line links to its source, so you can check it yourself.' },
    { time: '0:57', label: 'Outro', text: 'CGaRd: Certified isn’t the same as effective. cgard.app/how-it-works' },
  ];

  return (
    <div
      className={`rounded-2xl border border-[#A87B4E]/30 bg-[#3D2817]/70 shadow-2xl overflow-hidden flex flex-col ${className}`}
    >
      {/* Top Video Header Bar with Aspect Ratio & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#3D2817] border-b border-[#A87B4E]/30 text-xs text-[#F5F2EB]">
        <div className="flex items-center space-x-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-[#A87B4E]'
            }`}
          />
          <span className="font-bold tracking-wide uppercase text-[11px] text-[#FFFFFF]">
            CGaRd Explainer Video
          </span>
          <span className="text-[#F5F2EB]/40">|</span>
          <span className="font-mono text-[11px] text-[#A87B4E]">
            {currentTime.toFixed(1)}s / {(duration || 30).toFixed(1)}s
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Aspect Ratio Switcher: 16:9 current screen size vs 9:16 phone screen */}
          <div className="flex items-center bg-[#2C3E50] p-0.5 rounded-lg border border-[#A87B4E]/30">
            <button
              onClick={() => handleAspectRatioChange('16:9')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                aspectRatio === '16:9'
                  ? 'bg-[#A87B4E] text-[#FFFFFF]'
                  : 'text-[#F5F2EB]/70 hover:text-[#FFFFFF]'
              }`}
              title="Current screen size: 16:9 Widescreen (1920x1080)"
            >
              <Monitor className="w-3 h-3" />
              <span>16:9</span>
            </button>
            <button
              onClick={() => handleAspectRatioChange('9:16')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                aspectRatio === '9:16'
                  ? 'bg-[#A87B4E] text-[#FFFFFF]'
                  : 'text-[#F5F2EB]/70 hover:text-[#FFFFFF]'
              }`}
              title="Phone screen size: 9:16 Vertical (1080x1920)"
            >
              <Smartphone className="w-3 h-3" />
              <span>9:16</span>
            </button>
          </div>

          {/* AI Voiceover Toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition flex items-center space-x-1 cursor-pointer ${
              voiceEnabled
                ? 'bg-[#A87B4E]/30 text-[#FFFFFF] border-[#A87B4E]'
                : 'bg-[#2C3E50] text-[#F5F2EB]/50 border-[#3D2817] hover:text-[#FFFFFF]'
            }`}
            title="Toggle voiceover audio"
          >
            <Mic className="w-3 h-3 text-[#A87B4E]" />
            <span>{voiceEnabled ? 'Voice ON' : 'Voice OFF'}</span>
          </button>

          {/* Transcript Toggle */}
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className={`p-1.5 rounded-lg border text-[11px] transition cursor-pointer ${
              showTranscript
                ? 'bg-[#A87B4E] text-[#FFFFFF] border-[#A87B4E]'
                : 'bg-[#2C3E50] text-[#F5F2EB]/70 border-[#3D2817] hover:text-[#FFFFFF]'
            }`}
            title="View script transcript"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Video Viewport Playing the Uploaded Videos */}
      <div
        className="relative bg-[#0d141c] flex items-center justify-center overflow-hidden transition-all duration-300"
        style={{
          aspectRatio: aspectRatio === '16:9' ? '16 / 9' : '9 / 16',
          maxHeight: aspectRatio === '9:16' ? '680px' : '480px',
        }}
      >
        <video
          key={`${currentVideoSrc}_${aspectRatio}`}
          ref={videoRef}
          src={currentVideoSrc}
          playsInline
          preload="auto"
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration || 30);
              if (currentTime > 0) {
                videoRef.current.currentTime = currentTime;
              }
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(duration || 30);
          }}
          onClick={handlePlayPause}
          className="w-full h-full object-contain cursor-pointer"
        />

        {/* Ambient Dark Gradient Vignette for Seamless Aesthetic */}
        <div className="absolute inset-0 pointer-events-none border border-white/5 shadow-inner" />

        {/* Big Centered Play Button when Paused */}
        {!isPlaying && (
          <motion.button
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            onClick={handlePlayPause}
            className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#A87B4E]/85 hover:bg-[#A87B4E] text-white flex items-center justify-center shadow-2xl backdrop-blur-xs transition cursor-pointer z-20 group border border-white/20"
            title="Click to play video"
          >
            <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 text-white fill-current group-hover:scale-110 transition-transform" />
          </motion.button>
        )}

        {/* Synchronized CC Captions Overlay */}
        {showCaptions && isPlaying && (
          <div className="absolute bottom-5 inset-x-0 flex justify-center px-4 pointer-events-none z-10">
            <span className="px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-xs sm:text-sm font-medium text-[#F5F2EB] shadow-lg border border-white/10 text-center max-w-md">
              {getActiveCaption(currentTime)}
            </span>
          </div>
        )}
      </div>

      {/* Video Control Bar */}
      <div className="px-4 py-3 bg-[#3D2817] border-t border-[#A87B4E]/30 flex flex-col gap-2">
        <div className="flex items-center space-x-3">
          <input
            type="range"
            min={0}
            max={duration || 30}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-[#2C3E50] rounded-lg appearance-none cursor-pointer accent-[#A87B4E]"
          />
          <span className="font-mono text-xs text-[#F5F2EB]/70 w-12 text-right">
            {currentTime.toFixed(1)}s
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-[#F5F2EB]">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePlayPause}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#A87B4E] hover:opacity-90 text-[#FFFFFF] font-semibold transition cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play Video'}</span>
            </button>

            <button
              onClick={handleRestart}
              className="p-1.5 rounded-lg bg-[#2C3E50] hover:bg-[#3D2817] border border-[#A87B4E]/30 transition text-[#F5F2EB]/80 hover:text-[#FFFFFF] cursor-pointer"
              title="Restart from 0:00"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg bg-[#2C3E50] hover:bg-[#3D2817] border border-[#A87B4E]/30 transition text-[#F5F2EB]/80 hover:text-[#FFFFFF] cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-[#A87B4E]" />
              )}
            </button>

            <button
              onClick={() => setShowCaptions(!showCaptions)}
              className={`px-2 py-1 rounded border text-[11px] font-semibold transition cursor-pointer ${
                showCaptions
                  ? 'bg-[#A87B4E]/30 text-[#FFFFFF] border-[#A87B4E]'
                  : 'bg-[#2C3E50] text-[#F5F2EB]/50 border-[#3D2817]'
              }`}
            >
              CC {showCaptions ? 'ON' : 'OFF'}
            </button>
          </div>

        </div>
      </div>

      {/* Script Transcript Collapsible Drawer */}
      <AnimatePresence>
        {showTranscript && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#A87B4E]/30 bg-[#2C3E50]/90 p-4 text-xs space-y-2 overflow-hidden"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#3D2817]">
              <span className="font-bold text-[#FFFFFF]">1-Minute Explainer Script</span>
              <span className="text-[10px] text-[#A87B4E] font-mono">13 Scenes · Click to Jump</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {transcriptScenes.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const parts = item.time.split(':');
                    const sec = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
                    if (videoRef.current) {
                      videoRef.current.currentTime = sec;
                      setCurrentTime(sec);
                      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                    }
                  }}
                  className="p-2 rounded-lg bg-[#3D2817]/60 hover:bg-[#3D2817] border border-[#A87B4E]/20 text-left transition flex items-start space-x-2 cursor-pointer"
                >
                  <span className="font-mono text-[#A87B4E] font-bold shrink-0">{item.time}</span>
                  <div>
                    <span className="text-[#FFFFFF] font-semibold block text-[11px]">{item.label}</span>
                    <span className="text-[#F5F2EB]/70 text-[10px] line-clamp-2">{item.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
