import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Agent } from '../../types/agent';
import type { Site } from '../../types/site';

export default function FacialCheckInPage() {
  const { code } = useParams<{ code: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [action, setAction] = useState<'check_in' | 'check_out'>('check_in');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (code) {
      fetchSiteAndAgents();
    }
    return () => {
      // Cleanup video stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [code]);

  const fetchSiteAndAgents = async () => {
    try {
      if (!code) {
        throw new Error('Invalid check-in code');
      }

      // Get site info
      const { data: siteData, error: siteError } = await supabase
        .from('sites')
        .select('id, site_name')
        .eq('facial_checkin_code', code)
        .eq('facial_checkin_enabled', true)
        .single();

      if (siteError) throw siteError;
      if (!siteData) throw new Error('Invalid check-in code');

      setSite(siteData);

      // Get agents for this site
      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select('id, name, photo_url')
        .eq('site_id', siteData.id)
        .eq('status', 'active')
        .order('name');

      if (agentsError) throw agentsError;
      setAgents(agentsData || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid check-in code';
      setError(errorMessage);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (error) {
      setError('Camera access denied. Please enable camera access to continue.');
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !site || !selectedAgent) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(videoRef.current, 0, 0);
    
    // Convert to blob with compression
    return new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob!),
        'image/jpeg',
        0.7 // compression quality
      );
    });
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!site || !selectedAgent) {
        throw new Error('Please select an agent');
      }

      const photo = await capturePhoto();
      if (!photo) {
        throw new Error('Failed to capture photo');
      }

      // Upload photo
      const photoPath = `${Date.now()}-${selectedAgent}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('attendance-photos')
        .upload(photoPath, photo);

      if (uploadError) throw uploadError;

      // Get photo URL
      const { data: { publicUrl: photoUrl } } = supabase.storage
        .from('attendance-photos')
        .getPublicUrl(photoPath);

      // Create attendance record
      const attendanceData = {
        agent_id: selectedAgent,
        site_id: site.id,
        date: new Date().toISOString().split('T')[0],
        [action === 'check_in' ? 'check_in' : 'check_out']: new Date().toISOString(),
        status: 'present'
      };

      const { data: record, error: recordError } = await supabase
        .from('attendance_records')
        .upsert(attendanceData)
        .select()
        .single();

      if (recordError) throw recordError;

      // Save photo reference
      const { error: photoError } = await supabase
        .from('attendance_photos')
        .insert({
          attendance_id: record.id,
          photo_url: photoUrl,
          photo_type: action
        });

      if (photoError) throw photoError;

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedAgent('');
        setAction('check_in');
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-600 text-center mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            {site.site_name}
          </h1>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Agent
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => {
                  setSelectedAgent(e.target.value);
                  if (e.target.value) startCamera();
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Choose agent...</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedAgent && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Action
                  </label>
                  <div className="mt-1 grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setAction('check_in')}
                      className={`py-2 text-sm font-medium rounded-md ${
                        action === 'check_in'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ARRIVÉE
                    </button>
                    <button
                      type="button"
                      onClick={() => setAction('check_out')}
                      className={`py-2 text-sm font-medium rounded-md ${
                        action === 'check_out'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      DÉPART
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg"
                  />
                  {success && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                      <div className="text-white text-xl font-bold">
                        ✓ Success!
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCheckIn}
                  disabled={loading || !selectedAgent}
                  className={`w-full py-3 text-white font-medium rounded-md ${
                    action === 'check_in'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50`}
                >
                  {loading ? 'Processing...' : action === 'check_in' ? 'Check In' : 'Check Out'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}