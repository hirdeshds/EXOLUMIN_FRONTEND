import * as ort from 'onnxruntime-web';

// Configure ORT Web to load WASM from CDN and avoid multi-threading (needs COOP/COEP)
if (typeof window !== 'undefined') {
  try {
    // Use the exact installed version to prevent 404s
    ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.0/dist/';
    ort.env.wasm.numThreads = 1; // single-threaded for broader compatibility
    ort.env.wasm.simd = true;    // enable SIMD when available
  } catch (e) {
    console.warn('ORT env config failed:', e);
  }
}

let session: ort.InferenceSession | null = null;

export const initializeModel = async (): Promise<void> => {
  if (session) return;
  try {
    session = await ort.InferenceSession.create('/models/random_forest_exo.onnx');
    console.log('ONNX model loaded successfully');
  } catch (error) {
    console.error('Failed to load ONNX model:', error);
    throw new Error('Failed to initialize ML model');
  }
};

export const predictExoplanet = async (features: number[]): Promise<number> => {
  try {
    if (!session) await initializeModel();
    if (!session) throw new Error('Model not initialized');

    const inputName = session.inputNames?.[0];
    const outputName = session.outputNames?.[0];

    const inputArray = new Float32Array(features.map((v) => Number(v)));
    const inputTensor = new ort.Tensor('float32', inputArray, [1, features.length]);

    const feeds: Record<string, ort.Tensor> = { [inputName]: inputTensor } as any;
    const results = await session.run(feeds);

    const output = results[outputName];
    const data = Array.from((output.data as any) as number[]);

    let prob = data.length === 1 ? data[0] : (data[1] ?? Math.max(...data));
    if (isNaN(prob)) prob = 0.5;
    prob = Math.max(0, Math.min(1, prob));
    return prob;
  } catch (error) {
    console.error('Prediction error:', error);
    throw new Error('Prediction failed');
  }
};

export const parseCSVData = async (file: File): Promise<number[][]> => {
  const text = await file.text();
  const lines = text.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV file must have header and at least one data row');
  }
  
  // Skip header, parse data rows - flexible column count
  const dataRows: number[][] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',').map(v => {
      const trimmed = v.trim();
      // Skip non-numeric columns
      const parsed = parseFloat(trimmed);
      return isNaN(parsed) ? 0 : parsed;
    });
    
    // Filter out rows with no numeric data
    const numericValues = values.filter(v => v !== 0 || Math.random() > 0.5);
    if (numericValues.length > 0) {
      dataRows.push(numericValues);
    }
  }
  
  if (dataRows.length === 0) {
    throw new Error('No valid numeric data found in CSV');
  }
  
  return dataRows;
};
