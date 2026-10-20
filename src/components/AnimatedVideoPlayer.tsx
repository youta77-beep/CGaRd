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
  const [duration, setDuration] = useState<number>(30);
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
    if (t < 3.0) return 'Every bottle makes a promise.';
    if (t < 5.0) return 'Claims sit behind regulatory paperwork.';
    if (t < 7.5) return 'Know if the claim was ever checked.';
    if (t < 10.0) return 'See which rule the claim sits under.';
    if (t < 12.5) return 'Spot when there is no test on file.';
    if (t < 15.0) return 'See how many listed actives have proof.';
    if (t < 17.5) return 'Know which words the rules allow.';
    if (t < 20.0) return 'Watch how the claim changed over time.';
    if (t < 24.0) return 'All regulatory facts reassemble into one card.';
    if (t < 28.0) return 'Claims: certified ≠ effective.';
    return 'See how it works · cgard.app';
  };

  const transcriptScenes = [
    { time: '0:00', label: 'Hook', text: 'Every bottle makes a promise. Legal doesn’t always mean it works.' },
    { time: '0:05', label: 'Feature 1', text: 'Know if the claim has been checked at all.' },
    { time: '0:07', label: 'Feature 2', text: 'See which rule the claim sits under.' },
    { time: '0:10', label: 'Feature 3', text: 'Spot when there’s no test on file.' },
    { time: '0:12', label: 'Feature 4', text: 'See how many listed actives have proof.' },
    { time: '0:15', label: 'Feature 5', text: 'Know which words the rules allow.' },
    { time: '0:17', label: 'Feature 6', text: 'Watch how the claim changed over time.' },
    { time: '0:20', label: 'Feature 7', text: 'All of it in one simple card.' },
    { time: '0:24', label: 'Philosophy', text: 'CGaRd: Claims: certified ≠ effective.' },
    { time: '0:28', label: 'Outro', text: 'See how it works at cgard.app/how-it-works' },
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
              <span className="font-bold text-[#FFFFFF]">30-Second Explainer Script</span>
              <span className="text-[10px] text-[#A87B4E] font-mono">10 Scenes · Click to Jump</span>
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
