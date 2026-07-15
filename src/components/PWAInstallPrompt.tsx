import React, { useState, useEffect, useCallback } from 'react';
import { X, Download, Smartphone, Check, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check if app is already installed
  useEffect(() => {
    const checkInstalled = () => {
      // Check if running as standalone PWA
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    checkInstalled();

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Auto-show prompt
      setTimeout(() => {
        if (!isDismissed && !isInstalled) {
          setShowPrompt(true);
        }
      }, 1000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isDismissed, isInstalled]);

  // Handle install click
  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) {
      alert('To install malazone:\n\n1. Tap the menu button (⋮) in your browser\n2. Select "Add to Home screen"\n3. Tap "Add" when prompted');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowPrompt(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('PWAInstallPrompt: Error during install:', error);
    }
  }, [deferredPrompt]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    setIsDismissed(true);
    // Store dismissal to not show again for 7 days
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  }, []);

  // Check if previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const daysSince = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        setIsDismissed(true);
      } else {
        localStorage.removeItem('pwa-prompt-dismissed');
      }
    }
  }, []);

  return (
    <>
      {/* Main Install Prompt */}
      {showPrompt && !isInstalled && (
        <div className="fixed top-4 right-4 z-[9998] animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 w-80">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00A86B] to-[#008f5a] flex items-center justify-center shadow-lg">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0B132B] text-base">Install malazone</h3>
                  <p className="text-xs text-slate-500">Add to home screen</p>
                </div>
              </div>
              <button 
                onClick={handleDismiss}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors -mt-1 -mr-1"
                aria-label="Close prompt"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* App Preview */}
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0B132B] to-[#1a2a4a] flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-[#0B132B] text-sm">malazone</h4>
                <p className="text-xs text-slate-500">Zero-Commission Marketplace</p>
                <div className="flex items-center gap-1 mt-1">
                  <Check className="w-3 h-3 text-[#00A86B]" />
                  <span className="text-[10px] text-[#00A86B] font-medium">Works offline</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Sparkles className="w-3.5 h-3.5 text-[#00A86B]" />
                <span>Fast launch from home screen</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Check className="w-3.5 h-3.5 text-[#00A86B]" />
                <span>Full access offline</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button 
                onClick={handleDismiss}
                className="flex-1 h-11 px-4 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Not now
              </button>
              <button 
                onClick={handleInstall}
                className="flex-1 h-11 px-4 text-sm font-bold text-white bg-[#00A86B] rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" />
                Install
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallPrompt;