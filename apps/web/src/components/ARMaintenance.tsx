import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ARMaintenanceProps {
  assetId: string;
  onClose: () => void;
}

interface MaintenanceStep {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  imageUrl?: string;
  videoUrl?: string;
  estimatedTime: number;
  tools: string[];
  safetyNotes: string[];
}

export default function ARMaintenance({ assetId, onClose }: ARMaintenanceProps) {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isARSupported, setIsARSupported] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [maintenanceSteps, setMaintenanceSteps] = useState<MaintenanceStep[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Sample maintenance steps (in production, this would come from API)
  const sampleSteps: MaintenanceStep[] = [
    {
      id: '1',
      title: 'Visual Inspection',
      description: 'Perform initial visual inspection of the equipment',
      instructions: [
        'Check for visible damage or wear',
        'Look for loose connections',
        'Verify all safety guards are in place',
        'Check for any leaks or unusual sounds'
      ],
      estimatedTime: 5,
      tools: ['Flashlight', 'Safety glasses'],
      safetyNotes: ['Ensure equipment is powered off', 'Wear appropriate PPE']
    },
    {
      id: '2',
      title: 'Temperature Check',
      description: 'Measure operating temperature',
      instructions: [
        'Use infrared thermometer',
        'Point at motor housing',
        'Record temperature reading',
        'Compare with normal operating range'
      ],
      estimatedTime: 3,
      tools: ['Infrared thermometer'],
      safetyNotes: ['Do not touch hot surfaces', 'Allow equipment to cool if needed']
    },
    {
      id: '3',
      title: 'Vibration Analysis',
      description: 'Check for excessive vibration',
      instructions: [
        'Place hand on equipment housing',
        'Feel for unusual vibrations',
        'Check mounting bolts for tightness',
        'Record vibration level'
      ],
      estimatedTime: 4,
      tools: ['Vibration meter'],
      safetyNotes: ['Ensure equipment is running', 'Use proper hand placement']
    }
  ];

  useEffect(() => {
    setMaintenanceSteps(sampleSteps);
    checkARSupport();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const checkARSupport = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const constraints = {
          video: {
            facingMode: 'environment' // Use back camera
          }
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setIsARSupported(true);
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('AR not supported:', error);
        setIsARSupported(false);
      }
    } else {
      setIsARSupported(false);
    }
  };

  const startARStream = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment'
        }
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setIsStreaming(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error starting AR stream:', error);
    }
  };

  const stopARStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsStreaming(false);
    }
  };

  const nextStep = () => {
    if (currentStep < maintenanceSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeMaintenance = async () => {
    try {
      // In production, this would save to the database
      console.log('Maintenance completed for asset:', assetId);
      setIsCompleted(true);
    } catch (error) {
      console.error('Error completing maintenance:', error);
    }
  };

  if (!isARSupported) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AR Not Supported</h3>
          <p className="text-gray-600 mb-4">
            Your device doesn't support AR features. You can still view the maintenance instructions.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Close
            </button>
            <button
              onClick={() => setIsARSupported(true)} // Force enable for demo
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Continue Anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">AR Maintenance Guide</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          ✕
        </button>
      </div>

      {/* AR View */}
      <div className="flex-1 relative">
        {isStreaming ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
            />
            
            {/* AR Overlays */}
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-black bg-opacity-75 text-white p-3 rounded-lg">
                <h3 className="font-semibold">{maintenanceSteps[currentStep]?.title}</h3>
                <p className="text-sm opacity-90">{maintenanceSteps[currentStep]?.description}</p>
              </div>
            </div>

            {/* AR Markers */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Temperature measurement point */}
              <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-8 h-8 border-4 border-red-500 rounded-full animate-pulse">
                  <div className="w-full h-full border-2 border-white rounded-full"></div>
                </div>
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                  Temp: 45°C
                </div>
              </div>

              {/* Vibration check point */}
              <div className="absolute top-2/3 right-1/4">
                <div className="w-6 h-6 border-2 border-yellow-500 rounded-full animate-bounce">
                  <div className="w-full h-full border border-white rounded-full"></div>
                </div>
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                  Vib: Normal
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start AR Maintenance</h3>
              <p className="text-gray-600 mb-4">Point your camera at the equipment to begin</p>
              <button
                onClick={startARStream}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Start Camera
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions Panel */}
      <div className="bg-white border-t max-h-80 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Step {currentStep + 1} of {maintenanceSteps.length}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={previousStep}
                disabled={currentStep === 0}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={nextStep}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                {currentStep === maintenanceSteps.length - 1 ? 'Complete' : 'Next'}
              </button>
            </div>
          </div>

          {maintenanceSteps[currentStep] && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Instructions:</h4>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  {maintenanceSteps[currentStep].instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Required Tools:</h4>
                  <ul className="list-disc list-inside text-gray-700">
                    {maintenanceSteps[currentStep].tools.map((tool, index) => (
                      <li key={index}>{tool}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Safety Notes:</h4>
                  <ul className="list-disc list-inside text-red-600">
                    {maintenanceSteps[currentStep].safetyNotes.map((note, index) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Estimated time: {maintenanceSteps[currentStep].estimatedTime} minutes</span>
                <span>Performed by: {user?.displayName}</span>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">✓</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Maintenance Completed!</h3>
              <p className="text-gray-600 mb-4">Great job! The maintenance has been recorded.</p>
              <button
                onClick={completeMaintenance}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save & Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
