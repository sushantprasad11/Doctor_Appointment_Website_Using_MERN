import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConsultationAccess } from '../api/reviewApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Toast from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import Peer from 'peerjs';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff, FiPhone } from 'react-icons/fi';

export default function ConsultationRoom() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast, showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [consultation, setConsultation] = useState(null);
  const [connected, setConnected] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [remotePeerId, setRemotePeerId] = useState('');
  const [myPeerId, setMyPeerId] = useState('');

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const currentCallRef = useRef(null);

  useEffect(() => {
    fetchAccess();
    return () => cleanup();
  }, [appointmentId]);

  const fetchAccess = async () => {
    try {
      const { data } = await getConsultationAccess(appointmentId);
      setConsultation(data.consultation);
      initPeer(data.consultation.sessionId);
    } catch (err) {
      showToast(err.message || 'Cannot access consultation', 'error');
      setTimeout(() => navigate(-1), 2000);
    } finally {
      setLoading(false);
    }
  };

  const initPeer = (sessionId) => {
    // Create a deterministic peer ID based on session + user role
    const peerId = `${sessionId}_${user.role}_${user._id.slice(-6)}`;

    const peer = new Peer(peerId, {
      debug: 0,
    });

    peer.on('open', (id) => {
      setMyPeerId(id);
      setConnected(true);
    });

    peer.on('call', (call) => {
      // Incoming call — answer it
      getMediaStream().then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        call.answer(stream);
        call.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
          setCallActive(true);
        });
        currentCallRef.current = call;
      });
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      if (err.type !== 'peer-unavailable') {
        showToast('Connection error. Please refresh.', 'error');
      }
    });

    peerRef.current = peer;
  };

  const getMediaStream = async () => {
    const isVideo = consultation?.consultationType === 'video';
    return navigator.mediaDevices.getUserMedia({
      audio: true,
      video: isVideo,
    });
  };

  const startCall = async () => {
    if (!remotePeerId.trim()) {
      showToast('Enter the other participant\'s Peer ID to connect', 'error');
      return;
    }

    try {
      const stream = await getMediaStream();
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const call = peerRef.current.call(remotePeerId.trim(), stream);
      call.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
        setCallActive(true);
      });
      call.on('close', () => {
        setCallActive(false);
        showToast('Call ended', 'info');
      });
      currentCallRef.current = call;
    } catch (err) {
      showToast('Failed to start call. Check permissions.', 'error');
    }
  };

  const endCall = () => {
    if (currentCallRef.current) currentCallRef.current.close();
    cleanup();
    setCallActive(false);
    showToast('Call ended', 'info');
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicOn(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoOn(videoTrack.enabled);
      }
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerRef.current) {
      peerRef.current.destroy();
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!consultation) return <div className="page container"><h2>Consultation not available</h2></div>;

  const isVideo = consultation.consultationType === 'video';

  return (
    <div className="consultation-room">
      <Toast toast={toast} />

      {/* Header */}
      <div className="consultation-header">
        <div>
          <h3 style={{ fontSize: 'var(--font-size-base)' }}>
            {isVideo ? '📹 Video' : '🎙️ Audio'} Consultation
          </h3>
          <p style={{ fontSize: 'var(--font-size-xs)', opacity: 0.7 }}>
            {consultation.doctor?.name} — {new Date(consultation.appointment.appointmentDate).toLocaleDateString()} at {consultation.appointment.startTime}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div style={{ background: connected ? 'var(--color-success)' : 'var(--color-error)', width: 8, height: 8, borderRadius: '50%' }} />
          <span style={{ fontSize: 'var(--font-size-xs)' }}>{connected ? 'Connected' : 'Connecting...'}</span>
        </div>
      </div>

      {/* Video/Audio area */}
      <div className="video-container" style={{ position: 'relative' }}>
        {isVideo ? (
          <>
            <div className="video-frame" style={{ width: '100%', maxWidth: '800px', aspectRatio: '16/9', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {!callActive && <p style={{ position: 'absolute', color: 'white', opacity: 0.5 }}>Waiting for the other participant...</p>}
            </div>
            <div className="video-frame local-video">
              <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)', fontSize: '3rem' }}>
              🎙️
            </div>
            <audio ref={remoteVideoRef} autoPlay />
            <audio ref={localVideoRef} autoPlay muted />
            <h2 style={{ color: 'white', marginBottom: 'var(--space-2)' }}>
              {callActive ? 'Call in progress...' : 'Ready to connect'}
            </h2>
            <p style={{ opacity: 0.6 }}>Audio Consultation</p>
          </div>
        )}
      </div>

      {/* Connection Panel */}
      {connected && !callActive && (
        <div style={{ padding: 'var(--space-4)', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
          <span style={{ color: 'white', fontSize: 'var(--font-size-xs)' }}>Your ID: <strong>{myPeerId}</strong></span>
          <input
            style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 'var(--font-size-sm)', width: '280px' }}
            placeholder="Enter other participant's Peer ID"
            value={remotePeerId}
            onChange={(e) => setRemotePeerId(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" onClick={startCall}>
            <FiPhone size={14} /> Connect
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="consultation-controls">
        <button className={`control-btn ${!micOn ? 'active' : ''}`} onClick={toggleMic} title={micOn ? 'Mute' : 'Unmute'}>
          {micOn ? <FiMic size={20} /> : <FiMicOff size={20} />}
        </button>
        {isVideo && (
          <button className={`control-btn ${!videoOn ? 'active' : ''}`} onClick={toggleVideo} title={videoOn ? 'Turn off camera' : 'Turn on camera'}>
            {videoOn ? <FiVideo size={20} /> : <FiVideoOff size={20} />}
          </button>
        )}
        <button className="control-btn end-call" onClick={endCall} title="End call">
          <FiPhoneOff size={24} />
        </button>
      </div>
    </div>
  );
}
