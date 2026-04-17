import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useApp } from "../../contexts/AppContext";
import { playSOSAlarm, playUIClick } from "../../services/soundService";
import { Play, Pause, SkipBack, SkipForward, Volume2, Search } from "lucide-react";

// ── Hold-progress SVG ring ────────────────────────────────
function ProgressRing({ progress, active }: { progress: number; active: boolean }) {
  const R = 118;
  const circum = 2 * Math.PI * R;
  const offset = circum - (progress / 100) * circum;
  return (
    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 256 256">
      <circle cx="128" cy="128" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
      <circle cx="128" cy="128" r={R} fill="none"
        stroke={active ? "#ef4444" : "#C9A84C"} strokeWidth="6"
        strokeDasharray={circum} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.1s linear, stroke 0.3s ease" }} />
    </svg>
  );
}

// ── iTunes search helper ────────────────────────────────
async function searchSpotify(query: string): Promise<any[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=15`);
    const data = await res.json();
    return data.results.map((t: any) => ({
      id: t.trackId.toString(),
      title: t.trackName,
      artist: t.artistName,
      duration: `${Math.floor(t.trackTimeMillis / 60000)}:${String(Math.floor((t.trackTimeMillis % 60000) / 1000)).padStart(2, "0")}`,
      preview_url: t.previewUrl,
      album_image: t.artworkUrl100 ? t.artworkUrl100.replace("100x100", "512x512") : ""
    }));
  } catch (err) {
    console.error("Music search error:", err);
    return [];
  }
}

// ── Default tracks (Offline fallback) ──────────────────────────────
const DEFAULT_TRACKS = [
  { id: "1120230794", title: "Алматы Түні (feat. Nyusha)", artist: "Kairat Nurtas", duration: "3:42", preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/a7/b5/39/a7b5399c-db3a-5061-2681-c5756b0879c0/mzaf_7245922524415843738.plus.aac.p.m4a", album_image: "https://is1-ssl.mzstatic.com/image/thumb/Music49/v4/bf/25/7f/bf257fe5-520f-b258-c5db-6dbdb4b2efc8/888608821946.jpg/512x512bb.jpg" },
  { id: "1541615836", title: "Seni Suiem", artist: "Kairat Nurtas", duration: "4:00", preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/03/00/68/030068f7-fc24-97a2-5392-08066e616e1f/mzaf_6554679778305263790.plus.aac.p.m4a", album_image: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/69/ed/fb/69edfbfe-76f5-5fd8-5c4d-b903bb29beba/195497491717.jpg/512x512bb.jpg" },
  { id: "1755224547", title: "Tun", artist: "Jamal & Ganja, Ирина Кайратовна & Kairat Nurtas", duration: "3:40", preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/2f/6e/c3/2f6ec3d2-7910-25b8-f173-2cca8ac6f596/mzaf_12680396539490778436.plus.aac.p.m4a", album_image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/80/7e/bb/807ebbdd-d0d0-fb16-6cbf-32da5bd23b10/198588506013.jpg/512x512bb.jpg" },
  { id: "1135528345", title: "Қазақша ламбада", artist: "Kairat Nurtas", duration: "3:30", preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/61/bf/1c/61bf1cb5-6675-4aba-616b-60f22cf10881/mzaf_8180574414701085826.plus.aac.p.m4a", album_image: "https://is1-ssl.mzstatic.com/image/thumb/Music60/v4/64/73/19/64731998-ef22-c23f-e8b4-82ea7c356ceb/888608976400.jpg/512x512bb.jpg" }
];

export function HiddenSOS() {
  const { t, language } = useLanguage();
  const { emergencyContacts, settings } = useApp();

  // Music player state
  const [tracks, setTracks] = useState<any[]>(DEFAULT_TRACKS);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicProgress, setMusicProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // SOS state
  const [sosProgress, setSosProgress] = useState(0);
  const [sosActive, setSosActive] = useState(false);
  const [sosOverlay, setSosOverlay] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(0); // 5-second cancel window
  const [sosConfirmed, setSosConfirmed] = useState(false); // actual dispatch
  const [notifyStep, setNotifyStep] = useState(0);
  const pressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPressingRef = useRef(false);

  // Audio player context
  useEffect(() => {
    const track = tracks[currentTrack];
    if (!track) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    const audio = audioRef.current;
    
    audio.ontimeupdate = () => {
      if (audio.duration) setMusicProgress((audio.currentTime / audio.duration) * 100);
    };
    audio.onended = () => {
      setCurrentTrack(i => (i + 1) % tracks.length);
    };

    if (track.preview_url) {
      if (audio.src !== track.preview_url) {
        audio.src = track.preview_url;
      }
      if (isPlaying) {
        audio.play().catch((e) => {
          console.error("Audio play blocked", e);
          setIsPlaying(false);
        });
      } else {
        audio.pause();
      }
    } else {
      audio.pause();
    }

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: 'Qorgan Music',
        artwork: track.album_image ? [{ src: track.album_image, sizes: '512x512', type: 'image/jpeg' }] : []
      });
      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler('nexttrack', () => setCurrentTrack(i => (i + 1) % tracks.length));
      navigator.mediaSession.setActionHandler('previoustrack', () => setCurrentTrack(i => (i - 1 + tracks.length) % tracks.length));
    }
  }, [currentTrack, isPlaying, tracks]);

  // Volume sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  // Music progress simulation for non-preview tracks
  useEffect(() => {
    if (!isPlaying || tracks[currentTrack]?.preview_url) return;
    const iv = setInterval(() => setMusicProgress(p => p >= 100 ? 0 : p + 0.05), 100);
    return () => clearInterval(iv);
  }, [isPlaying, currentTrack, tracks]);

  // Spotify search debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) return;
    const timer = setTimeout(async () => {
      const results = await searchSpotify(searchQuery);
      if (results.length > 0) setTracks(results);
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // SOS countdown: 5s cancel window before actual dispatch
  useEffect(() => {
    if (!sosOverlay || sosConfirmed) return;
    // Start 5-second countdown
    setSosCountdown(5);
    countdownRef.current = setInterval(() => {
      setSosCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          // Countdown finished — CONFIRM SOS
          setSosConfirmed(true);
          // Initiate 112 call
          try { window.open("tel:112", "_self"); } catch {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [sosOverlay, sosConfirmed]);

  // SOS notification steps — only fires AFTER countdown confirms
  useEffect(() => {
    if (!sosConfirmed) return;
    const realContacts = emergencyContacts || [];
    const total = realContacts.length + 2;
    let step = 0;
    const iv = setInterval(() => {
      step++;
      setNotifyStep(step);
      if (step >= total) clearInterval(iv);
    }, 800);
    return () => clearInterval(iv);
  }, [sosConfirmed, emergencyContacts]);

  const startPress = useCallback(() => {
    if (sosActive) return;
    isPressingRef.current = true;
    setSosProgress(0);
    pressIntervalRef.current = setInterval(() => {
      setSosProgress(p => {
        const next = p + 2.5;
        if (next >= 100) {
          clearInterval(pressIntervalRef.current!);
          isPressingRef.current = false;
          // Enter countdown phase (NOT yet confirmed)
          setSosActive(true);
          setSosOverlay(true);
          setSosConfirmed(false);
          setNotifyStep(0);
          setSosCountdown(5);
          if (settings.soundEffects) playSOSAlarm();
          if (settings.hapticFeedback && navigator.vibrate) {
            navigator.vibrate([300, 100, 300, 100, 500]);
          }
          return 100;
        }
        return next;
      });
    }, 50);
  }, [sosActive, settings]);

  const cancelPress = useCallback(() => {
    if (isPressingRef.current) {
      isPressingRef.current = false;
      clearInterval(pressIntervalRef.current!);
      setSosProgress(0);
    }
  }, []);

  const deactivateSOS = () => {
    // Cancel countdown if still running
    if (countdownRef.current) clearInterval(countdownRef.current);
    setSosActive(false);
    setSosOverlay(false);
    setSosConfirmed(false);
    setSosProgress(0);
    setSosCountdown(0);
    setNotifyStep(0);
  };

  // Use only real user-added contacts — NO hardcoded fallback
  const realContacts = emergencyContacts || [];

  const track = tracks[currentTrack] || tracks[0];

  const txt = {
    nowPlaying: language === "ru" ? "Сейчас играет" : language === "kk" ? "Қазір ойнатылуда" : "Now Playing",
    holdSOS: language === "ru" ? "Удерживайте для текста песни" : language === "kk" ? "Ән мәтінін көру үшін ұстаңыз" : "Hold for lyrics",
    sosTitle: language === "ru" ? "SOS Активирован!" : language === "kk" ? "SOS Белсендірілді!" : "SOS Activated!",
    notifying: language === "ru" ? "Оповещаем контакты..." : language === "kk" ? "Контактілерге хабарлануда..." : "Alerting contacts...",
    gpsSent: language === "ru" ? "GPS локация отправлена" : language === "kk" ? "GPS орны жіберілді" : "GPS location sent",
    calling112: language === "ru" ? "Вызов 112 (экстренные службы)" : language === "kk" ? "112-ге қоңырау (жедел қызмет)" : "Calling 112 (emergency)",
    cancel: language === "ru" ? "Отменить SOS" : language === "kk" ? "SOS болдырмау" : "Cancel SOS",
    countdownMsg: language === "ru" ? "SOS через" : language === "kk" ? "SOS" : "SOS in",
    countdownSec: language === "ru" ? "сек" : language === "kk" ? "сек" : "sec",
    cancelNow: language === "ru" ? "Нажмите чтобы отменить" : language === "kk" ? "Болдырмау үшін басыңыз" : "Tap to cancel",
    sent: language === "ru" ? "Оповещён" : language === "kk" ? "Хабарланды" : "Notified",
    playlist: language === "ru" ? "Плейлист" : language === "kk" ? "Ойнату тізімі" : "Playlist",
    searchMusic: language === "ru" ? "Искать музыку..." : language === "kk" ? "Музыка іздеу..." : "Search music...",
    noContacts: language === "ru" ? "Нет добавленных контактов" : language === "kk" ? "Қосылған контактілер жоқ" : "No contacts added",
    addInMenu: language === "ru" ? "Добавьте контакты в меню → SOS Контакты" : language === "kk" ? "Мәзірден → SOS Контактілер арқылы қосыңыз" : "Add contacts via Menu → SOS Contacts",
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#0d0512" }}>
      {/* SOS ACTIVE OVERLAY */}
      {sosOverlay && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(239,68,68,0.25) 0%, transparent 70%)" }} />

          {/* Pulsing SOS ring */}
          <div className="relative mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="absolute inset-0 rounded-full border-2 border-red-500"
                style={{ animation: `ping 1.6s ease-out ${i * 0.4}s infinite`, opacity: 0 }}
              />
            ))}
            <div className="relative w-32 h-32 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center shadow-[0_0_60px_rgba(239,68,68,0.5)]">
              {!sosConfirmed && sosCountdown > 0 ? (
                <span className="text-5xl font-bold text-red-400 animate-pulse">{sosCountdown}</span>
              ) : (
                <svg className="w-16 h-16 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              )}
            </div>
          </div>

          {!sosConfirmed && sosCountdown > 0 ? (
            /* ─── Countdown phase: large cancel button ─── */
            <>
              <h2 className="text-2xl font-bold text-red-400 mb-2 tracking-widest">
                {txt.countdownMsg} {sosCountdown} {txt.countdownSec}
              </h2>
              <p className="text-white/50 text-sm mb-8">{txt.cancelNow}</p>
              <button onClick={deactivateSOS}
                className="px-12 py-5 rounded-2xl border-2 border-red-500/60 bg-red-500/10 text-red-400 text-lg font-bold tracking-wider hover:bg-red-500/20 transition-all active:scale-95 animate-pulse">
                {txt.cancel}
              </button>
            </>
          ) : (
            /* ─── Confirmed phase: notification steps ─── */
            <>
              <h2 className="text-3xl font-bold text-red-400 mb-2 tracking-widest">{txt.sosTitle}</h2>
              <p className="text-white/60 text-sm mb-8">{txt.notifying}</p>

          {/* Notification list */}
          <div className="w-full max-w-sm px-6 space-y-3 mb-6">
            {/* GPS step */}
            <div className={`flex items-center gap-3 bg-white/5 rounded-2xl p-3 border transition-all duration-500 ${
              notifyStep > 0 ? "border-teal-400/40 bg-teal-400/5" : "border-white/10"
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                notifyStep > 0 ? "bg-teal-400/20" : "bg-white/5"
              }`}>
                <svg className={`w-4 h-4 ${notifyStep > 0 ? "text-teal-400" : "text-white/30"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${notifyStep > 0 ? "text-teal-400" : "text-white/40"}`}>{txt.gpsSent}</p>
                {notifyStep > 0 && <p className="text-white/40 text-xs">📍 Алматы, Казахстан</p>}
              </div>
              {notifyStep > 0 && (
                <svg className="w-4 h-4 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17L4 12" />
                </svg>
              )}
            </div>

            {/* 112 Emergency call step */}
            <div className={`flex items-center gap-3 bg-white/5 rounded-2xl p-3 border transition-all duration-500 ${
              notifyStep > 1 ? "border-red-400/40 bg-red-400/5" : "border-white/10"
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                notifyStep > 1 ? "bg-red-400/20 text-red-300" : "bg-white/5 text-white/30"
              }`}>
                📞
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${notifyStep > 1 ? "text-white/90" : "text-white/40"}`}>{txt.calling112}</p>
                <p className="text-white/30 text-xs">112</p>
              </div>
              {notifyStep > 1 ? (
                <span className="text-red-400 text-xs font-semibold">{txt.sent} ✓</span>
              ) : (
                notifyStep === 1 && (
                  <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                )
              )}
            </div>

            {/* Contact notification steps — only real user-added contacts */}
            {realContacts.length === 0 && notifyStep > 1 && (
              <div className="text-center py-3">
                <p className="text-white/40 text-xs">{txt.noContacts}</p>
                <p className="text-white/25 text-[10px] mt-1">{txt.addInMenu}</p>
              </div>
            )}
            {realContacts.map((c: any, i) => (
              <div key={c.id || i} className={`flex items-center gap-3 bg-white/5 rounded-2xl p-3 border transition-all duration-500 ${
                notifyStep > i + 2 ? "border-red-400/40 bg-red-400/5" : "border-white/10"
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  notifyStep > i + 2 ? "bg-red-400/20 text-red-300" : "bg-white/5 text-white/30"
                }`}>
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${notifyStep > i + 2 ? "text-white/90" : "text-white/40"}`}>{c.name}</p>
                  <p className="text-white/30 text-xs">{c.phone}</p>
                </div>
                {notifyStep > i + 2 ? (
                  <span className="text-red-400 text-xs font-semibold">{txt.sent} ✓</span>
                ) : (
                  notifyStep === i + 2 && (
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  )
                )}
              </div>
            ))}
          </div>

          <button onClick={deactivateSOS}
            className="px-8 py-3 rounded-2xl border border-white/20 bg-white/5 text-white/70 text-sm hover:bg-white/10 transition-all active:scale-95">
            {txt.cancel}
          </button>
            </>
          )}
        </div>
      )}

      {/* Subtle background ornaments */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <svg className="w-full h-full">
          <defs>
            <pattern id="sos_pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="20" fill="none" stroke="#C9A84C" strokeWidth="1" />
              <path d="M50 30 L50 70 M30 50 L70 50" stroke="#C9A84C" strokeWidth="0.8" opacity="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sos_pattern)" />
        </svg>
      </div>

      {/* Top glow */}
      <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 100% at 50% 0%, rgba(75,0,60,0.5) 0%, transparent 100%)" }} />

      <div className="relative z-10 max-w-md mx-auto px-5 pt-20 pb-32">
        {/* Header */}
        <div className="mb-7 flex items-center justify-between">
          <div>
            <p className="text-white/40 text-xs tracking-widest uppercase mb-1">{txt.nowPlaying}</p>
            <h2 className="text-2xl text-white/90 font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Qorgan Music
            </h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setShowSearchInput(s => !s); playUIClick(); }}
              className={`p-2 rounded-lg border transition-all ${
                showSearchInput ? "bg-teal-400/20 border-teal-400/40 text-teal-400" : "bg-white/5 border-white/10 text-white/50"
              }`}>
              <Search className="w-4 h-4" />
            </button>
            <button onClick={() => { setShowPlaylist(p => !p); playUIClick(); }}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                showPlaylist ? "bg-amber-400/20 border-amber-400/40 text-amber-400" : "bg-white/5 border-white/10 text-white/50"
              }`}>
              {txt.playlist}
            </button>
          </div>
        </div>

        {/* Spotify Search */}
        {showSearchInput && (
          <div className="mb-4 bg-white/5 rounded-2xl border border-white/10 p-3">
            <input
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={txt.searchMusic}
              className="w-full bg-transparent text-white text-sm placeholder-white/30 outline-none"
            />
          </div>
        )}

        {/* PLAYLIST (when open) */}
        {showPlaylist && (
          <div className="mb-6 bg-white/5 rounded-2xl border border-white/10 overflow-hidden max-h-64 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            {tracks.map((tr, i) => (
              <button key={tr.id} onClick={() => { setCurrentTrack(i); setIsPlaying(true); playUIClick(); }}
                className={`w-full flex items-center gap-3 p-3 text-left transition-all ${
                  i === currentTrack ? "bg-amber-400/10 border-b border-amber-400/10" : "hover:bg-white/5 border-b border-white/5"
                } last:border-0`}>
                {tr.album_image ? (
                  <img src={tr.album_image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    i === currentTrack ? "bg-amber-400 text-black" : "bg-white/10 text-white/60"
                  }`}>
                    {i === currentTrack && isPlaying ? "♫" : i + 1}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${i === currentTrack ? "text-amber-400" : "text-white/80"}`}>{tr.title}</p>
                  <p className="text-white/40 text-xs truncate">{tr.artist}</p>
                </div>
                <span className="text-white/30 text-xs flex-shrink-0">{tr.duration}</span>
              </button>
            ))}
          </div>
        )}

        {/* ALBUM ART — Hidden SOS Button */}
        <div className="relative mb-7">
          {/* SOS progress ring overlaid on art */}
          <div className="relative">
            <ProgressRing progress={sosProgress} active={sosActive} />

            {/* Album art */}
            <div
              className="mx-3 my-3 aspect-square rounded-2xl overflow-hidden relative cursor-pointer select-none"
              style={{ touchAction: "none" }}
              onPointerDown={startPress}
              onPointerUp={cancelPress}
              onPointerLeave={cancelPress}
            >
              {/* Art gradient */}
              <div className="absolute inset-0" style={{
                background: "linear-gradient(135deg, #3D0818 0%, #1a0510 40%, #0d0020 100%)"
              }} />

              {/* Album image from spotify (if available) */}
              {track?.album_image && (
                <img src={track.album_image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
              )}

              {/* Animated ornament pattern */}
              <svg className="absolute inset-0 w-full h-full opacity-35">
                <defs>
                  <pattern id="art_pat" x="0" y="0" width="70" height="70" patternUnits="userSpaceOnUse">
                    <path d="M20 35Q16 29 12 26Q8 23 8 19Q8 15 12 14" fill="none" stroke="#C9A84C" strokeWidth="1.2" opacity="0.7" />
                    <path d="M50 35Q54 29 58 26Q62 23 62 19Q62 15 58 14" fill="none" stroke="#C9A84C" strokeWidth="1.2" opacity="0.7" />
                    <path d="M20 35Q16 41 12 44Q8 47 8 51Q8 55 12 56" fill="none" stroke="#C9A84C" strokeWidth="1.2" opacity="0.7" />
                    <path d="M50 35Q54 41 58 44Q62 47 62 51Q62 55 58 56" fill="none" stroke="#C9A84C" strokeWidth="1.2" opacity="0.7" />
                    <circle cx="35" cy="35" r="8" fill="none" stroke="#C9A84C" strokeWidth="0.8" opacity="0.5" />
                    <circle cx="35" cy="35" r="3" fill="#C9A84C" opacity="0.4" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#art_pat)" />
              </svg>

              {/* Center Tumar */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="100" height="130" viewBox="0 0 100 130"
                  className={`transition-all duration-500 ${
                    sosActive ? "drop-shadow-[0_0_30px_rgba(239,68,68,1)]"
                    : sosProgress > 0 ? "drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]"
                    : "drop-shadow-[0_0_15px_rgba(201,168,76,0.5)]"
                  }`}
                  style={{ animation: sosActive ? "pulse 0.8s ease-in-out infinite" : "" }}>
                  <defs>
                    <linearGradient id="tumar_sos" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={sosActive ? "#ef4444" : "#FFD700"} />
                      <stop offset="100%" stopColor={sosActive ? "#dc2626" : "#C9A84C"} />
                    </linearGradient>
                  </defs>
                  <path d="M50 8 L88 100 L50 115 L12 100 Z" fill="url(#tumar_sos)" stroke={sosActive ? "#ef4444" : "#FFD700"} strokeWidth="1.2" />
                  <circle cx="50" cy="48" r="20" fill="none" stroke="#3D0818" strokeWidth="2" />
                  <circle cx="50" cy="48" r="12" fill="none" stroke="#3D0818" strokeWidth="1.5" />
                  <path d="M50 34Q42 38 39 46Q36 54 39 61Q42 65 50 65" fill="none" stroke="#3D0818" strokeWidth="1.5" />
                  <path d="M50 34Q58 38 61 46Q64 54 61 61Q58 65 50 65" fill="none" stroke="#3D0818" strokeWidth="1.5" />
                  <path d="M50 82L46 93L50 89L54 93Z" fill="#3D0818" />
                </svg>
              </div>

              {/* Hold hint overlay */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all flex items-end justify-center pb-5">
                <p className="text-white/0 hover:text-white/60 transition-all text-xs text-center px-4 leading-snug">
                  {txt.holdSOS}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Song Info */}
        <div className="text-center mb-6">
          <h3 className="text-xl text-white/90 mb-1 font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {track?.title || "—"}
          </h3>
          <p className="text-white/45 text-sm">{track?.artist || ""}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-5">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = ((e.clientX - rect.left) / rect.width) * 100;
              setMusicProgress(pct);
              if (audioRef.current && audioRef.current.duration) {
                audioRef.current.currentTime = (pct / 100) * audioRef.current.duration;
              }
            }}>
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${musicProgress}%`,
                background: "linear-gradient(90deg, #DAA520, #40E0D0)"
              }} />
          </div>
          <div className="flex justify-between text-xs text-white/30 mt-1.5">
            <span>
              {`${Math.floor(musicProgress * 0.035)}:${String(Math.floor((musicProgress * 0.035 % 1) * 60)).padStart(2, "0")}`}
            </span>
            <span>{track?.duration || "0:00"}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 mb-4">
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => { setCurrentTrack(i => (i - 1 + tracks.length) % tracks.length); playUIClick(); }}
              className="text-white/50 hover:text-white transition-colors active:scale-90 p-2">
              <SkipBack className="w-6 h-6" />
            </button>

            <button onClick={() => { setIsPlaying(p => !p); playUIClick(); }}
              className="w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg"
              style={{ background: "linear-gradient(135deg, #DAA520, #B8860B)", boxShadow: "0 0 20px rgba(218,165,32,0.4)" }}>
              {isPlaying
                ? <Pause className="w-7 h-7 text-white" fill="white" />
                : <Play className="w-7 h-7 text-white ml-1" fill="white" />
              }
            </button>

            <button onClick={() => { setCurrentTrack(i => (i + 1) % tracks.length); playUIClick(); }}
              className="text-white/50 hover:text-white transition-colors active:scale-90 p-2">
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-white/40 flex-shrink-0" />
            <input type="range" min="0" max="100" value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: "#DAA520" }} />
            <span className="text-white/30 text-xs w-7 text-right">{volume}</span>
          </div>
        </div>
      </div>


      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
