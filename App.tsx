import React, { useState, useEffect } from 'react';
import { UploadZone } from './components/UploadZone';
import { ResultView } from './components/ResultView';
import { generateSvgFromImage, convertSvgToEps } from './services/geminiService';
import { ConversionStatus, ImageFile } from './types';
import { Zap, Loader2, Info } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<ConversionStatus>(ConversionStatus.IDLE);
  const [image, setImage] = useState<ImageFile | null>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [epsContent, setEpsContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = async (selectedImage: ImageFile) => {
    setImage(selectedImage);
    setStatus(ConversionStatus.ANALYZING);
    setError(null);
    setSvgContent("");
    setEpsContent("");

    try {
      // Step 1: Generate SVG
      setStatus(ConversionStatus.GENERATING_SVG);
      const svg = await generateSvgFromImage(selectedImage.base64);
      setSvgContent(svg);
      setStatus(ConversionStatus.COMPLETED);
    } catch (err) {
      console.error(err);
      setError("Failed to generate vector. Please try a different image or try again.");
      setStatus(ConversionStatus.ERROR);
    }
  };

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vector_${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadEps = async () => {
    if (!svgContent) return;

    // If we already have the EPS, just download it
    if (epsContent) {
      downloadEpsFile(epsContent);
      return;
    }

    try {
      setStatus(ConversionStatus.GENERATING_EPS);
      const eps = await convertSvgToEps(svgContent);
      setEpsContent(eps);
      downloadEpsFile(eps);
      setStatus(ConversionStatus.COMPLETED);
    } catch (err) {
      console.error(err);
      setError("Failed to convert to EPS. You can still download the SVG.");
      setStatus(ConversionStatus.COMPLETED); // Revert to completed state so SVG is still accessible
    }
  };

  const downloadEpsFile = (content: string) => {
    const blob = new Blob([content], { type: 'application/postscript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vector_${Date.now()}.eps`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setImage(null);
    setSvgContent("");
    setEpsContent("");
    setStatus(ConversionStatus.IDLE);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-brand-500/30">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Vector<span className="text-brand-400">Shift</span>
            </span>
          </div>
          <div className="text-xs sm:text-sm font-medium text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
            Powered by Gemini 2.5
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Intro */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Convert PNG to Vector EPS
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Transform your raster images into scalable SVG and EPS vectors instantly using AI-powered tracing.
          </p>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Upload & Original */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-2xl p-1 border border-slate-800 shadow-xl">
               <div className="bg-slate-800/50 rounded-xl overflow-hidden">
                {image ? (
                  <div className="relative group">
                    <img 
                      src={image.preview} 
                      alt="Original" 
                      className="w-full h-auto max-h-[500px] object-contain bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" 
                    />
                     <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
                        Original Raster
                     </div>
                     <button 
                        onClick={handleReset}
                        className="absolute top-2 right-2 bg-slate-900/80 hover:bg-red-500/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                        title="Remove image"
                     >
                        <Zap className="w-4 h-4 rotate-45" />
                     </button>
                  </div>
                ) : (
                  <UploadZone onImageSelected={handleImageSelected} disabled={status !== ConversionStatus.IDLE} />
                )}
               </div>
            </div>

            {/* Status Messages */}
            {status !== ConversionStatus.IDLE && status !== ConversionStatus.COMPLETED && status !== ConversionStatus.ERROR && (
               <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex items-center gap-4 animate-pulse">
                  <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
                  <div>
                    <h4 className="font-semibold text-slate-200">Processing Image</h4>
                    <p className="text-slate-400 text-sm">
                      {status === ConversionStatus.ANALYZING && "Analyzing visuals..."}
                      {status === ConversionStatus.GENERATING_SVG && "Tracing paths and shapes..."}
                      {status === ConversionStatus.GENERATING_EPS && "Converting to PostScript format..."}
                    </p>
                  </div>
               </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-400">Conversion Failed</h4>
                  <p className="text-red-300/80 text-sm">{error}</p>
                  <button 
                    onClick={() => handleImageSelected(image!)} 
                    className="mt-2 text-xs font-semibold text-red-400 hover:text-red-300 underline"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Result */}
          <div className="lg:h-[600px]">
            {svgContent ? (
              <ResultView 
                svgContent={svgContent}
                epsContent={epsContent}
                status={status}
                onDownloadSvg={handleDownloadSvg}
                onDownloadEps={handleDownloadEps}
                onReset={handleReset}
              />
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-900 rounded-2xl border border-slate-800 border-dashed text-slate-500 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-300 mb-2">Ready to Vectorize</h3>
                <p className="max-w-xs mx-auto text-sm">
                  Upload an image on the left to see the AI-generated vector result here.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
