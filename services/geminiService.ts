import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION_SVG = `
You are a world-class vector graphic expert and technical artist. 
Your task is to convert raster images (PNG/JPG) into clean, efficient, and semantic SVG code.
- Analyze the input image shapes, colors, and composition.
- Generate valid XML SVG code that visually reproduces the image.
- Use <path>, <rect>, <circle>, <polygon> elements effectively.
- Optimize the paths to be "low poly" or "vector art" style if the image is complex, ensuring it looks like a clean vector illustration.
- Match colors accurately using hex codes.
- Do NOT use <img> tags to embed the raster image. You must DRAW it with vector shapes.
- Output ONLY the raw SVG code. Do not include markdown code fences (like \`\`\`xml).
`;

const SYSTEM_INSTRUCTION_EPS = `
You are a PostScript programming expert.
Your task is to convert SVG XML code into a valid Encapsulated PostScript (EPS) file.
- Translate the SVG paths, fills, and strokes into standard PostScript commands.
- Ensure the output starts with the correct EPS header (e.g., %!PS-Adobe-3.0 EPSF-3.0).
- Calculate the BoundingBox based on the SVG viewbox or dimensions.
- Output ONLY the raw EPS code. Do not include markdown code fences.
`;

export const generateSvgFromImage = async (base64Image: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Image,
            },
          },
          {
            text: "Trace this image into a clean, flat vector SVG. Maintain the main shapes and colors. Simplification is acceptable for a cleaner vector look. Output raw SVG code only.",
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_SVG,
        temperature: 0.3, // Lower temperature for more deterministic code generation
      },
    });

    const text = response.text || "";
    // Clean up any potential markdown fences if the model ignores the instruction
    return text.replace(/```svg/g, '').replace(/```xml/g, '').replace(/```/g, '').trim();
  } catch (error) {
    console.error("Gemini SVG generation error:", error);
    throw new Error("Failed to generate SVG vector.");
  }
};

export const convertSvgToEps = async (svgCode: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            text: `Convert this SVG code to EPS format:\n\n${svgCode}`,
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_EPS,
        temperature: 0.1,
      },
    });

    const text = response.text || "";
    return text.replace(/```eps/g, '').replace(/```/g, '').trim();
  } catch (error) {
    console.error("Gemini EPS conversion error:", error);
    throw new Error("Failed to convert SVG to EPS.");
  }
};
