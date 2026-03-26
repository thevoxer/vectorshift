import React from 'react';
import { Download, FileCode, Check, RefreshCw } from 'lucide-react';
import { ConversionStatus } from '../types';

interface ResultViewProps {
  svgContent: string;
  epsContent?: string;
  status: ConversionStatus;
  onDownloadSvg: () => void;
  onDownloadEps: () => void;
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  svgContent,
  epsContent,
  status,
  onDownloadSvg,
  onDownloadEps,
  onReset,
}) => {
  const isGeneratingEps = status === ConversionStatus.GENERATING_EPS;
  const isCompleted = status === ConversionStatus.COMPLETED;

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
          <FileCode className="w-4 h-4 text-brand-400" />
          Vector Preview
        </h3>
        <div className="flex gap-2">
           <button
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Start Over"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-6 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-slate-800 relative overflow-hidden">
        {/* Checkerboard pattern for transparency */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ 
               backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', 
               backgroundSize: '20px 20px' 
             }} 
        />
        
        <div 
          className="relative z-10 w-full h-full flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: svgContent }} 
        />
      </div>

      {/* Action Bar */}
      <div className="bg-slate-900 p-4 border-t border-slate-700 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onDownloadSvg}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          Download SVG
        </button>

        <button
          onClick={onDownloadEps}
          disabled={isGeneratingEps}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
            rounded-xl font-medium transition-all active:scale-[0.98]
            ${epsContent 
              ? 'bg-green-600 hover:bg-green-500 text-white' 
              : 'bg-brand-600 hover:bg-brand-500 text-white'
            }
            ${isGeneratingEps ? 'opacity-75 cursor-wait' : ''}
          `}
        >
          {isGeneratingEps ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Converting to EPS...
            </>
          ) : epsContent ? (
            <>
              <Check className="w-4 h-4" />
              Download EPS Again
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Convert & Download EPS
            </>
          )}
        </button>
      </div>
    </div>
  );
};
