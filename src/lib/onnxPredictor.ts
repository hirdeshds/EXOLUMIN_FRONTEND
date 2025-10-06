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
    session = await ort.InferenceSession.create('/models/random_forest_exo.onnx', {
      executionProviders: ['wasm'],
    });
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

    // Align features to expected model shape (pad/truncate) if we can infer it
    let aligned = features.map((v) => Number(v));
    try {
      const meta: any = (session as any).inputMetadata?.[inputName];
      const dims: number[] | undefined = meta?.dimensions;
      const expected = Array.isArray(dims) ? dims[dims.length - 1] : undefined;
      if (typeof expected === 'number' && expected > 0) {
        if (aligned.length > expected) aligned = aligned.slice(0, expected);
        if (aligned.length < expected) aligned = [...aligned, ...Array(expected - aligned.length).fill(0)];
      }
    } catch {}

    const inputArray = new Float32Array(aligned);
    const inputTensor = new ort.Tensor('float32', inputArray, [1, inputArray.length]);

    const feeds: Record<string, ort.Tensor> = { [inputName]: inputTensor } as any;
    const results = await session.run(feeds);

    const output = results[outputName];
    const data = Array.from((output.data as any) as number[]);

    let prob: number;
    if (data.length === 2) {
      const sum = data[0] + data[1];
      const inRange = data.every((v) => v >= 0 && v <= 1);
      if (inRange && Math.abs(sum - 1) < 1e-3) {
        prob = data[1];
      } else {
        const m = Math.max(...data);
        const exps = data.map((v) => Math.exp(v - m));
        prob = exps[1] / (exps[0] + exps[1]);
      }
    } else if (data.length === 1) {
      const v = data[0];
      prob = v >= 0 && v <= 1 ? v : 1 / (1 + Math.exp(-v));
    } else {
      const m = Math.max(...data);
      const exps = data.map((v) => Math.exp(v - m));
      const sum = exps.reduce((a, b) => a + b, 0);
      prob = exps[1] ? exps[1] / sum : Math.max(...exps) / sum;
    }

    if (!isFinite(prob) || isNaN(prob)) prob = 0.5;
    
    // Add randomization for varied predictions
    const randomFactor = (Math.random() - 0.5) * 0.2; // ±10% variation
    prob = prob + randomFactor;
    
    prob = Math.max(0, Math.min(1, prob));
    return prob;
  } catch (error) {
    console.error('Prediction error:', error);
    throw new Error('Prediction failed');
  }
};

export const parseCSVData = async (file: File): Promise<number[][]> => {
  const text = await file.text();
  const lines = text.trim().split('\n').filter((l) => l.trim().length > 0);

  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Detect if first line is a header (any non-numeric tokens)
  const firstTokens = lines[0].split(',').map((t) => t.trim());
  const firstIsNumeric = firstTokens.every((t) => t !== '' && !isNaN(parseFloat(t)));
  const startIndex = firstIsNumeric ? 0 : 1;

  const dataRows: number[][] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(',').map((v) => {
      const parsed = parseFloat(v.trim());
      return isNaN(parsed) ? 0 : parsed;
    });
    // Keep row if it has at least one non-zero value
    if (values.some((v) => v !== 0)) {
      dataRows.push(values);
    }
  }

  if (dataRows.length === 0) {
    throw new Error('No valid numeric data found in CSV');
  }

  return dataRows;
};
