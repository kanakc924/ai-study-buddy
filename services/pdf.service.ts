const pdfParse = require("pdf-parse");

export const extractTextFromPdf = async (fileBuffer: Buffer): Promise<string> => {
  try {
    const data = await pdfParse(fileBuffer);
    return data.text;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to parse PDF file");
  }
};
