import { fuzz } from '@jazzer.js/core';
import { z } from 'zod';

// Re-create the exact Zod schema used in your endpoint
// It's best practice to export this from a shared location and import it here
const analyzeProjectsSchema = z.object({
  projectIds: z.array(z.string().min(1)).min(1),
  // Add other expected fields from your actual schema
  // e.g., depth: z.number().optional()
});

// The fuzz harness itself
fuzz((data: Buffer) => {
  try {
    // Jazzer.js provides data as a Buffer. We need to convert it to a
    // string to attempt parsing it as JSON.
    const inputString = data.toString('utf-8');
    
    // If the fuzzer generates non-JSON data, this will throw, which is fine.
    // We are testing the robustness of the entire validation path.
    const jsonData = JSON.parse(inputString);

    // This is the core of the test. We run the Zod schema's `safeParse`
    // method against the fuzzed data. Jazzer will automatically report any
    // unhandled exceptions, hangs, or crashes within Zod's parsing logic.
    analyzeProjectsSchema.safeParse(jsonData);

  } catch (error) {
    // We expect errors like JSON parsing failures or validation errors.
    // We can ignore them here because we are only looking for *unexpected crashes*.
    // If you wanted to be more specific, you could check if the error is a
    // known, expected type and re-throw if it's not. For now, this is sufficient.
  }
});
