import sharp from "sharp";
import path from "path";
import fs from "fs";

export const processImage = async (filePath: string): Promise<string> => {
  const filename = path.basename(filePath, path.extname(filePath));
  const processedFilePath = path.join(path.dirname(filePath), `${filename}_processed.jpg`);
  
  try {
    const resizedImage = await sharp(filePath)
      .resize(800, 600, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ 
        quality: 80,
        mozjpeg: true 
      })
      .toBuffer();

    const metadata = await sharp(resizedImage).metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 600;

    const svgWatermark = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <text x="${width / 2}" y="${height - 30}" text-anchor="middle" 
              font-family="Arial" font-size="24" 
              fill="rgba(255,255,255,0.7)" font-weight="bold">Ивановский</text>
      </svg>
    `;

    await sharp(resizedImage)
      .composite([
        {
          input: Buffer.from(svgWatermark),
          blend: "over",
        },
      ])
      .toFile(processedFilePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return processedFilePath;
  } catch (error) {
    console.error("Ошибка обработки изображения", error);
    return filePath;
  }
};