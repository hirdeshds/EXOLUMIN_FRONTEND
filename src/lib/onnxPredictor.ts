import * as ort from 'onnxruntime-web';

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
  if (!session) {
    await initializeModel();
  }
  
  if (!session) {
    throw new Error('Model not initialized');
  }

  try {
    // Expected 17 features in order:
    // koi_score, koi_fpflag_nt, koi_fpflag_ss, koi_fpflag_co, koi_fpflag_ec,
    // koi_period, koi_time0bk, koi_impact, koi_duration, koi_depth,
    // koi_prad, koi_teq, koi_insol, koi_model_snr, koi_steff, koi_slogg, koi_srad
    
    if (features.length !== 17) {
      throw new Error(`Expected 17 features, got ${features.length}`);
    }

    // Create tensor from features
    const inputTensor = new ort.Tensor('float32', new Float32Array(features), [1, 17]);
    
    // Run inference
    const feeds = { float_input: inputTensor };
    const results = await session.run(feeds);
    
    // Get probability output
    const output = results.output_probability;
    const probabilities = output.data as Float32Array;
    
    // Return probability of being an exoplanet (class 1)
    return probabilities[1] || probabilities[0];
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
  
  // Skip header, parse data rows
  const dataRows: number[][] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',').map(v => parseFloat(v.trim()));
    
    if (values.length !== 17) {
      throw new Error(`Row ${i} must have exactly 17 columns, found ${values.length}`);
    }
    
    if (values.some(v => isNaN(v))) {
      throw new Error(`Row ${i} contains non-numeric values`);
    }
    
    dataRows.push(values);
  }
  
  if (dataRows.length === 0) {
    throw new Error('No valid data rows found in CSV');
  }
  
  return dataRows;
};
