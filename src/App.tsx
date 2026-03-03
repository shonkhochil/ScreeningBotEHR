import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { FileText, Activity, AlertCircle, Loader2 } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [inputText, setInputText] = useState('');
  const [report, setReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    setError('');
    setReport('');

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: inputText,
        config: {
          systemInstruction: `You are a highly advanced Clinical Text Analyzer and Health Educator prototype. Your objective is to read unstructured patient medical records (specifically History & Physical notes or Discharge Summaries), extract relevant demographic and historical risk factors, and recommend which cancer screening tests the patient should discuss with their physician based strictly on USPSTF and ACS guidelines.

Critical Safety Guardrails:
1. Prototype Disclaimer: Every response MUST begin with exactly: *"Welcome. Please note: This application is a prototype and a testing tool, not a medical device. It cannot diagnose, treat, or provide definitive medical advice. It analyzes text to provide educational information. All recommendations must be discussed with a licensed physician."*
2. No Definitive Advice: Use phrases like "Based on your clinical note, guidelines recommend discussing..."
3. Strict Adherence: Base recommendations solely on USPSTF and ACS guidelines.

Workflow Instructions:
Step 1: Text Ingestion & Parsing
Silently read and analyze the text to extract the following:
* Age and Sex assigned at birth.
* Past Medical History (PMHx): Look for history of cancer, precancerous polyps, inflammatory bowel disease, or genetic markers (like BRCA).
* Family History (FamHx): Look for first-degree relatives with cancer and their age of diagnosis.
* Social History (SocHx): Look for smoking history (pack-years, current status, or years since quitting).

Step 2: Guideline Application
Match the extracted entities against the current USPSTF and ACS screening guidelines for Breast, Colorectal, Lung, Cervical, and Prostate cancer. Determine if the patient is at Average or High Risk.

Step 3: The Output Report
Generate a structured, patient-friendly report formatted in Markdown:
* **Prototype Disclaimer**: (Must be the exact text specified above)
* **Information Extracted**: Briefly summarize the key risk factors you found in the text.
* **What to Discuss with Your Doctor**: A bulleted list of the specific cancer screenings they appear eligible for.
* **The "Why"**: Explain in plain English why the guidelines recommend this based on their specific chart data.
* **Missing Information**: If the clinical note is missing key data, explicitly tell the user what is missing.

Tone:
Empathetic, highly organized, and accessible (6th-8th grade reading level). Translate clinical jargon.`,
        },
      });

      setReport(response.text || 'No report generated.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      <header className="bg-white border-b border-stone-200 py-4 px-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-stone-900">Clinical Text Analyzer</h1>
            <p className="text-sm text-stone-500">Cancer Screening Educator Prototype</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <section className="flex flex-col gap-4 h-[calc(100vh-8rem)]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <FileText size={20} className="text-stone-400" />
              Clinical Note
            </h2>
            <button
              onClick={() => setInputText('Patient is a 55-year-old male presenting for annual physical. \nPMHx: Hypertension, hyperlipidemia. No history of cancer or IBD. \nFamHx: Father diagnosed with colon cancer at age 62. \nSocHx: Former smoker, quit 5 years ago. Smoked 1 pack per day for 20 years. Occasional alcohol.')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Load Example
            </button>
          </div>
          
          <div className="flex-1 relative rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste patient History & Physical note or Discharge Summary here..."
              className="w-full h-full p-4 resize-none outline-none text-stone-700 placeholder:text-stone-400 leading-relaxed"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!inputText.trim() || isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Analyzing Note...
              </>
            ) : (
              'Analyze Clinical Note'
            )}
          </button>
        </section>

        {/* Output Section */}
        <section className="flex flex-col gap-4 h-[calc(100vh-8rem)]">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Activity size={20} className="text-stone-400" />
            Analysis Report
          </h2>
          
          <div className="flex-1 rounded-xl border border-stone-200 bg-white shadow-sm overflow-y-auto p-6">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3 mb-4">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            {!report && !isLoading && !error && (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 text-center space-y-4">
                <FileText size={48} className="opacity-20" />
                <p className="max-w-sm">
                  Paste a clinical note and click Analyze to generate a patient-friendly cancer screening report.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-emerald-600 space-y-4">
                <Loader2 size={48} className="animate-spin opacity-50" />
                <p className="text-sm font-medium animate-pulse">Processing clinical data...</p>
              </div>
            )}

            {report && !isLoading && (
              <div className="prose prose-stone prose-emerald max-w-none prose-headings:font-medium prose-a:text-emerald-600">
                <Markdown>{report}</Markdown>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
