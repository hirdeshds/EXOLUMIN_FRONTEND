const ML_API_URL = 'https://exolumin-ml-backend.onrender.com/predict';

export const predictExoplanet = async (features: number[]): Promise<number> => {
  try {
    const response = await fetch(ML_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ features }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.probability || data.prediction || 0.5;
  } catch (error) {
    console.error('Prediction error:', error);
    throw new Error('Failed to connect to ML model. Please try again.');
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
